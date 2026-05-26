import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { unitCells } from "./cell.js";
import { drawAxes, drawCell, drawPlane } from "./draw.js";
import { clearGroup } from "./labels.js";

const app = document.querySelector("#app");
const hInput = document.querySelector("#hInput");
const kInput = document.querySelector("#kInput");
const lInput = document.querySelector("#lInput");
const cellSelect = document.querySelector("#cellSelect");
const colorInput = document.querySelector("#colorInput");
const opacityInput = document.querySelector("#opacityInput");
const resetButton = document.querySelector("#resetButton");
const planeReadout = document.querySelector("#planeReadout");
const toast = document.querySelector("#toast");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 3.2;
controls.maxDistance = 11;

scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd5df, 2.3));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(4, 6, 7);
scene.add(keyLight);

const root = new THREE.Group();
const cellGroup = new THREE.Group();
const axisGroup = new THREE.Group();
const planeGroup = new THREE.Group();
root.add(cellGroup, axisGroup, planeGroup);
scene.add(root);

const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x1d1d1f, transparent: true, opacity: 0.44 });
const softEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
let hideTimer = 0;

function parseIndex(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? Math.trunc(value) : 0;
}

function showToast(message) {
  window.clearTimeout(hideTimer);
  toast.textContent = message;
  toast.classList.add("show");
  hideTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateScene() {
  const h = parseIndex(hInput);
  const k = parseIndex(kInput);
  const l = parseIndex(lInput);
  hInput.value = h;
  kInput.value = k;
  lInput.value = l;

  const vectors = unitCells[cellSelect.value].vectors;
  drawCell(cellGroup, vectors, edgeMaterial, softEdgeMaterial);
  drawAxes(axisGroup, vectors);

  if (h === 0 && k === 0 && l === 0) {
    clearGroup(planeGroup);
    planeReadout.textContent = "(0 0 0)";
    showToast("Miller indices 不能全部为 0。");
    return;
  }

  drawPlane(planeGroup, planeReadout, showToast, h, k, l, vectors, colorInput.value, Number(opacityInput.value));
}

function resetView() {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  controls.target.copy(center);
  camera.position.set(center.x + 0.14, center.y + 2.75, center.z + 6.2);
  camera.lookAt(center);
  controls.update();
}

for (const input of [hInput, kInput, lInput, cellSelect, colorInput, opacityInput]) {
  input.addEventListener("input", updateScene);
  input.addEventListener("change", updateScene);
}

resetButton.addEventListener("click", resetView);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateScene();
resetView();
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
