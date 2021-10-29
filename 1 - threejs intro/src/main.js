import {
  BoxGeometry,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  PerspectiveCamera,
  ConeGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  MeshPhongMaterial,
  PointLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getInitialColor, rotateColor } from "./color";

// Cleanup for Parcel
document.getElementById("canvas")?.remove();

let renderer;
let scene;
let camera;
let controls;
let sphere;
let cube;
let pyramid;
let color = getInitialColor();

function createCube() {
  const geometry = new BoxGeometry();
  const material = new MeshPhongMaterial({ color: 0xffffff });
  geometry.rotateZ(Math.PI / 4);
  return new Mesh(geometry, material);
}

function createLine() {
  const leftPoint = new Vector3(-4, -2.8, 0);
  const topPoint = new Vector3(0, 3.6, 0);
  const rightPoint = new Vector3(4, -2.8, 0);
  const points = [leftPoint, topPoint, rightPoint, leftPoint];
  const geometry = new BufferGeometry().setFromPoints(points);

  const material = new LineBasicMaterial({ color: 0xffffff });

  return new Line(geometry, material);
}

let sphereScale = 30;
let sphereScaleIncrement = 1;

function createSphere() {
  const geometry = new SphereGeometry();
  const material = new MeshPhongMaterial({ color: 0xff00ff });

  geometry.scale(sphereScale / 100, sphereScale / 100, sphereScale / 100);
  sphereScale += sphereScaleIncrement;
  if (sphereScale === 70 || sphereScale === 30) {
    sphereScaleIncrement = -sphereScaleIncrement;
  }

  geometry.translate(0, 1.6, 0);
  return new Mesh(geometry, material);
}

function createPyramid() {
  const geometry = new ConeGeometry(1, 1, 4);
  geometry.translate(0, -1.5, 0);

  const material = new MeshPhongMaterial({ color: 0xff0ff });
  return new Mesh(geometry, material);
}

function init() {
  renderer = new WebGLRenderer();
  renderer.domElement.id = "canvas";
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  scene = new Scene();

  cube = createCube();
  scene.add(cube);
  sphere = createSphere(0, 1.5);
  scene.add(sphere);
  pyramid = createPyramid();
  scene.add(pyramid);
  scene.add(createLine());

  const light1 = new PointLight(0xffffff, 1, 100);
  light1.position.set(0, 5, 10);
  scene.add(light1);
  const light2 = new PointLight(0xffffff, 1, 100);
  light2.position.set(0, -5, -10);
  scene.add(light2);

  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(2, 2, 6);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);

  scene.remove(sphere);
  sphere = createSphere();
  scene.add(sphere);
  cube.material.color.set(color);
  cube.rotateY(-0.01);
  color = rotateColor(color);
  pyramid.rotateY(0.01);

  controls.update();
  renderer.render(scene, camera);

  const debugInfo = JSON.stringify(
    {
      position: camera.position,
      color: color.toString(16).padStart(6, "0"),
    },
    null,
    2
  );

  document.getElementById("debug").innerText = `three.js demo thing

debug data:
${debugInfo}`;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);
init();
animate();
