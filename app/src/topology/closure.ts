// {34: literate/assembly.weft:69}

// Topology: closure
// {10: literate/06-topology.weft:16}

import type { Vec3 } from '../rope/snapshot';

// How far behind the scene the joining path lies. Everything is closer than this.
const BEHIND = 1000;

// The rope's points, then two points far behind the last and first links. The
// loop closes from the second far point back to the first link.
export function closeRope(points: readonly Vec3[]): Vec3[] {
  const first = points[0];
  const last = points[points.length - 1];
  return [
    ...points,
    { x: last.x, y: last.y, z: -BEHIND },
    { x: first.x, y: first.y, z: -BEHIND },
  ];
}
// {:10}

// {:34}
