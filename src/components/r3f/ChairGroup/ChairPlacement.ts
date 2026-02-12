export type ChairPose = { x: number; z: number; rotY: number }

export function placeRadialChairs(
  radiusX: number,
  radiusZ: number,
  count: number
): ChairPose[] {
  const edgePadding = 0.1
  const rx = radiusX - edgePadding
  const rz = radiusZ - edgePadding
  const chairs: ChairPose[] = []

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    chairs.push({
      x: Math.cos(a) * rx,
      z: Math.sin(a) * rz,
      rotY: -a - Math.PI / 2,
    })
  }

  return chairs
}

export function placeRectChairs(
  length: number,
  width: number,
  count: number,
  chairFootprintX = 0.2
): ChairPose[] {
  const halfL = length / 3180
  const halfW = width / 1300
  const edgePadding = 0.9
  const sideMargin = Math.min(0.5, halfL * 0.25)

  const hasEnds = count >= 4
  const endCount = hasEnds ? 2 : 0
  const sideCount = Math.max(count - endCount, 0)
  const perSide = Math.max(1, Math.floor(sideCount / 2))

  const chairs: ChairPose[] = []

  const chairSpan = chairFootprintX * 1.4
  const startX = -halfL - sideMargin*1.3
  const endX = halfL + sideMargin*1.3
  let spanX = Math.max(endX - startX, 0.01)

  if (perSide > 1) {
    const requiredSpan = chairSpan * (perSide - 1)
    if (requiredSpan > spanX) spanX = requiredSpan
  }

  const expandedStart = startX - Math.max(0, (spanX - (endX - startX)) / 2)

  for (let i = 0; i < perSide; i++) {
    const t = (i + 0.5) / perSide
    const x = expandedStart + t * spanX

    chairs.push({ x, z: halfW - edgePadding * 0.1, rotY: Math.PI })
    chairs.push({ x, z: -halfW + edgePadding * 0.1, rotY: 0 })
  }

  if (hasEnds) {
    chairs.push({ x: halfL + edgePadding, z: 0, rotY: -Math.PI / 2 })
    chairs.push({ x: -halfL - edgePadding, z: 0, rotY: Math.PI / 2 })
  }

  return chairs.slice(0, Math.max(count, 1))
}

export function placeOvalChairs(
  length: number,
  width: number,
  count: number
): ChairPose[] {
  const chairs: ChairPose[] = [];
  
  // 1. Convert units and add GAP
  const L = length / 1000;
  const W = width / 1000;
  const GAP = 0.3; 
  const a = L / 2 + GAP*1.25; 
  const b = W / 2 + GAP; 

  // 2. Split count into two rows (top and bottom)
  const chairsPerSide = Math.floor(count / 2);

  for (let i = 0; i < chairsPerSide; i++) {
    // 3. Calculate spread: The more chairs, the further they wrap around the curve
    const arcSpread = 0.15 + (chairsPerSide * 0.15); 
    const finalArc = Math.min(arcSpread, 0.75) * Math.PI;

    // Normalize position from -0.5 to 0.5
    const relativePos = chairsPerSide > 1 ? (i / (chairsPerSide - 1) - 0.5) : 0;
    const angleOffset = relativePos * finalArc;

    // 4. TOP SIDE ROW (90 degrees +/- offset)
    const topAngle = Math.PI / 2 + angleOffset;
    chairs.push({
      x: a * Math.cos(topAngle),
      z: b * Math.sin(topAngle),
      // Facing logic: simplified to face center for better visual alignment
      rotY: -topAngle - Math.PI / 2 
    });

    // 5. BOTTOM SIDE ROW (270 degrees -/+ offset)
    const bottomAngle = (3 * Math.PI) / 2 - angleOffset;
    chairs.push({
      x: a * Math.cos(bottomAngle),
      z: b * Math.sin(bottomAngle),
      rotY: -bottomAngle - Math.PI / 2
    });
  }

  // Handle an odd chair count by placing one at the "Head" if count is odd
  if (count % 2 !== 0) {
    chairs.push({ x: a + 0.1, z: 0, rotY: -Math.PI / 2 });
  }

  return chairs;
}

