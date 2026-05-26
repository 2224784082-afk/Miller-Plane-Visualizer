import * as THREE from "three";
import { cubeCorners, cubeEdges, fracToScene } from "./cell.js";

function signedPlaneConstant(h, k, l) {
  const translation = [h < 0 ? 1 : 0, k < 0 ? 1 : 0, l < 0 ? 1 : 0];
  return 1 + h * translation[0] + k * translation[1] + l * translation[2];
}

function uniquePoints(points) {
  const out = [];
  for (const point of points) {
    if (!out.some((existing) => existing.distanceTo(point) < 1e-6)) {
      out.push(point);
    }
  }
  return out;
}

function reciprocalNormal(h, k, l, vectors) {
  const origin = fracToScene([0, 0, 0], vectors);
  const a = fracToScene([1, 0, 0], vectors).sub(origin);
  const b = fracToScene([0, 1, 0], vectors).sub(origin);
  const c = fracToScene([0, 0, 1], vectors).sub(origin);
  const volume = a.dot(new THREE.Vector3().crossVectors(b, c));
  return new THREE.Vector3()
    .addScaledVector(new THREE.Vector3().crossVectors(b, c), h / volume)
    .addScaledVector(new THREE.Vector3().crossVectors(c, a), k / volume)
    .addScaledVector(new THREE.Vector3().crossVectors(a, b), l / volume)
    .normalize();
}

function sortPlanePoints(points, normal) {
  const center = points.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(points.length);
  const reference = points[0].clone().sub(center).normalize();
  const tangent = new THREE.Vector3().crossVectors(normal, reference).normalize();
  return points.sort((a, b) => {
    const av = a.clone().sub(center);
    const bv = b.clone().sub(center);
    const aa = Math.atan2(av.dot(tangent), av.dot(reference));
    const ba = Math.atan2(bv.dot(tangent), bv.dot(reference));
    return aa - ba;
  });
}

export function buildPlanePolygon(h, k, l, vectors) {
  const constant = signedPlaneConstant(h, k, l);
  const intersections = [];
  for (const [aIdx, bIdx] of cubeEdges) {
    const a = cubeCorners[aIdx];
    const b = cubeCorners[bIdx];
    const av = h * a[0] + k * a[1] + l * a[2] - constant;
    const bv = h * b[0] + k * b[1] + l * b[2] - constant;

    if (Math.abs(av) < 1e-8) intersections.push(fracToScene(a, vectors));
    if (Math.abs(bv) < 1e-8) intersections.push(fracToScene(b, vectors));
    if (av * bv < -1e-8) {
      const t = av / (av - bv);
      intersections.push(fracToScene([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ], vectors));
    }
  }

  const points = uniquePoints(intersections);
  if (points.length < 3) return { points: [], constant };

  return {
    points: sortPlanePoints(points, reciprocalNormal(h, k, l, vectors)),
    constant,
  };
}
