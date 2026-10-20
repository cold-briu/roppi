// {31: literate/assembly.weft:55}

// Rope: snapshot types
// {7: literate/05-rope-model.weft:20}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// The link centres in order, from the grab end to the free end.
export interface RopeSnapshot {
  readonly points: readonly Vec3[];
  readonly radius: number;
}

// An axis-aligned box given by its centre and its half sizes.
export interface Box {
  center: Vec3;
  half: Vec3;
}
// {:7}

// {:31}
