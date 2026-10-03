import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type Mode = "daylight" | "dusk";
type Finish = "limestone" | "basalt";
type Diagnostics = {
  status: string;
  frames: number;
  visible: boolean;
  motion: boolean;
  mode: Mode;
  finish: Finish;
  drawCalls: number;
  triangles: number;
  dpr: number;
  geometries: number;
  textures: number;
  disposed: boolean;
  error?: string;
};
declare global {
  interface Window {
    __AUREL_DIAGNOSTICS__?: Diagnostics;
  }
}

function surfaceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  ctx.fillStyle = "#e7e3da";
  ctx.fillRect(0, 0, 256, 256);
  let seed = 39;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 8000; i++) {
    const shade = 90 + random() * 140;
    ctx.fillStyle = `rgba(${shade},${shade - 4},${shade - 8},${0.05 + random() * 0.08})`;
    ctx.fillRect(random() * 256, random() * 256, random() * 7, 0.5 + random());
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function LightStudy({ motion }: { motion: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("dusk");
  const [finish, setFinish] = useState<Finish>("limestone");
  const [view, setView] = useState(0);
  const [status, setStatus] = useState("loading");
  const settings = useRef({ mode, finish, motion, view });
  const update = useRef<(() => void) | null>(null);
  useEffect(() => {
    settings.current = { mode, finish, motion, view };
    update.current?.();
  }, [mode, finish, motion, view]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const diagnostic: Diagnostics = {
      status: "initialising",
      frames: 0,
      visible: false,
      motion: settings.current.motion,
      mode: "dusk",
      finish: "limestone",
      drawCalls: 0,
      triangles: 0,
      dpr: 1,
      geometries: 0,
      textures: 0,
      disposed: false,
    };
    window.__AUREL_DIAGNOSTICS__ = diagnostic;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      setStatus("fallback");
      diagnostic.status = "fallback";
      diagnostic.error = String(error);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.3 : 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute(
      "aria-label",
      "Three-dimensional architectural light pavilion. Use the controls below to change its light, stone and viewpoint.",
    );
    renderer.domElement.setAttribute("role", "img");
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#242824");
    scene.fog = new THREE.Fog("#242824", 23, 45);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 70);
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, 0.06);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.32;
    room.dispose();
    pmrem.dispose();
    const stoneMap = surfaceTexture();
    const stone = new THREE.MeshStandardMaterial({
      color: "#bdaf95",
      roughness: 0.82,
      map: stoneMap,
      bumpMap: stoneMap,
      bumpScale: 0.025,
    });
    const dark = new THREE.MeshStandardMaterial({ color: "#252624", roughness: 0.8 });
    const wood = new THREE.MeshStandardMaterial({
      color: "#70573b",
      roughness: 0.74,
      map: stoneMap,
    });
    const bronze = new THREE.MeshStandardMaterial({
      color: "#8b7251",
      roughness: 0.35,
      metalness: 0.85,
    });
    const linen = new THREE.MeshStandardMaterial({ color: "#bcb5a5", roughness: 0.97 });
    const glow = new THREE.MeshStandardMaterial({
      color: "#ffe0a8",
      emissive: "#ffb94a",
      emissiveIntensity: 2,
    });
    const water = new THREE.MeshStandardMaterial({
      color: "#263c35",
      roughness: 0.16,
      metalness: 0.58,
    });
    const materials = [stone, dark, wood, bronze, linen, glow, water];
    const geometries: THREE.BufferGeometry[] = [];
    const pavilion = new THREE.Group();
    scene.add(pavilion);
    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      material: THREE.Material,
      parent: THREE.Object3D = pavilion,
    ) => {
      const geometry = new THREE.BoxGeometry(w, h, d);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    // A layered plinth, cantilever and stepped approach anchor the open architectural section.
    box(11.2, 0.18, 7, 0, -0.22, 0, dark);
    box(10.5, 0.2, 6.4, 0, -0.03, 0, stone);
    box(4.4, 0.12, 1.1, 1.4, -0.2, 3.7, stone);
    box(4.8, 0.1, 1.1, 1.4, -0.3, 4.15, stone);
    box(5.5, 0.07, 4.7, 1.3, 0.12, 0.05, wood);
    // Stone rear wall with a long floating lintel and a deliberate skylight gap.
    box(7.2, 2.9, 0.24, -1, 1.55, -2.15, stone);
    box(0.3, 2.9, 4.7, -4.25, 1.55, 0.1, stone);
    box(4.4, 0.22, 4.95, -2.2, 3.12, 0.05, stone);
    box(4.8, 0.22, 4.95, 2.9, 3.12, 0.05, dark);
    box(0.055, 0.035, 4.85, 0.12, 3.005, 0.05, glow);
    box(7.1, 0.04, 0.035, -1, 2.8, -1.99, glow);
    box(0.1, 2.9, 0.1, 4.6, 1.56, 2.3, bronze);
    box(0.1, 2.9, 0.1, 0.75, 1.56, 2.3, bronze);
    // Slatted screen casts measured, directional shadows across the floor.
    const slatGeometry = new THREE.BoxGeometry(0.06, 2.85, 0.16);
    geometries.push(slatGeometry);
    const slats = new THREE.InstancedMesh(slatGeometry, wood, 31);
    slats.castShadow = true;
    slats.receiveShadow = true;
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < 31; i++) {
      matrix.makeTranslation(0.4 + i * 0.135, 1.52, -2.08);
      slats.setMatrixAt(i, matrix);
    }
    pavilion.add(slats);
    // A built-in bench, seam lines and a low bronze-framed daybed give the model human scale.
    box(3.6, 0.17, 0.74, -2.05, 0.52, -1.5, stone);
    box(0.24, 0.42, 0.64, -3.55, 0.28, -1.5, stone);
    box(0.24, 0.42, 0.64, -0.5, 0.28, -1.5, stone);
    box(2.3, 0.15, 1, 2.25, 0.36, 0.6, bronze);
    box(2.15, 0.17, 0.9, 2.25, 0.5, 0.6, linen);
    box(0.38, 0.21, 0.82, 3.04, 0.67, 0.6, linen);
    for (const x of [1.25, 3.25])
      for (const z of [0.22, 0.98]) box(0.06, 0.3, 0.06, x, 0.2, z, bronze);
    for (let i = 0; i < 12; i++) box(0.012, 0.008, 4.5, -1.2 + i * 0.4, 0.159, 0.05, dark);
    // A circular solid-stone table and sculptural vessel contrast the linear shell.
    const cylinder = new THREE.CylinderGeometry(0.49, 0.49, 0.09, 48);
    geometries.push(cylinder);
    const table = new THREE.Mesh(cylinder, stone);
    table.position.set(-0.1, 0.52, 0.48);
    table.castShadow = table.receiveShadow = true;
    pavilion.add(table);
    const baseGeo = new THREE.CylinderGeometry(0.19, 0.25, 0.42, 32);
    geometries.push(baseGeo);
    const base = new THREE.Mesh(baseGeo, stone);
    base.position.set(-0.1, 0.28, 0.48);
    pavilion.add(base);
    const vesselGeo = new THREE.SphereGeometry(0.15, 24, 16);
    geometries.push(vesselGeo);
    const vessel = new THREE.Mesh(vesselGeo, dark);
    vessel.scale.set(0.75, 1.2, 0.75);
    vessel.position.set(-0.1, 0.71, 0.48);
    pavilion.add(vessel);
    // The reflecting basin sits below the main floor, edged with individual masonry joints.
    box(1.75, 0.055, 5.25, -3.12, 0.11, 0.1, water);
    for (let i = 0; i < 10; i++) box(0.28, 0.12, 0.49, -2.17, 0.19, -2.12 + i * 0.51, stone);
    box(
      160,
      0.1,
      160,
      0,
      -0.41,
      0,
      new THREE.MeshStandardMaterial({ color: "#252924", roughness: 1 }),
      scene,
    );
    const ground = scene.children[scene.children.length - 1] as THREE.Mesh;
    materials.push(ground.material as THREE.MeshStandardMaterial);
    const sun = new THREE.DirectionalLight("#ffdcb0", 3.5);
    sun.position.set(-4, 5.5, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(
      window.innerWidth < 700 ? 1024 : 1536,
      window.innerWidth < 700 ? 1024 : 1536,
    );
    sun.shadow.camera.left = -8;
    sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 25;
    sun.shadow.normalBias = 0.035;
    sun.shadow.bias = -0.0002;
    scene.add(sun);
    const hemi = new THREE.HemisphereLight("#bdc9d1", "#403526", 0.85);
    scene.add(hemi);
    const interior = new THREE.PointLight("#ffbc68", 35, 9, 2);
    interior.position.set(-1.3, 2.65, -0.8);
    scene.add(interior);
    const fill = new THREE.DirectionalLight("#adbbd0", 0.9);
    fill.position.set(4, 5, 2);
    scene.add(fill);
    let active = false;
    let frame = 0;
    let remaining = 0;
    let disposed = false;
    let currentAngle = 0.48;
    let currentElevation = 0.37;
    let targetElevation = 0.37;
    const dayColor = new THREE.Color("#c4bda9");
    const duskColor = new THREE.Color("#242824");
    const paleStone = new THREE.Color("#bdaf95");
    const basaltStone = new THREE.Color("#525956");
    const render = () => {
      frame = 0;
      if (disposed || !active || document.hidden) return;
      const s = settings.current;
      const daylight = s.mode === "daylight";
      const blend = s.motion ? 0.12 : 1;
      currentAngle = THREE.MathUtils.lerp(currentAngle, 0.48 + s.view * 0.24, blend);
      currentElevation = THREE.MathUtils.lerp(currentElevation, targetElevation, blend);
      const distance = element.clientWidth < 650 ? 20.5 : 17.2;
      camera.position.set(
        Math.sin(currentAngle) * distance,
        distance * currentElevation,
        Math.cos(currentAngle) * distance,
      );
      camera.lookAt(0, 0.8, 0);
      (scene.background as THREE.Color).lerp(daylight ? dayColor : duskColor, blend);
      (scene.fog as THREE.Fog).color.copy(scene.background as THREE.Color);
      stone.color.lerp(s.finish === "limestone" ? paleStone : basaltStone, blend);
      sun.intensity = THREE.MathUtils.lerp(sun.intensity, daylight ? 4.5 : 1.35, blend);
      sun.position.x = THREE.MathUtils.lerp(sun.position.x, daylight ? -5 : 5.5, blend);
      sun.position.y = THREE.MathUtils.lerp(sun.position.y, daylight ? 7 : 3.8, blend);
      hemi.intensity = THREE.MathUtils.lerp(hemi.intensity, daylight ? 1.8 : 0.65, blend);
      interior.intensity = THREE.MathUtils.lerp(interior.intensity, daylight ? 3 : 38, blend);
      glow.emissiveIntensity = THREE.MathUtils.lerp(
        glow.emissiveIntensity,
        daylight ? 0.3 : 2.5,
        blend,
      );
      renderer.render(scene, camera);
      diagnostic.frames++;
      diagnostic.status = "ready";
      diagnostic.mode = s.mode;
      diagnostic.finish = s.finish;
      diagnostic.motion = s.motion;
      diagnostic.drawCalls = renderer.info.render.calls;
      diagnostic.triangles = renderer.info.render.triangles;
      diagnostic.geometries = renderer.info.memory.geometries;
      diagnostic.textures = renderer.info.memory.textures;
      diagnostic.dpr = renderer.getPixelRatio();
      if (--remaining > 0 && s.motion) frame = requestAnimationFrame(render);
    };
    const request = () => {
      remaining = settings.current.motion ? 65 : 1;
      if (!frame && active && !document.hidden) frame = requestAnimationFrame(render);
    };
    update.current = request;
    const resize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.3 : 1.65),
      );
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      request();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const visibility = new IntersectionObserver(
      ([entry]) => {
        active = Boolean(entry?.isIntersecting);
        diagnostic.visible = active;
        if (active) request();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "100px" },
    );
    visibility.observe(element);
    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else request();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !settings.current.motion) return;
      const bounds = element.getBoundingClientRect();
      targetElevation = 0.34 + ((event.clientY - bounds.top) / bounds.height) * 0.055;
      request();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      setStatus("fallback");
      active = false;
      diagnostic.status = "context-lost";
      if (frame) cancelAnimationFrame(frame);
    };
    element.addEventListener("pointermove", onPointer);
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    resize();
    setStatus("ready");
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      update.current = null;
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      element.removeEventListener("pointermove", onPointer);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      stoneMap.dispose();
      environment.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      diagnostic.status = "disposed";
      diagnostic.disposed = true;
      diagnostic.visible = false;
    };
  }, []);

  return (
    <div className={`light-experience mode-${mode}`}>
      <div className="study-meta">
        <span className="eyebrow">AUREL / Light Pavilion No. 01</span>
        <span className="eyebrow">
          {mode === "daylight" ? "11:00 / Sunlit" : "18:30 / Afterglow"}
        </span>
      </div>
      <div className="study-canvas" ref={host} />
      {status !== "ready" && (
        <div className="study-fallback">
          <div className="fallback-pavilion">
            <div />
            <div />
            <div />
          </div>
          <p>{status === "loading" ? "Finding the light…" : "A quiet study in proportion."}</p>
          <span>
            {status === "loading"
              ? "Preparing your pavilion"
              : "The interactive pavilion needs WebGL. Explore the material notes below."}
          </span>
        </div>
      )}
      <div className="study-caption">
        <p>
          <span className="tiny-cross">+</span>{" "}
          {mode === "daylight"
            ? "Long shadows. Open possibilities."
            : "The moment a space becomes a sanctuary."}
        </p>
        <div className="view-controls">
          <button
            disabled={view <= -2 || status !== "ready"}
            type="button"
            aria-label="View pavilion from further left"
            onClick={() => setView((v) => v - 1)}
          >
            ←
          </button>
          <span className="eyebrow">Change perspective</span>
          <button
            disabled={view >= 2 || status !== "ready"}
            type="button"
            aria-label="View pavilion from further right"
            onClick={() => setView((v) => v + 1)}
          >
            →
          </button>
        </div>
      </div>
      <div className="study-controls">
        <div>
          <p className="eyebrow">01 / The hour</p>
          <div className="segmented">
            {(["daylight", "dusk"] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
              >
                <span aria-hidden="true">{value === "daylight" ? "☼" : "◐"}</span>
                {value === "daylight" ? "Daylight" : "Dusk"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">02 / The surface</p>
          <div className="segmented">
            {(["limestone", "basalt"] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={finish === value}
                onClick={() => setFinish(value)}
              >
                <span className={`finish-swatch ${value}`} />
                {value === "limestone" ? "Limestone" : "Basalt"}
              </button>
            ))}
          </div>
        </div>
        <p className="study-material-note" aria-live="polite">
          {finish === "limestone"
            ? "Pale mineral tones hold the light. Warm, tactile and quietly luminous."
            : "Dark volcanic tones deepen the shadows. Grounded, elemental and still."}
        </p>
      </div>
    </div>
  );
}
