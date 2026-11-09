// The 3D scene. It knows TEME positions and times, not the rest of the app.
import { AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Float32BufferAttribute, Group, Line, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, Points, PointsMaterial, Raycaster, Scene, SphereGeometry, SRGBColorSpace, TextureLoader, Vector2, Vector3, WebGLRenderer, BackSide } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import land from '../../../pkg/templates/earth-land.json';
import { gmstAt, sampleAt } from '../../../pkg/templates/viewer-state.js';
import { trailRange } from './logic.js';

const EARTH_RADIUS_KM = 6378.137;

const scenePosition = (p) => new Vector3(p.x / EARTH_RADIUS_KM, p.z / EARTH_RADIUS_KM, -p.y / EARTH_RADIUS_KM);

function surfacePoint(lat, lon, radius = 1.002) {
  const a = lon * Math.PI / 180;
  const b = lat * Math.PI / 180;
  return new Vector3(radius * Math.cos(b) * Math.cos(a), radius * Math.sin(b), -radius * Math.cos(b) * Math.sin(a));
}

function segments(paths, color, opacity) {
  const vertices = [];
  for (const path of paths) {
    for (let i = 0; i < path.length - 1; i += 1) {
      vertices.push(path[i].x, path[i].y, path[i].z, path[i + 1].x, path[i + 1].y, path[i + 1].z);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  return new LineSegments(geometry, new LineBasicMaterial({ color, transparent: true, opacity }));
}

function earthGroup() {
  const group = new Group();
  group.add(new Mesh(new SphereGeometry(1, 96, 64), new MeshPhongMaterial({ color: 0x123f5c, specular: 0x24566e, shininess: 14 })));
  const graticule = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const path = [];
    for (let lon = -180; lon <= 180; lon += 3) path.push(surfacePoint(lat, lon));
    graticule.push(path);
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const path = [];
    for (let lat = -90; lat <= 90; lat += 3) path.push(surfacePoint(lat, lon));
    graticule.push(path);
  }
  group.add(segments(graticule, 0x78b4c5, 0.1));
  const coasts = [];
  for (const feature of land.features) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const polygon of polygons) for (const ring of polygon) coasts.push(ring.map(([lon, lat]) => surfacePoint(lat, lon)));
  }
  group.add(segments(coasts, 0xd9deea, 0.8));
  return group;
}

// A fixed seed keeps the sky identical between reloads.
function stars() {
  const positions = [];
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 1600; i += 1) {
    const z = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z) * 400;
    positions.push(r * Math.cos(angle), r * Math.sin(angle), z * 400);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return new Points(geometry, new PointsMaterial({ color: 0xaebfcc, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.6 }));
}

