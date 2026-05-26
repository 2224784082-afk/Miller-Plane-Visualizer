import * as THREE from "three";
import { cubeCorners, cubeEdges, fracToScene } from "./cell.js";
import { buildPlanePolygon } from "./geometry.js";
import { clearGroup, makeLabel, makeLine } from "./labels.js";

export function drawAxes(axisGroup, vectors) {
  clearGroup(axisGroup);
  const origin = fracToScene([0, 0, 0], vectors);
  makeAxis(axisGroup, origin, fracToScene([1.24, 0, 0], vectors), 0xff3b30, "x", new THREE.Vector3(0, 0.05, 0.08));
  makeAxis(axisGroup, origin, fracToScene([0, 1.24, 0], vectors), 0x34c759, "y", new THREE.Vector3(0.1, 0.02, 0));
  makeAxis(axisGroup, origin, fracToScene([0, 0, 1.24], vectors), 0x007aff, "z", new THREE.Vector3(0.03, 0.1, 0));
}

export function drawCell(cellGroup, vectors, edgeMaterial, softEdgeMaterial) {
  clearGroup(cellGroup);
  const corners = cubeCorners.map((corner) => fracToScene(corner, vectors));
  const positions = [];
  for (const [a, b] of cubeEdges) positions.push(corners[a], corners[b]);
  cellGroup.add(makeLine(positions, edgeMaterial));
  const glow = makeLine(positions, softEdgeMaterial);
  glow.scale.setScalar(1.003);
  cellGroup.add(glow);
}

export function drawPlane(planeGroup, readout, toast, h, k, l, vectors, colorValue, opacity) {
  clearGroup(planeGroup);
  const color = new THREE.Color(colorValue);
  const { points, constant } = buildPlanePolygon(h, k, l, vectors);
  if (points.length < 3) {
    toast("这一组 Miller indices 没有在当前单一 unit cell 内形成可见截面。");
    return;
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const triangles = [];
  for (let i = 1; i < points.length - 1; i += 1) triangles.push(0, i, i + 1);
  geometry.setIndex(triangles);
  geometry.computeVertexNormals();

  const plane = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.34,
    metalness: 0.02,
    side: THREE.DoubleSide,
    transmission: 0.08,
    depthWrite: false,
  }));
  plane.renderOrder = 2;
  planeGroup.add(plane);

  const outline = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([...points, points[0]]),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: Math.min(1, opacity + 0.28) }),
  );
  outline.renderOrder = 3;
  planeGroup.add(outline);
  readout.textContent = `(${h} ${k} ${l}) · c = ${constant}`;
}

function makeAxis(axisGroup, start, end, color, label, labelOffset) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const arrow = new THREE.ArrowHelper(direction.clone().normalize(), start, direction.length(), color, 0.14, 0.075);
  const sprite = makeLabel(label, `#${color.toString(16).padStart(6, "0")}`);
  sprite.position.copy(end).add(labelOffset);
  axisGroup.add(arrow, sprite);
}
