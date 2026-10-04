import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import Icon from "./Icon";
import { cameraPath, cameraTargets, lightChapters, mobilePullback } from "./lightJourney";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

// Reverting a context renders its recorded timeline at the start before cleanups run.
// That render is bookkeeping, not a camera move, so the journey ignores it.
const reverting = () =>
  Boolean((gsap.core as unknown as { reverting?: () => unknown }).reverting?.());

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
  cameraOwner: "scroll" | "visitor" | "static";
  journeyProgress: number;
  scrollProgress: number;
  chapter: string;
  camera: [number, number, number];
  target: [number, number, number];
  scrollTriggerActive: boolean;
  journeyEnabled: boolean;
  scrollStart: number;
  scrollEnd: number;
  renderPending: boolean;
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
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const progressFill = useRef<HTMLSpanElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("dusk");
  const [finish, setFinish] = useState<Finish>("limestone");
  const [view, setView] = useState(0);
  const [status, setStatus] = useState("loading");
  const [chapter, setChapter] = useState(0);
  const chapterIndex = useRef(0);
  const [following, setFollowing] = useState(true);
  const [scrollReady, setScrollReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const journey = useRef({
    progress: 0,
    scrollProgress: 0,
    following: true,
    enabled: false,
    pointerEnabled: false,
  });
  const travel = useRef<gsap.core.Timeline | null>(null);
  const scrollTween = useRef<gsap.core.Tween | null>(null);
  const settings = useRef({ mode, finish, motion, view });
  const update = useRef<((frames?: number) => void) | null>(null);

  const applyProgress = (value: number, frames = 12) => {
    journey.current.progress = THREE.MathUtils.clamp(value, 0, 1);
    if (progressFill.current)
      progressFill.current.style.transform = `scaleX(${journey.current.progress})`;
    const next = value < 0.26 ? 0 : value < 0.76 ? 1 : 2;
    if (next !== chapterIndex.current) {
      chapterIndex.current = next;
      setChapter(next);
    }
    update.current?.(frames);
  };

  const takeControl = (pointerEnabled = false) => {
    scrollTween.current?.kill();
    journey.current.following = false;
    journey.current.pointerEnabled = pointerEnabled;
    setFollowing(false);
    update.current?.();
  };
  useEffect(() => {
    settings.current = {
      mode,
      finish,
      motion: motion && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      view,
    };
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
      cameraOwner: "static",
      journeyProgress: 0,
      scrollProgress: 0,
      chapter: "threshold",
      camera: [0, 0, 0],
      target: [0, 0, 0],
      scrollTriggerActive: false,
      journeyEnabled: false,
      scrollStart: 0,
      scrollEnd: 0,
      renderPending: false,
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
      return () => {
        diagnostic.disposed = true;
      };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.3 : 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive architectural section showing the threshold, timber screen and water. Named views, lighting and stone controls follow the scene.",
    );
    renderer.domElement.setAttribute("role", "img");
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#242824");
    scene.fog = new THREE.Fog("#242824", 23, 45);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 70);
    // Render-target contents do not survive a lost context; restore rebuilds this map.
    const buildEnvironment = () => {
      const room = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const target = pmrem.fromScene(room, 0.06);
      room.dispose();
      pmrem.dispose();
      return target;
    };
    let environment = buildEnvironment();
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.32;
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
    let contextLost = false;
    const curve = new THREE.CatmullRomCurve3(
      cameraPath.map((point) => new THREE.Vector3(...point)),
    );
    const lookCurve = new THREE.CatmullRomCurve3(
      cameraTargets.map((point) => new THREE.Vector3(...point)),
    );
    const mobileCurve = new THREE.CatmullRomCurve3(
      cameraPath.map((point, index) => {
        const target = new THREE.Vector3(...(cameraTargets[index] ?? [0, 0.85, 0]));
        return new THREE.Vector3(...point)
          .sub(target)
          .multiplyScalar(mobilePullback[index] ?? 1.2)
          .add(target);
      }),
    );
    const wantedPosition = new THREE.Vector3();
    const wantedTarget = new THREE.Vector3();
    const currentTarget = lookCurve.getPoint(0);
    const cameraOffset = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    let pointerLift = 0;
    let firstFrame = true;
    const dayColor = new THREE.Color("#c4bda9");
    const duskColor = new THREE.Color("#242824");
    const paleStone = new THREE.Color("#bdaf95");
    const basaltStone = new THREE.Color("#525956");
    const render = () => {
      frame = 0;
      diagnostic.renderPending = false;
      if (disposed || contextLost || !active || document.hidden) return;
      const s = settings.current;
      const daylight = s.mode === "daylight";
      const blend = s.motion ? 0.12 : 1;
      const j = journey.current;
      (element.clientWidth < 650 ? mobileCurve : curve).getPoint(j.progress, wantedPosition);
      lookCurve.getPoint(j.progress, wantedTarget);
      cameraOffset
        .copy(wantedPosition)
        .sub(wantedTarget)
        .applyAxisAngle(up, s.view * 0.15);
      wantedPosition.copy(wantedTarget).add(cameraOffset);
      if (!j.following && j.pointerEnabled && s.motion) wantedPosition.y += pointerLift;
      const cameraBlend = firstFrame || !s.motion ? 1 : 0.2;
      camera.position.lerp(wantedPosition, cameraBlend);
      currentTarget.lerp(wantedTarget, cameraBlend);
      camera.lookAt(currentTarget);
      firstFrame = false;
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
      diagnostic.cameraOwner = !s.motion
        ? "static"
        : j.following && j.enabled
          ? "scroll"
          : "visitor";
      diagnostic.journeyProgress = j.progress;
      diagnostic.scrollProgress = j.scrollProgress;
      diagnostic.chapter = lightChapters[chapterIndex.current]?.id ?? "threshold";
      diagnostic.camera = camera.position.toArray();
      diagnostic.target = currentTarget.toArray();
      if (--remaining > 0 && s.motion) {
        frame = requestAnimationFrame(render);
        diagnostic.renderPending = true;
      }
    };
    const request = (frames = 48) => {
      remaining = Math.max(remaining, settings.current.motion ? frames : 1);
      if (!frame && active && !contextLost && !document.hidden) {
        frame = requestAnimationFrame(render);
        diagnostic.renderPending = true;
      }
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
      // Wide desktop stages would otherwise open the horizontal view past 90 degrees and
      // shrink the pavilion; narrow the vertical angle so the section keeps its scale.
      camera.fov = camera.aspect > 2.1 ? 34 * Math.sqrt(2.1 / camera.aspect) : 34;
      camera.updateProjectionMatrix();
      request();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const setActive = (visible: boolean) => {
      active = !contextLost && visible;
      diagnostic.visible = active;
      if (active) request();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        diagnostic.renderPending = false;
      }
    };
    // The newest record wins when the browser batches an enter and a leave together.
    const visibility =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => setActive(Boolean(entries.at(-1)?.isIntersecting)),
            {
              rootMargin: "100px",
            },
          )
        : null;
    if (visibility) visibility.observe(element);
    else setActive(true);
    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        diagnostic.renderPending = false;
      } else request();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onPointer = (event: PointerEvent) => {
      if (
        event.pointerType !== "mouse" ||
        !settings.current.motion ||
        journey.current.following ||
        !journey.current.pointerEnabled
      )
        return;
      const bounds = element.getBoundingClientRect();
      pointerLift = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.16;
      request();
    };
    const onPointerLeave = () => {
      if (!pointerLift) return;
      pointerLift = 0;
      request();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      // Release the reflection target while the context is gone (GL calls are no-ops now).
      environment.dispose();
      setStatus("fallback");
      contextLost = true;
      active = false;
      diagnostic.status = "context-lost";
      diagnostic.visible = false;
      diagnostic.renderPending = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    // Three re-initialises its GL state on restore; the study only needs to resume drawing.
    const onRestored = () => {
      if (disposed) return;
      environment = buildEnvironment();
      scene.environment = environment.texture;
      contextLost = false;
      firstFrame = true;
      diagnostic.status = "ready";
      setStatus("ready");
      setActive(true);
    };
    element.addEventListener("pointermove", onPointer);
    element.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    renderer.domElement.addEventListener("webglcontextrestored", onRestored);
    resize();
    setStatus("ready");
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      update.current = null;
      observer.disconnect();
      visibility?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      element.removeEventListener("pointermove", onPointer);
      element.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onRestored);
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
      diagnostic.renderPending = false;
      diagnostic.scrollTriggerActive = false;
      diagnostic.journeyEnabled = false;
    };
  }, []);

  useGSAP(
    () => {
      if (!motion || status !== "ready") return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference) and (min-height: 600px)", () => {
        if (!track.current || !panel.current) return;
        journey.current.enabled = true;
        if (window.__AUREL_DIAGNOSTICS__) window.__AUREL_DIAGNOSTICS__.journeyEnabled = true;
        setScrollReady(true);
        const playhead = { progress: 0 };
        const sequence = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "aurel-light-journey",
            trigger: track.current,
            start: "top 20px",
            end: () =>
              `+=${Math.max(1, (track.current?.offsetHeight ?? 0) - (panel.current?.offsetHeight ?? 0))}`,
            scrub: 0.55,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              const diagnostic = window.__AUREL_DIAGNOSTICS__;
              if (diagnostic) {
                diagnostic.scrollStart = self.start;
                diagnostic.scrollEnd = self.end;
              }
            },
            onToggle: (self) => {
              const diagnostic = window.__AUREL_DIAGNOSTICS__;
              if (diagnostic) diagnostic.scrollTriggerActive = self.isActive;
            },
          },
          onUpdate: () => {
            if (reverting()) return;
            journey.current.scrollProgress = playhead.progress;
            if (journey.current.following) applyProgress(playhead.progress);
            const diagnostic = window.__AUREL_DIAGNOSTICS__;
            if (diagnostic) diagnostic.scrollProgress = playhead.progress;
          },
        });
        // A measured approach, a pause at the screen, then a lateral move to water.
        // CSS supplies the single sticky stage; ScrollTrigger never captures wheel or touch input.
        sequence
          .addLabel("threshold", 0)
          .to(playhead, { progress: 0.04, duration: 0.25 })
          .to(playhead, { progress: 0.5, duration: 1.15, ease: "power1.inOut" })
          .addLabel("timber")
          .to(playhead, { progress: 0.5, duration: 0.28 })
          .to(playhead, { progress: 1, duration: 1.2, ease: "power1.inOut" })
          .addLabel("water")
          .to(playhead, { progress: 1, duration: 0.24 });
        travel.current = sequence;
        const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          cancelAnimationFrame(refreshFrame);
          scrollTween.current?.kill();
          journey.current.enabled = false;
          travel.current = null;
          setScrollReady(false);
          const diagnostic = window.__AUREL_DIAGNOSTICS__;
          if (diagnostic) {
            diagnostic.scrollTriggerActive = false;
            diagnostic.journeyEnabled = false;
          }
        };
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [motion, status], revertOnUpdate: true },
  );

  // Programmatic scroll tweens deliberately live outside the useGSAP context: reverting a
  // context re-renders its recorded tweens at their start, which would yank the page back.
  useEffect(() => () => void scrollTween.current?.kill(), []);

  const jumpToChapter = (index: number) => {
    const destination = lightChapters[index];
    if (!destination) return;
    scrollTween.current?.kill();
    setView(0);
    setAnnouncement(`${destination.label} view`);
    const sequence = travel.current;
    const trigger = sequence?.scrollTrigger;
    if (sequence && trigger && journey.current.enabled) {
      journey.current.following = true;
      journey.current.pointerEnabled = false;
      setFollowing(true);
      applyProgress(journey.current.scrollProgress, 48);
      const labelTime = sequence.labels[destination.id] ?? 0;
      scrollTween.current = gsap.to(window, {
        duration: 0.8,
        ease: "power2.inOut",
        scrollTo: {
          y: trigger.start + (trigger.end - trigger.start) * (labelTime / sequence.duration()),
          autoKill: true,
        },
      });
    } else {
      takeControl();
      applyProgress(destination.progress, 48);
    }
  };

  const toggleCamera = () => {
    if (following) takeControl();
    else {
      journey.current.following = true;
      journey.current.pointerEnabled = false;
      setFollowing(true);
      setView(0);
      applyProgress(journey.current.scrollProgress, 48);
    }
  };

  const skipJourney = () => {
    const destination = controls.current;
    if (!destination) return;
    takeControl();
    const focusControls = () =>
      destination.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    if (motion && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scrollTween.current = gsap.to(window, {
        duration: 0.65,
        ease: "power2.out",
        scrollTo: { y: destination, offsetY: 24, autoKill: true, onAutoKill: focusControls },
        onComplete: focusControls,
        onInterrupt: focusControls,
      });
    } else {
      destination.scrollIntoView({ behavior: "instant", block: "start" });
      focusControls();
    }
  };

  return (
    <div
      className={`light-experience mode-${mode}`}
      ref={root}
      data-camera-owner={!motion ? "static" : scrollReady && following ? "scroll" : "visitor"}
    >
      <div className="study-journey" ref={track} data-scroll={scrollReady}>
        <div className="study-stage" ref={panel}>
          <div className="study-journey-toolbar">
            <p>
              {status !== "ready"
                ? "Light pavilion"
                : scrollReady && following
                  ? "Scroll to move through the pavilion"
                  : "Choose a view, then make it yours"}
            </p>
            <div>
              {scrollReady && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  data-state={following ? "following" : "paused"}
                >
                  {following ? "Pause camera" : "Resume scroll"}
                </button>
              )}
              <button type="button" onClick={skipJourney}>
                Material controls <Icon name="down" />
              </button>
            </div>
          </div>
          <div className="study-viewport">
            <div className="study-canvas" ref={host} />
            <div className="study-meta">
              <span className="meta-label">Interactive section</span>
              <span className="meta-label">
                {mode === "daylight" ? "11:00 / Sunlit" : "18:30 / Afterglow"}
              </span>
            </div>
            {status !== "ready" && (
              <div className="study-fallback">
                <div className="fallback-pavilion">
                  <div />
                  <div />
                  <div />
                </div>
                <p>
                  {status === "loading" ? "Finding the light…" : "A quiet study in proportion."}
                </p>
                <span>
                  {status === "loading"
                    ? "Preparing your pavilion"
                    : "The interactive pavilion needs WebGL. Explore the material notes below."}
                </span>
              </div>
            )}
          </div>
          <div className="study-journey-caption" id="aurel-light-caption">
            {lightChapters.map((item, index) => (
              <div
                className="study-journey-copy"
                key={item.id}
                data-chapter={item.id}
                aria-hidden={chapter !== index}
                inert={chapter !== index}
              >
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            ))}
          </div>
          <fieldset className="study-chapters" aria-label="Pavilion camera views">
            {lightChapters.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={chapter === index}
                aria-controls="aurel-light-caption"
                disabled={status !== "ready"}
                onClick={() => jumpToChapter(index)}
              >
                {item.label}
              </button>
            ))}
            <div className="study-journey-progress" aria-hidden="true">
              <span ref={progressFill} />
            </div>
          </fieldset>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </div>
      </div>
      <div className="study-caption">
        <p>
          {mode === "daylight"
            ? "Long shadows. Open possibilities."
            : "The moment a space becomes a sanctuary."}
        </p>
        <div className="view-controls">
          <button
            disabled={status !== "ready"}
            aria-disabled={view <= -2 || undefined}
            type="button"
            aria-label="View pavilion from further left"
            onClick={() => {
              if (view <= -2) return;
              takeControl(true);
              setView((v) => v - 1);
            }}
          >
            <Icon name="left" />
          </button>
          <span className="meta-label">Change perspective</span>
          <button
            disabled={status !== "ready"}
            aria-disabled={view >= 2 || undefined}
            type="button"
            aria-label="View pavilion from further right"
            onClick={() => {
              if (view >= 2) return;
              takeControl(true);
              setView((v) => v + 1);
            }}
          >
            <Icon name="right" />
          </button>
        </div>
      </div>
      <div className="study-controls" ref={controls}>
        <div>
          <p className="meta-label">The hour</p>
          <div className="segmented">
            {(["daylight", "dusk"] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={mode === value}
                onClick={() => {
                  takeControl();
                  setMode(value);
                }}
              >
                <Icon name={value === "daylight" ? "sun" : "moon"} />
                {value === "daylight" ? "Daylight" : "Dusk"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="meta-label">The surface</p>
          <div className="segmented">
            {(["limestone", "basalt"] as const).map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={finish === value}
                onClick={() => {
                  takeControl();
                  setFinish(value);
                }}
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
