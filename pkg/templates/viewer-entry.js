import { AmbientLight, DirectionalLight, Vector3, Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, SphereGeometry, MeshPhongMaterial, BufferGeometry, Line, LineBasicMaterial, MeshBasicMaterial } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import land from "./earth-land.json";
import { initViewer } from "./viewer.js";
initViewer({ AmbientLight, DirectionalLight, Vector3, Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, SphereGeometry, MeshPhongMaterial, BufferGeometry, Line, LineBasicMaterial, MeshBasicMaterial }, OrbitControls, land);
