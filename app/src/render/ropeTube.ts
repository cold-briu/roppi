// {52: literate/assembly.weft:119}

// Renderer: rope tube
// {14: literate/07-renderer.weft:26}

import * as THREE from 'three';
import type { RopeSnapshot } from '../rope/snapshot';

const RADIAL = 8;
const SAMPLES_PER_LINK = 4;

// One tube along the rope. The buffers are allocated once in the constructor, and
// update() rewrites the vertex positions in place.
export class RopeTube {
  readonly mesh: THREE.Mesh;
  readonly geometry = new THREE.BufferGeometry();
  private readonly material = new THREE.MeshStandardMaterial({
    color: 0xd9a441,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  private readonly positions: Float32Array;
  private readonly attribute: THREE.BufferAttribute;
  private readonly controls: THREE.Vector3[];
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly rings: number;
  private readonly radius: number;
  private readonly center = new THREE.Vector3();
  private readonly tangent = new THREE.Vector3();
  private readonly normal = new THREE.Vector3();
  private readonly binormal = new THREE.Vector3();
  private readonly seed = new THREE.Vector3();

  constructor(linkCount: number, radius: number) {
    this.radius = radius;
    this.rings = (linkCount - 1) * SAMPLES_PER_LINK + 1;

    this.positions = new Float32Array(this.rings * (RADIAL + 1) * 3);
    this.attribute = new THREE.BufferAttribute(this.positions, 3);
    this.geometry.setAttribute('position', this.attribute);

    const indices: number[] = [];
    for (let r = 0; r < this.rings - 1; r++) {
      for (let s = 0; s < RADIAL; s++) {
        const a = r * (RADIAL + 1) + s;
        const c = a + (RADIAL + 1);
        indices.push(a, c, a + 1, a + 1, c, c + 1);
      }
    }
    this.geometry.setIndex(indices);

    this.controls = Array.from({ length: linkCount }, () => new THREE.Vector3());
    this.curve = new THREE.CatmullRomCurve3(this.controls);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    // The bounds are not recomputed each frame, so culling would use stale ones.
    this.mesh.frustumCulled = false;
  }

  update(snapshot: RopeSnapshot): void {
    snapshot.points.forEach((p, i) => this.controls[i].set(p.x, p.y, p.z));
    this.curve.points = this.controls;

    for (let r = 0; r < this.rings; r++) {
      const t = r / (this.rings - 1);
      this.curve.getPoint(t, this.center);
      this.curve.getTangent(t, this.tangent);
      if (r === 0) {
        // Start from any direction that is not along the tangent.
        this.seed.set(Math.abs(this.tangent.x) > 0.9 ? 0 : 1, Math.abs(this.tangent.x) > 0.9 ? 1 : 0, 0);
        this.normal.copy(this.seed);
      }
      // Project the carried normal onto the plane perpendicular to the tangent.
      this.normal.addScaledVector(this.tangent, -this.normal.dot(this.tangent)).normalize();
      this.binormal.crossVectors(this.tangent, this.normal);

      for (let s = 0; s <= RADIAL; s++) {
        const angle = (s / RADIAL) * Math.PI * 2;
        const cos = Math.cos(angle) * this.radius;
        const sin = Math.sin(angle) * this.radius;
        const o = (r * (RADIAL + 1) + s) * 3;
        this.positions[o] = this.center.x + this.normal.x * cos + this.binormal.x * sin;
        this.positions[o + 1] = this.center.y + this.normal.y * cos + this.binormal.y * sin;
        this.positions[o + 2] = this.center.z + this.normal.z * cos + this.binormal.z * sin;
      }
    }
    this.attribute.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
// {:14}

// {:52}
