// The 3D scene. It knows TEME positions and times, not the rest of the app.
import { AmbientLight, BufferAttribute, BufferGeometry, CanvasTexture, DirectionalLight, Float32BufferAttribute, Group, Line, LineBasicMaterial, LineDashedMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, Points, PointsMaterial, Raycaster, Scene, SphereGeometry, SRGBColorSpace, Texture, Vector2, Vector3, WebGLRenderer, BackSide } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import land from '../../../pkg/templates/earth-land.json';
import { gmstAt, sampleAt } from '../../../pkg/templates/viewer-state.js';
import { trailRange } from './logic.js';
import { auroraRings } from './aurora.js';

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
  // A scene from the Sees tab. It is blue so it is not mistaken for the white observer marker.
  const pointMarker = new Mesh(new SphereGeometry(0.014, 12, 10), new MeshBasicMaterial({ color: 0x4da3ff }));
  pointMarker.visible = false;
  earth.add(pointMarker);
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

  // Imagery layers, bottom first. Each entry has { id, url, transparent, request, status,
  // texture, mesh }. The request is the setLayers call that last wanted the entry.
  let imageryStack = [];
  let layerRequest = 0;

  // Layers sit above the Earth and below the coastlines (1.002). The cap keeps them there.
  const LAYER_BASE_RADIUS = 1.001;
  const LAYER_STEP = 0.0001;
  const LAYER_TOP_RADIUS = 1.0019;

  function restackLayers() {
    imageryStack.forEach((entry, index) => {
      if (!entry.mesh) return;
      entry.mesh.scale.setScalar(Math.min(LAYER_TOP_RADIUS, LAYER_BASE_RADIUS + LAYER_STEP * (index + 1)));
      entry.mesh.renderOrder = index;
    });
  }

  function disposeLayer(entry) {
    if (!entry.mesh) return;
    earth.remove(entry.mesh);
    entry.mesh.geometry.dispose();
    entry.mesh.material.dispose();
    entry.texture.dispose();
    entry.mesh = null;
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('The image could not be loaded.'));
      image.src = url;
    });
  }

  // Feathers the alpha edge of a transparent picture so overlapping discs blend without hard
  // rims. A blurred copy of the picture masks the original, applied twice so the edge fades
  // fully. The blur also fades the picture's outer border, which is transparent in these
  // pictures. Where ctx.filter is unsupported the edge stays hard.
  function featherEdges(image) {
    const { naturalWidth: width, naturalHeight: height } = image;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    const mask = document.createElement('canvas');
    mask.width = width;
    mask.height = height;
    const maskContext = mask.getContext('2d');
    maskContext.filter = 'blur(10px)';
    maskContext.drawImage(image, 0, 0);

    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0);
    context.drawImage(mask, 0, 0);
    return canvas;
  }

  async function layerTexture(url, transparent) {
    const image = await loadImage(url);
    const texture = transparent ? new CanvasTexture(featherEdges(image)) : new Texture(image);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  function startLayer(layer, request) {
    const entry = { id: layer.id, url: layer.url, transparent: layer.transparent, request, status: null, texture: null, mesh: null };
    entry.status = layerTexture(layer.url, layer.transparent).then((texture) => {
      // A newer setLayers call that dropped this layer makes this load stale.
      if (entry.request !== layerRequest) {
        texture.dispose();
        return new Error('This layer was replaced before it loaded.');
      }
      entry.texture = texture;
      entry.mesh = new Mesh(
        new SphereGeometry(1, 96, 64),
        new MeshPhongMaterial({ map: texture, transparent: layer.transparent, depthWrite: !layer.transparent, specular: 0x111111, shininess: 6 }),
      );
      earth.add(entry.mesh);
      restackLayers();
      return 'ok';
    }, (error) => error);
    return entry;
  }

  // Sets the picture stack, bottom first. Layers already shown with the same id, url and
  // transparency are kept without reloading. Resolves to each id mapped to 'ok' or its Error.
  function setLayers(layers) {
    const request = ++layerRequest;
    const previous = imageryStack;
    const seen = new Set();
    const next = [];
    for (const layer of layers) {
      if (seen.has(layer.id)) continue;
      seen.add(layer.id);
      const transparent = Boolean(layer.transparent);
      const kept = previous.find((entry) => entry.id === layer.id && entry.url === layer.url && entry.transparent === transparent);
      if (kept) {
        kept.request = request;
        next.push(kept);
      } else {
        next.push(startLayer({ id: layer.id, url: layer.url, transparent }, request));
      }
    }
    for (const entry of previous) {
      if (!next.includes(entry)) disposeLayer(entry);
    }
    imageryStack = next;
    restackLayers();
    return Promise.all(next.map((entry) => entry.status.then((status) => [entry.id, status]))).then(Object.fromEntries);
  }

  // The rings are children of Earth, so they turn with it. Replaced on each call.
  let auroraLines = [];

  function setAurora(kp) {
    for (const line of auroraLines) {
      earth.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    auroraLines = [];
    if (!Number.isFinite(kp)) return;
    for (const ring of auroraRings(kp)) {
      const geometry = new BufferGeometry().setFromPoints(ring.map(({ lat, lon }) => surfacePoint(lat, lon, 1.004)));
      const material = new LineDashedMaterial({ color: 0x9fdcae, transparent: true, opacity: 0.8, dashSize: 0.03, gapSize: 0.02 });
      const line = new Line(geometry, material);
      line.computeLineDistances();
      earth.add(line);
      auroraLines.push(line);
    }
  }

  // Puts the camera on the side of Earth facing a direction, from a distance that keeps it in frame.
  function frameDirection(direction) {
    // Include the orbit's height, so high satellites stay in frame.
    const distance = Math.max(3.6, Math.min(controls.maxDistance, direction.length() * 2.6));
    camera.position.copy(direction.normalize().add(new Vector3(0, 0.35, 0)).normalize().multiplyScalar(distance));
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function home(id = selected) {
    const body = bodies.get(id);
    const direction = body ? body.marker.position.clone() : new Vector3(0.68, 0.42, 0.76);
    if (direction.lengthSq() < 1e-6) direction.set(0.68, 0.42, 0.76);
    frameDirection(direction);
  }

  function setFollowing(value) {
    following = value;
    controls.enableRotate = !value;
  }

  // Turns to the point where it is at the current time, and stops following the satellite.
  function showPoint(lat, lon) {
    pointMarker.position.copy(surfacePoint(lat, lon, 1.003));
    pointMarker.visible = true;
    setFollowing(false);
    // The point is a child of Earth, so its world position depends on the rotation for this time.
    earth.updateMatrixWorld(true);
    frameDirection(pointMarker.getWorldPosition(new Vector3()));
  }

  function clearPoint() {
    pointMarker.visible = false;
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
    setLayers,
    setAurora,
    setTrack,
    removeTrack,
    update,
    setObserver,
    setSightLine,
    selectedScreenPosition,
    home,
    showPoint,
    clearPoint,
    select(id) {
      selected = id;
      highlight();
    },
    setFollowing,
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