export function placeSquareChairs(
  size: number,
  count: number,
  chairFootprintX = 0.2
): ChairPose[] {
  const half = size / 1580
  const edgePadding = 0.5
  const sideMargin = Math.min(0.45, half * 0.25)

  const perSideBase = Math.floor(count / 4)
  let remainder = count % 4
  const sideCounts = [perSideBase, perSideBase, perSideBase, perSideBase]

  for (let i = 0; i < 4 && remainder > 0; i++, remainder--) {
    sideCounts[i]++
  }

  const chairs: ChairPose[] = []

  const chairSpan = chairFootprintX * 1.4
  const start = -half + sideMargin
  const end = half - sideMargin
  let span = Math.max(end - start, 0.01)

  if (sideCounts[0] > 1) {
    const requiredSpan = chairSpan * (sideCounts[0] - 1)
    if (requiredSpan > span) span = requiredSpan
  }

  const expandedStart = start - Math.max(0, (span - (end - start)) / 2)

  // top
  for (let i = 0; i < sideCounts[0]; i++) {
    const t = (i + 0.5) / sideCounts[0]
    chairs.push({
      x: expandedStart + t * span,
      z: half + edgePadding*0.15,
      rotY: Math.PI,
    })
  }

  // bottom
  for (let i = 0; i < sideCounts[1]; i++) {
    const t = (i + 0.5) / sideCounts[1]
    chairs.push({
      x: expandedStart + t * span,
      z: -half - edgePadding*0.15,
      rotY: 0,
    })
  }

  // right
  for (let i = 0; i < sideCounts[2]; i++) {
    const t = (i + 0.5) / sideCounts[2]
    chairs.push({
      x: half + edgePadding*0.15,
      z: expandedStart + t * span,
      rotY: -Math.PI / 2,
    })
  }

  // left
  for (let i = 0; i < sideCounts[3]; i++) {
    const t = (i + 0.5) / sideCounts[3]
    chairs.push({
      x: -half - edgePadding*0.15,
      z: expandedStart + t * span,
      rotY: Math.PI / 2,
    })
  }

  return chairs.slice(0, Math.max(count, 1))
}

export function placeOblongChairs(
  length: number,
  width: number,
  count: number,
  chairFootprintX = 0.2
): ChairPose[] {
  // 1. Maintain your unit conversion logic
  const halfL = length / 3180;
  const halfW = width / 1300;
  const edgePadding = 0.8;
  const sideMargin = Math.min(0.5, halfL * 0.25);

  const hasEnds = count >= 4;
  const endCount = hasEnds ? 2 : 0;
  const sideCount = Math.max(count - endCount, 0);
  const perSide = Math.max(1, Math.floor(sideCount / 2));

  const chairs: ChairPose[] = [];

  const chairSpan = chairFootprintX * 1.4;
  const startX = -halfL - sideMargin * 1.5;
  const endX = halfL + sideMargin * 1.5;
  let spanX = Math.max(endX - startX, 0.01);

  if (perSide > 1) {
    const requiredSpan = chairSpan * (perSide - 1);
    if (requiredSpan > spanX) spanX = requiredSpan;
  }

  const expandedStart = startX - Math.max(0, (spanX - (endX - startX)) / 2);

  // 2. LONG SIDES (With subtle curvature)
  for (let i = 0; i < perSide; i++) {
    const t = (i + 0.5) / perSide; // range 0 to 1
    const x = expandedStart + t * spanX;
    
    // Calculate a subtle curve offset (Arcing outward toward the corners)
    // Using a sine wave or parabolic curve to slightly offset Z
    const curveIntensity = 0.08; 
    const zOffset = Math.cos((t - 0.5) * Math.PI) * curveIntensity;
    
    // Subtle rotation tilt based on position
    const tilt = (t - 0.5) * 0.2; 

    // Top Side
    chairs.push({ 
      x, 
      z: (halfW - edgePadding * 0.2) + zOffset, 
      rotY: Math.PI - tilt 
    });
    
    // Bottom Side
    chairs.push({ 
      x, 
      z: (-halfW + edgePadding * 0.2) - zOffset, 
      rotY: 0 + tilt 
    });
  }

  // 3. ROUNDED ENDS (Heads of the table)
  if (hasEnds) {
    // Push head chairs slightly further out (edgePadding + small boost) to respect the curve
    const headOffset = 0.15;
    chairs.push({ x: halfL + edgePadding + headOffset, z: 0, rotY: -Math.PI / 2 });
    chairs.push({ x: -halfL - edgePadding - headOffset, z: 0, rotY: Math.PI / 2 });
  }

  return chairs.slice(0, Math.max(count, 1));
}
