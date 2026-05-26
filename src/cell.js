import * as THREE from "three";

export const unitCells = {
  cubic: {
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  },
  tetragonal: {
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1.38],
    ],
  },
  orthorhombic: {
    vectors: [
      [1.15, 0, 0],
      [0, 0.82, 0],
      [0, 0, 1.28],
    ],
  },
  hexagonal: {
    vectors: [
      [1, 0, 0],
      [-0.5, Math.sqrt(3) / 2, 0],
      [0, 0, 1.24],
    ],
  },
};

export const cubeCorners = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
];

export const cubeEdges = [
  [0, 1], [0, 2], [1, 3], [2, 3],
  [4, 5], [4, 6], [5, 7], [6, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

export function crystalToScene([x, y, z]) {
  return new THREE.Vector3(y, z, x);
}

export function fracToWorld(frac, vectors) {
  const [u, v, w] = frac;
  return [
    u * vectors[0][0] + v * vectors[1][0] + w * vectors[2][0],
    u * vectors[0][1] + v * vectors[1][1] + w * vectors[2][1],
    u * vectors[0][2] + v * vectors[1][2] + w * vectors[2][2],
  ];
}

export function fracToScene(frac, vectors) {
  return crystalToScene(fracToWorld(frac, vectors));
}
