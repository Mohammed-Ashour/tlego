import { commonWindow, sampleAt } from "./viewer-state.js";
function initViewer(THREE, OrbitControls, land) {
  const byId = (id) => document.getElementById(id);
  const text = (id, value) => {
    byId(id).textContent = value;
  };
  const failure = (message) => {
    const box = byId("scene-error");
    box.hidden = false;
    box.textContent = message;
    byId("play-toggle").disabled = true;
    text("system-status", "VIEW UNAVAILABLE");
  };
  let data;
  try {
    data = JSON.parse(byId("orbit-data").textContent);
  } catch {
    failure("The orbit data could not be read. Generate this file again.");
    return;
  }
  const satellites = data.satellites;
  let domain;
  try {
    domain = commonWindow(satellites);
  } catch (error) {
    failure(error.message);
    return;
  }
  let now = domain.start, selected = 0, playing = false, previous = 0;
  let renderer, scene, camera, controls, earthGroup;
  const bodies = [];
  const container = byId("scene");
  const scrubber = byId("time-scrubber"), play = byId("play-toggle");
  const utc = (t) => new Date(t).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
  const clock = (t) => new Date(t).toISOString().slice(11, 19);
  const position = (p) => new THREE.Vector3(p.x / data.earth_radius_km, p.z / data.earth_radius_km, -p.y / data.earth_radius_km);
  const number = (value, digits = 1) => Number(value).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  text("mission-label", `${satellites.length} ${satellites.length === 1 ? "orbit" : "orbits"}`);
  text("satellite-count", satellites.length);
  text("scene-summary", `UTC playback \xB7 ${number((domain.end - domain.start) / 6e4)} minute shared window`);
  text("earth-radius", `${number(data.earth_radius_km, 0)} km`);
  text("time-start", clock(domain.start));
  text("time-end", clock(domain.end));
  scrubber.max = String(Math.floor((domain.end - domain.start) / 1e3));
  byId("playback-speed").value = "60";
  const list = byId("satellite-list");
  satellites.forEach((sat, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "satellite-option";
    button.style.setProperty("--sat-color", sat.color);
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === 0));
    button.setAttribute("aria-label", `Select ${sat.name}`);
    const dot = document.createElement("span");
    dot.className = "option-dot";
    dot.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "option-name";
    label.textContent = sat.name;
    label.title = sat.name;
    const id = document.createElement("span");
    id.className = "option-id";
    id.textContent = sat.norad_id || "";
    button.append(dot, label, id);
    button.addEventListener("click", () => select(index));
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = (selected + (event.key === "ArrowDown" ? 1 : -1) + satellites.length) % satellites.length;
        select(next);
        list.children[next].focus();
      }
    });
    list.append(button);
  });
  function select(index) {
    selected = index;
    const sat = satellites[index];
    [...list.children].forEach((button, i) => button.setAttribute("aria-selected", String(index === i)));
    text("selected-name", sat.name);
    byId("selected-name").title = sat.name;
    text("viewer-announcement", `Selected ${sat.name}`);
    text("selected-norad", sat.norad_id || "Not supplied");
    const hasEpoch = sat.epoch && !sat.epoch.startsWith("0001-");
    text("selected-epoch", hasEpoch ? utc(sat.epoch) : "Not supplied");
    byId("selected-epoch").title = byId("selected-epoch").textContent;
    byId("selected-swatch").style.setProperty("--sat-color", sat.color);
    const age = hasEpoch ? (domain.start - Date.parse(sat.epoch)) / 864e5 : 0;
    const old = Math.abs(age) > 3 ? ` Elements are ${number(Math.abs(age))} days from the displayed start.` : "";
    const step = (Date.parse(sat.points.at(-1).time) - Date.parse(sat.points[0].time)) / (sat.points.length - 1) / 1e3;
    text("sampling-note", `${sat.points.length} samples, about ${number(step, 0)} s apart. Between-sample positions are interpolated. Globe shading is illustrative.${old}`);
    bodies.forEach((body, i) => {
      body.line.material.opacity = i === index ? 0.95 : 0.32;
      body.marker.scale.setScalar(i === index ? 1.35 : 1);
    });
    update();
  }
  function setPlaying(value) {
    playing = value;
    play.setAttribute("aria-pressed", String(value));
    play.setAttribute("aria-label", value ? "Pause timeline" : "Play timeline");
    play.title = value ? "Pause timeline" : "Play timeline";
    play.firstElementChild.textContent = value ? "\u2161" : "\u25B6";
    const state = byId("timeline-state");
    state.classList.toggle("is-playing", value);
    state.lastElementChild.textContent = value ? "PLAYING" : "PAUSED";
  }
  function update() {
    const states = satellites.map((sat) => sampleAt(sat.points, now));
    if (earthGroup) earthGroup.rotation.y = states[0].gmst_rad;
    bodies.forEach((body, i) => body.marker.position.copy(position(states[i])));
    const p = states[selected];
    text("selected-lat", `${number(p.latitude_deg, 3)}\xB0`);
    text("selected-lon", `${number(p.longitude_deg, 3)}\xB0`);
    text("selected-alt", `${number(p.altitude_km)} km`);
    text("selected-speed", `${number(p.speed_km_s, 3)} km/s`);
    text("time-current", utc(now));
    scrubber.value = String(Math.round((now - domain.start) / 1e3));
    scrubber.setAttribute("aria-valuetext", utc(now));
    scrubber.style.setProperty("--progress", `${100 * (now - domain.start) / (domain.end - domain.start)}%`);
  }
  play.addEventListener("click", () => {
    if (now >= domain.end) now = domain.start;
    setPlaying(!playing);
    update();
  });
  scrubber.addEventListener("input", () => {
    setPlaying(false);
    now = Math.min(domain.end, domain.start + Number(scrubber.value) * 1e3);
    update();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPlaying(false);
    previous = 0;
  });
  select(0);
  setPlaying(false);
  try {
    let resetCamera = function() {
      const points = satellites[selected].points;
      const normal = new THREE.Vector3().crossVectors(position(points[0]), position(points[Math.max(1, Math.floor(points.length / 4))]));
      if (normal.lengthSq() < 1e-8) normal.set(0.68, 0.42, 0.76);
      if (normal.y < 0) normal.negate();
      const angle = Math.atan(Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect));
      const distance = Math.max(2, maximum / Math.sin(angle) * 1.35);
      camera.position.copy(normal.normalize().multiplyScalar(distance));
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
    }, frame = function(timestamp) {
      requestAnimationFrame(frame);
      const delta = previous ? Math.min((timestamp - previous) / 1e3, 1) : 0;
      previous = timestamp;
      if (playing) {
        now = Math.min(domain.end, now + delta * 1e3 * Number(byId("playback-speed").value));
        if (now === domain.end) setPlaying(false);
        update();
      }
      controls.update(delta);
      renderer.render(scene, camera);
    };
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1e4);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.append(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "Earth with sampled satellite trajectories. Drag to orbit, scroll to zoom. Camera buttons provide keyboard controls.");
    renderer.domElement.setAttribute("role", "img");
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.15;
    controls.maxDistance = 1e3;
    controls.autoRotateSpeed = 0.6;
    earthGroup = new THREE.Group();
    earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshPhongMaterial({ color: 665400, specular: 3495531, shininess: 12 })));
    scene.add(new THREE.AmbientLight(12904436, 1.1));
    const light = new THREE.DirectionalLight(13824255, 2.2);
    light.position.set(4, 3, 5);
    scene.add(light);
    const cartesian = (lon, lat) => {
      const a = lon * Math.PI / 180, b = lat * Math.PI / 180;
      return new THREE.Vector3(1.002 * Math.cos(b) * Math.cos(a), 1.002 * Math.sin(b), -1.002 * Math.cos(b) * Math.sin(a));
    };
    const line = (points, color, opacity) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 2) points.push(cartesian(lon, lat));
      earthGroup.add(line(points, 7910341, lat === 0 ? 0.25 : 0.1));
    }
    for (let lon = 0; lon < 360; lon += 30) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 2) points.push(cartesian(lon, lat));
      earthGroup.add(line(points, 7910341, 0.1));
    }
    for (const feature of land.features) {
      const geometry = feature.geometry;
      const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
      for (const polygon of polygons) for (const ring of polygon) earthGroup.add(line(ring.map((p) => cartesian(p[0], p[1])), 9357242, 0.64));
    }
    scene.add(earthGroup);
    let maximum = 1;
    satellites.forEach((sat) => {
      const points = sat.points.map(position);
      for (const point of points) maximum = Math.max(maximum, point.length());
      const trajectory = line(points, sat.color, 0.95);
      scene.add(trajectory);
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 12), new THREE.MeshBasicMaterial({ color: sat.color }));
      scene.add(marker);
      bodies.push({ line: trajectory, marker });
    });
    resetCamera();
    byId("camera-home").addEventListener("click", resetCamera);
    byId("zoom-in").addEventListener("click", () => {
      camera.position.multiplyScalar(0.8);
      if (camera.position.length() < controls.minDistance) camera.position.setLength(controls.minDistance);
      controls.update();
    });
    byId("zoom-out").addEventListener("click", () => {
      camera.position.multiplyScalar(1.25);
      if (camera.position.length() > controls.maxDistance) camera.position.setLength(controls.maxDistance);
      controls.update();
    });
    byId("rotate-toggle").addEventListener("click", () => {
      controls.autoRotate = !controls.autoRotate;
      byId("rotate-toggle").setAttribute("aria-pressed", String(controls.autoRotate));
      byId("rotate-toggle").setAttribute("aria-label", controls.autoRotate ? "Disable camera rotation" : "Enable camera rotation");
    });
    new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
      resetCamera();
    }).observe(container);
    renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      setPlaying(false);
      failure("The graphics context was lost. Reload this file to restore the globe. Orbit metadata remains available.");
    });
    text("system-status", "OFFLINE READY");
    select(0);
    requestAnimationFrame(frame);
  } catch (error) {
    failure("3D rendering is unavailable. Enable WebGL 2 in your browser, then reload. Satellite metadata remains available.");
    console.error(error);
  }
}
export {
  initViewer
};
