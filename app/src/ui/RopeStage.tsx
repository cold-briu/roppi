// {28: literate/assembly.weft:41}

// UI: rope stage
// {19: literate/08-lessons-and-ui.weft:78}

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RopeTube } from '../render/ropeTube';
import { BAR } from '../anchors/bar';
import { LINK_COUNT, LINK_RADIUS, createRope, initPhysics, type Rope } from '../rope/rope';
import { recognise } from '../topology/recogniser';

const TOP = { x: 0, y: 1.2, z: 0 };
const SETTLE_SPEED = 0.01;
const SETTLE_FRAMES = 30;
const RECOGNISE_EVERY_MS = 250;
const DEPTH_STEP = 0.002;

export function RopeStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frame = 0;
    let running = false;
    let rope: Rope | null = null;
    let tube: RopeTube | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let barGeometry: THREE.BoxGeometry | null = null;
    let barMaterial: THREE.MeshStandardMaterial | null = null;
    let still = 0;
    let lastRecognised = 0;
    let grabZ = 0;
    let cleanup = () => {};
    const target = { x: TOP.x, y: TOP.y, z: TOP.z };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const plane = new THREE.Plane();
    const hit = new THREE.Vector3();
    let dragging = false;

    initPhysics().then(() => {
      if (disposed) return;

      rope = createRope(TOP, [BAR]);
      tube = new RopeTube(LINK_COUNT, LINK_RADIUS);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      scene.add(tube.mesh);
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const light = new THREE.DirectionalLight(0xffffff, 1.2);
      light.position.set(1, 2, 3);
      scene.add(light);

      barGeometry = new THREE.BoxGeometry(BAR.half.x * 2, BAR.half.y * 2, BAR.half.z * 2);
      barMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const barMesh = new THREE.Mesh(barGeometry, barMaterial);
      barMesh.position.set(BAR.center.x, BAR.center.y, BAR.center.z);
      scene.add(barMesh);

      const camera = new THREE.PerspectiveCamera(40, host.clientWidth / host.clientHeight, 0.01, 100);
      camera.position.set(0, 0.2, 4);
      camera.lookAt(0, 0.2, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      host.appendChild(renderer.domElement);

      const canvas = renderer.domElement;
      const draw = renderer;
      const world = rope;
      const strip = tube;

      const animate = () => {
        const fastest = world.step();
        const snapshot = world.snapshot();
        strip.update(snapshot);
        draw.render(scene, camera);

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

      const moveGrab = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(pointer, camera);
        plane.set(new THREE.Vector3(0, 0, 1), -grabZ);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          target.x = hit.x;
          target.y = hit.y;
          target.z = grabZ;
          world.grab(target);
          wake();
        }
      };

      const onDown = (event: PointerEvent) => {
        dragging = true;
        canvas.setPointerCapture(event.pointerId);
        moveGrab(event);
      };
      const onMove = (event: PointerEvent) => {
        if (dragging) moveGrab(event);
      };
      const onUp = () => {
        dragging = false;
      };
      const onWheel = (event: WheelEvent) => {
        grabZ = Math.max(-1, Math.min(1, grabZ - event.deltaY * DEPTH_STEP));
        target.z = grabZ;
        world.grab(target);
        wake();
      };
      const onResize = () => {
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        draw.setSize(host.clientWidth, host.clientHeight);
      };

      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('wheel', onWheel);
      window.addEventListener('resize', onResize);

      cleanup = () => {
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
      };

      wake();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup();
      rope?.dispose();
      tube?.dispose();
      barGeometry?.dispose();
      barMaterial?.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="absolute inset-0" />
      <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-slate-900/80 px-2 py-1 text-sm text-slate-200">
        Recognised: {name ?? 'nothing yet'}
      </p>
    </div>
  );
}
// {:19}

// {:28}
