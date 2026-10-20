// {31: literate/assembly.weft:41}

// UI: rope stage
// {18: literate/08-lessons-and-ui.weft:104}

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RopeTube } from '../render/ropeTube';
import { BAR } from '../anchors/bar';
import { LINK_COUNT, LINK_RADIUS, createRope, initPhysics, type Rope } from '../rope/rope';
import type { Box } from '../rope/snapshot';
import { recognise } from '../topology/recogniser';

const FLOOR: Box = { center: { x: 0, y: -1, z: 0 }, half: { x: 1.5, y: 0.05, z: 1.5 } };
const ROPE_START = { x: -0.975, y: 0.2, z: 0 };
const SETTLE_SPEED = 0.01;
const SETTLE_FRAMES = 30;
const RECOGNISE_EVERY_MS = 250;
const DEPTH_STEP = 0.0003;
const NEAR = 0.3;
const FAR = 6;
const PICK_RADIUS = 36;

export function RopeStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gravityRef = useRef(false);
  const controls = useRef<{ setGravity(on: boolean): void } | null>(null);
  const view = useRef<{ reset(): void } | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [gravityOn, setGravityOn] = useState(false);

  const resetView = () => {
    view.current?.reset();
  };

  const toggleGravity = () => {
    gravityRef.current = !gravityRef.current;
    setGravityOn(gravityRef.current);
    controls.current?.setGravity(gravityRef.current);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frame = 0;
    let running = false;
    let still = 0;
    let lastRecognised = 0;
    let cleanup = () => {};
    const owned: { dispose(): void }[] = [];

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const screen = new THREE.Vector3();
    const facing = new THREE.Vector3();
    let grabbing = false;
    let depth = 0;

    initPhysics().then(() => {
      if (disposed) return;

      const rope: Rope = createRope(ROPE_START, [BAR, FLOOR]);
      rope.setGravity(gravityRef.current);
      const tube = new RopeTube(LINK_COUNT, LINK_RADIUS);
      owned.push(rope, tube);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      scene.add(tube.mesh);
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const light = new THREE.DirectionalLight(0xffffff, 1.2);
      light.position.set(1, 2, 3);
      scene.add(light);

      const addBox = (box: Box, color: number) => {
        const geometry = new THREE.BoxGeometry(box.half.x * 2, box.half.y * 2, box.half.z * 2);
        const material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(box.center.x, box.center.y, box.center.z);
        scene.add(mesh);
        owned.push(geometry, material);
      };
      addBox(BAR, 0x64748b);
      addBox(FLOOR, 0x1e293b);

      const camera = new THREE.PerspectiveCamera(40, host.clientWidth / host.clientHeight, 0.01, 100);
      camera.position.set(1.1, 0.9, 3.4);
      camera.lookAt(0.1, 0.1, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      host.appendChild(renderer.domElement);

      const canvas = renderer.domElement;

      // Empty space orbits the camera, and the wheel zooms. A held link turns both off.
      const orbit = new OrbitControls(camera, canvas);
      orbit.enableDamping = true;
      orbit.minDistance = 1;
      orbit.maxDistance = 8;
      orbit.target.set(0.1, 0.1, 0);
      orbit.update();
      orbit.saveState();
      owned.push(orbit);
      view.current = {
        reset() {
          orbit.reset();
          wake();
        },
      };

      controls.current = {
        setGravity(on) {
          rope.setGravity(on);
          wake();
        },
      };

      const animate = () => {
        orbit.update();
        const fastest = rope.step();
        const snapshot = rope.snapshot();
        tube.update(snapshot);
        renderer.render(scene, camera);

        still = fastest < SETTLE_SPEED ? still + 1 : 0;
        const now = performance.now();
        if (still === SETTLE_FRAMES || (still === 0 && now - lastRecognised > RECOGNISE_EVERY_MS)) {
          lastRecognised = now;
          setName(recognise(snapshot).name);
        }
        if (still < SETTLE_FRAMES) {
          frame = requestAnimationFrame(animate);
        } else {
          running = false;
        }
      };

      const wake = () => {
        still = 0;
        if (!running) {
          running = true;
          frame = requestAnimationFrame(animate);
        }
      };

      // Orbiting, damping and zoom redraw the scene, so they wake the loop.
      orbit.addEventListener('change', wake);

      const pointerRay = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(pointer, camera);
      };

      // The nearest link whose on-screen position is within PICK_RADIUS pixels, or null.
      const pickLink = (event: PointerEvent): number | null => {
        const rect = canvas.getBoundingClientRect();
        const points = rope.snapshot().points;
        let best: number | null = null;
        let bestDistance = PICK_RADIUS;
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          screen.set(p.x, p.y, p.z).project(camera);
          const x = rect.left + ((screen.x + 1) / 2) * rect.width;
          const y = rect.top + ((1 - screen.y) / 2) * rect.height;
          const distance = Math.hypot(x - event.clientX, y - event.clientY);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = i;
          }
        }
        return best;
      };

      // The point on the mouse ray that lies the given distance ahead of the camera, along the view direction.
      const pointAtDepth = (distance: number): THREE.Vector3 => {
        camera.getWorldDirection(facing);
        const along = raycaster.ray.direction.dot(facing);
        return raycaster.ray.at(distance / along, hit);
      };

      const onDown = (event: PointerEvent) => {
        const index = pickLink(event);
        if (index === null) return;
        pointerRay(event);
        const at = rope.snapshot().points[index];
        // The held point keeps this depth until the wheel changes it.
        camera.getWorldDirection(facing);
        depth = hit.set(at.x, at.y, at.z).sub(camera.position).dot(facing);
        grabbing = true;
        orbit.enabled = false;
        canvas.setPointerCapture(event.pointerId);
        rope.grabLink(index, at);
        wake();
      };
      const onMove = (event: PointerEvent) => {
        if (!grabbing) return;
        pointerRay(event);
        rope.moveGrab(pointAtDepth(depth));
        wake();
      };
      const onUp = () => {
        if (!grabbing) return;
        grabbing = false;
        orbit.enabled = true;
        rope.releaseGrab();
        wake();
      };
      const onWheel = (event: WheelEvent) => {
        if (!grabbing) return;
        // The ray is the last pointer ray, so the held point stays under the cursor.
        depth = THREE.MathUtils.clamp(depth + event.deltaY * DEPTH_STEP, NEAR, FAR);
        rope.moveGrab(pointAtDepth(depth));
        wake();
      };
      const onResize = () => {
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(host.clientWidth, host.clientHeight);
      };

      // Capture phase, so a click on a link is taken before the orbit controls see it.
      canvas.addEventListener('pointerdown', onDown, { capture: true });
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('wheel', onWheel);
      window.addEventListener('resize', onResize);

      cleanup = () => {
        canvas.removeEventListener('pointerdown', onDown, { capture: true });
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        renderer.domElement.remove();
      };

      wake();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup();
      controls.current = null;
      for (const item of owned) item.dispose();
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="absolute inset-0" />
      <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-slate-900/80 px-2 py-1 text-sm text-slate-200">
        Recognised: {name ?? 'nothing yet'}
      </p>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          type="button"
          onClick={resetView}
          className="rounded bg-slate-900/80 px-3 py-1 text-sm text-slate-100 hover:bg-slate-800"
        >
          Reset view
        </button>
        <button
          type="button"
          onClick={toggleGravity}
          className="rounded bg-slate-900/80 px-3 py-1 text-sm text-slate-100 hover:bg-slate-800"
        >
          Gravity: {gravityOn ? 'on' : 'off'}
        </button>
      </div>
    </div>
  );
}
// {:18}

// {:31}