export function createGlobe(container, { onPick, onSelect }) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.01, 2000);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.append(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Earth with the tracked satellites. Drag to rotate and scroll to zoom. The readouts beside the globe give the same information as text.');
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.2;
  controls.maxDistance = 60;

  scene.add(stars());
  const earth = earthGroup();
  scene.add(earth);
  const atmosphere = new Mesh(new SphereGeometry(1.025, 64, 48), new MeshBasicMaterial({ color: 0x4aa8d8, transparent: true, opacity: 0.09, side: BackSide }));
  scene.add(atmosphere);
  scene.add(new AmbientLight(0xb8cfe0, 0.55));
  const sunlight = new DirectionalLight(0xfff4e0, 2.6);
  sunlight.position.set(4, 3, 5);
  scene.add(sunlight);

  const observerMarker = new Mesh(new SphereGeometry(0.012, 12, 10), new MeshBasicMaterial({ color: 0xffffff }));
  observerMarker.visible = false;
  earth.add(observerMarker);
  const sightGeometry = new BufferGeometry();
  sightGeometry.setAttribute('position', new BufferAttribute(new Float32Array(6), 3));
  const sightLine = new Line(sightGeometry, new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
  sightLine.visible = false;
  sightLine.frustumCulled = false;
  scene.add(sightLine);

  const bodies = new Map();
  let selected = null;
  let following = false;
  let picking = false;
  let lastTime = 0;

  const imageryLoader = new TextureLoader();
  let imagery = null;
  let imageryRequest = 0;

  function clearImagery() {
    if (!imagery) return;
    earth.remove(imagery);
    imagery.material.map?.dispose();
    imagery.material.dispose();
    imagery.geometry.dispose();
    imagery = null;
  }

  // Drapes a worldwide equirectangular image on the Earth, or removes it. Coastlines
  // sit just above it, and a newer request replaces one still loading.
  function setImagery(url, transparent = false) {
    const request = ++imageryRequest;
    if (!url) {
      clearImagery();
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      imageryLoader.load(url, (texture) => {
        if (request !== imageryRequest) {
          texture.dispose();
          resolve();
          return;
        }
        texture.colorSpace = SRGBColorSpace;
        clearImagery();
        imagery = new Mesh(new SphereGeometry(1.001, 96, 64), new MeshPhongMaterial({ map: texture, transparent, specular: 0x111111, shininess: 6 }));
        earth.add(imagery);
        resolve();
      }, undefined, () => reject(new Error('The image could not be loaded.')));
    });
  }

  function home(id = selected) {
    const body = bodies.get(id);
    const direction = body ? body.marker.position.clone() : new Vector3(0.68, 0.42, 0.76);
    if (direction.lengthSq() < 1e-6) direction.set(0.68, 0.42, 0.76);
    // Include the orbit's height, so high satellites stay in frame.
    const distance = Math.max(3.6, Math.min(controls.maxDistance, direction.length() * 2.6));
    camera.position.copy(direction.normalize().add(new Vector3(0, 0.35, 0)).normalize().multiplyScalar(distance));
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function setTrack(id, track, color) {
    removeTrack(id);
    const positions = new Float32Array(track.samples.length * 3);
    track.samples.forEach((sample, index) => {
      const position = scenePosition(sample);
      positions.set([position.x, position.y, position.z], index * 3);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const line = new Line(geometry, new LineBasicMaterial({ color, transparent: true, opacity: 0.4 }));
    line.frustumCulled = false;
    const marker = new Mesh(new SphereGeometry(0.014, 16, 12), new MeshBasicMaterial({ color }));
    scene.add(line, marker);
    bodies.set(id, { line, marker, track });
    const sun = scenePosition(track.sun_km);
    sunlight.position.copy(sun.normalize().multiplyScalar(10));
    update(lastTime);
  }

  function removeTrack(id) {
    const body = bodies.get(id);
    if (!body) return;
    scene.remove(body.line, body.marker);
    body.line.geometry.dispose();
    body.line.material.dispose();
    body.marker.geometry.dispose();
    body.marker.material.dispose();
    bodies.delete(id);
  }

  function highlight() {
    for (const [id, body] of bodies) {
      const active = id === selected;
      body.line.material.opacity = active ? 0.95 : 0.3;
      body.marker.scale.setScalar(active ? 1.5 : 1);
    }
  }

  function update(time) {
    lastTime = time;
    earth.rotation.y = gmstAt(time);
    for (const body of bodies.values()) {
      const { samples } = body.track;
      body.marker.position.copy(scenePosition(sampleAt(samples, time)));
      // The trail changes slowly, and finding its range scans every sample.
      if (body.rangeAt === undefined || Math.abs(time - body.rangeAt) > 15000) {
        const range = trailRange(samples, time, body.track.period_minutes);
        body.line.geometry.setDrawRange(range.first, range.count);
        body.rangeAt = time;
      }
    }
    if (following && bodies.has(selected)) {
      const target = bodies.get(selected).marker.position;
      // Stay beyond the satellite, so it remains in front of the camera.
      const distance = Math.max(camera.position.length(), target.length() * 1.3);
      camera.position.copy(target.clone().normalize().multiplyScalar(distance));
    }
    highlight();
  }

  function setObserver(observer) {
    observerMarker.visible = Boolean(observer);
    if (observer) observerMarker.position.copy(surfacePoint(observer.lat, observer.lon, 1.003));
  }

  // Shown while the selected satellite is above the observer's horizon.
  function setSightLine(visible) {
    const body = bodies.get(selected);
    sightLine.visible = Boolean(visible && body && observerMarker.visible);
    if (!sightLine.visible) return;
    earth.updateMatrixWorld();
    const from = observerMarker.getWorldPosition(new Vector3());
    sightGeometry.attributes.position.setXYZ(0, from.x, from.y, from.z);
    sightGeometry.attributes.position.setXYZ(1, body.marker.position.x, body.marker.position.y, body.marker.position.z);
    sightGeometry.attributes.position.needsUpdate = true;
  }

  function screenPosition(worldPosition) {
    const rect = canvas.getBoundingClientRect();
    const projected = worldPosition.clone().project(camera);
    if (projected.z > 1) return null; // Behind the camera.
    return { x: (projected.x + 1) / 2 * rect.width, y: (1 - projected.y) / 2 * rect.height };
  }

  // True when Earth sits between the camera and this point.
  function hidden(worldPosition) {
    const toPoint = worldPosition.clone().sub(camera.position);
    const distance = toPoint.length();
    const direction = toPoint.normalize();
    const b = camera.position.dot(direction);
    const discriminant = b * b - camera.position.lengthSq() + 1;
    if (discriminant < 0) return false;
    const entry = -b - Math.sqrt(discriminant);
    return entry > 0 && entry < distance;
  }

  function selectedScreenPosition() {
    const body = bodies.get(selected);
    if (!body || hidden(body.marker.position)) return null;
    return screenPosition(body.marker.position);
  }

  function pickSurface(event) {
    const rect = canvas.getBoundingClientRect();
    const pointer = new Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const { origin, direction } = raycaster.ray;
    const b = origin.dot(direction);
    const discriminant = b * b - origin.lengthSq() + 1;
    if (discriminant < 0) return null;
    const point = origin.clone().add(direction.clone().multiplyScalar(-b - Math.sqrt(discriminant)));
    const local = earth.worldToLocal(point);
    const lat = Math.asin(Math.max(-1, Math.min(1, local.y / local.length()))) * 180 / Math.PI;
    let lon = Math.atan2(-local.z, local.x) * 180 / Math.PI;
    if (lon >= 180) lon -= 360;
    return { lat, lon };
  }

  function pickMarker(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best = null;
    let bestDistance = 18;
    for (const [id, body] of bodies) {
      if (hidden(body.marker.position)) continue;
      const position = screenPosition(body.marker.position);
      if (!position) continue;
      const distance = Math.hypot(position.x - x, position.y - y);
      if (distance < bestDistance) {
        best = id;
        bestDistance = distance;
      }
    }
    return best;
  }

  let pressed = null;
  canvas.addEventListener('pointerdown', (event) => {
    pressed = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!pressed || Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 5) return;
    if (picking) {
      const point = pickSurface(event);
      if (point) onPick(point);
      return;
    }
    const id = pickMarker(event);
    if (id) onSelect(id);
  });

  new ResizeObserver(() => {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
  }).observe(container);

  camera.position.set(2.4, 1.2, 2.8);
  controls.update();

  return {
    setImagery,
    setTrack,
    removeTrack,
    update,
    setObserver,
    setSightLine,
    selectedScreenPosition,
    home,
    select(id) {
      selected = id;
      highlight();
    },
    setFollowing(value) {
      following = value;
      controls.enableRotate = !value;
    },
    setPicking(value) {
      picking = value;
      canvas.classList.toggle('is-picking', value);
    },
    zoom(factor) {
      camera.position.multiplyScalar(factor);
      const length = camera.position.length();
      camera.position.setLength(Math.max(controls.minDistance, Math.min(controls.maxDistance, length)));
      controls.update();
    },
    render(delta) {
      controls.update(delta);
      renderer.render(scene, camera);
    },
    onContextChange(lost, restored) {
      // preventDefault lets the browser restore the context, and Three.js then rebuilds.
      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        lost();
      });
      canvas.addEventListener('webglcontextrestored', restored);
    },
  };
}
