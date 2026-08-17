import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Sparkles, Shield, Play, Pause, RefreshCw } from 'lucide-react';

interface Icestock3DViewerProps {
  initialColor?: string;
  stockName?: string;
  weightKg?: number;
  interactive?: boolean;
}

export const Icestock3DViewer: React.FC<Icestock3DViewerProps> = ({
  initialColor = '#3b82f6',
  stockName = 'IFI Pro Master 2026',
  weightKg = 3.82,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState(initialColor);
  const [isRotating, setIsRotating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isGliding, setIsGliding] = useState(false);
  const [plateType, setPlateType] = useState('Type M (Medium)');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stockGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5.5, 9);
    camera.lookAt(0, 0.8, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear previous canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x60a5fa, 2.5);
    mainLight.position.set(5, 12, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 3, 20);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    const warmAccent = new THREE.PointLight(0xf59e0b, 1.2, 15);
    warmAccent.position.set(6, 2, -4);
    scene.add(warmAccent);

    // Ice Surface Plane
    const iceGeo = new THREE.CylinderGeometry(6, 6, 0.2, 64);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7
    });
    const iceFloor = new THREE.Mesh(iceGeo, iceMat);
    iceFloor.position.y = -0.1;
    iceFloor.receiveShadow = true;
    scene.add(iceFloor);

    // Concentric Target Rings on Ice
    const ringColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
    for (let r = 1; r <= 4; r++) {
      const ringGeo = new THREE.RingGeometry(r * 1.1, r * 1.1 + 0.04, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[r - 1],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.01;
      scene.add(ringMesh);
    }

    // Ice stock Model Group
    const stockGroup = new THREE.Group();
    stockGroupRef.current = stockGroup;
    scene.add(stockGroup);

    // 1. Sliding Plate (Laufsohle)
    const plateGeo = new THREE.CylinderGeometry(1.5, 1.45, 0.35, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.9
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.18;
    plateMesh.castShadow = true;
    stockGroup.add(plateMesh);

    // 2. Heavy Chrome Steel Outer Ring (Stahlring)
    const ringGeo = new THREE.TorusGeometry(1.52, 0.22, 24, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15
    });
    const steelRing = new THREE.Mesh(ringGeo, ringMat);
    steelRing.rotation.x = Math.PI / 2;
    steelRing.position.y = 0.45;
    steelRing.castShadow = true;
    stockGroup.add(steelRing);

    // 3. Main Stock Body Disc (Stockkörper)
    const bodyGeo = new THREE.CylinderGeometry(1.48, 1.5, 0.5, 48);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.25,
      metalness: 0.6
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.name = 'stockBody';
    bodyMesh.position.y = 0.55;
    bodyMesh.castShadow = true;
    stockGroup.add(bodyMesh);

    // Top Beveled Cap
    const capGeo = new THREE.CylinderGeometry(1.0, 1.48, 0.25, 48);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = 0.88;
    capMesh.castShadow = true;
    stockGroup.add(capMesh);

    // Center IFI Official Emblem Ring
    const emblemGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 32);
    const emblemMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
    emblemMesh.position.y = 1.02;
    stockGroup.add(emblemMesh);

    // 4. Handle Socket (Stielaufnahme)
    const socketGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.4, 24);
    const socketMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2
    });
    const socketMesh = new THREE.Mesh(socketGeo, socketMat);
    socketMesh.position.y = 1.2;
    stockGroup.add(socketMesh);

    // 5. Curved Ergonomic Handle (Stiel)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.35, 0),
      new THREE.Vector3(0.08, 2.2, 0.05),
      new THREE.Vector3(0.35, 3.2, 0.2),
      new THREE.Vector3(0.5, 3.8, 0.3)
    ]);
    const handleGeo = new THREE.TubeGeometry(curve, 32, 0.11, 16, false);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8
    });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.castShadow = true;
    stockGroup.add(handleMesh);

    // 6. Leather / Rubber Grip on Top
    const gripCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.28, 3.0, 0.16),
      new THREE.Vector3(0.42, 3.5, 0.25),
      new THREE.Vector3(0.5, 3.8, 0.3)
    ]);
    const gripGeo = new THREE.TubeGeometry(gripCurve, 20, 0.14, 16, false);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.7,
      metalness: 0.2
    });
    const gripMesh = new THREE.Mesh(gripGeo, gripMat);
    stockGroup.add(gripMesh);

    // Handle Top Pommel
    const pommelGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const pommelMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1
    });
    const pommel = new THREE.Mesh(pommelGeo, pommelMat);
    pommel.position.set(0.51, 3.85, 0.31);
    stockGroup.add(pommel);

    // Mouse Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const domElem = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !stockGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      stockGroupRef.current.rotation.y += deltaX * 0.01;
      stockGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, stockGroupRef.current.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    if (interactive) {
      domElem.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && rendererRef.current) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (stockGroupRef.current) {
        if (isRotating && !isDragging) {
          stockGroupRef.current.rotation.y += 0.012;
        }

        if (isGliding) {
          stockGroupRef.current.position.z = Math.sin(elapsedTime * 2.5) * 1.4;
          stockGroupRef.current.position.x = Math.cos(elapsedTime * 1.5) * 0.6;
          stockGroupRef.current.rotation.y += 0.04;
        } else {
          stockGroupRef.current.position.set(0, 0, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      if (interactive) {
        domElem.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
      renderer.dispose();
    };
  }, [interactive, isRotating, isGliding]);

  // Update Color & Wireframe dynamically
  useEffect(() => {
    if (!stockGroupRef.current) return;
    stockGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === 'stockBody' && child.material) {
          (child.material as THREE.MeshStandardMaterial).color.set(color);
        }
        if (child.material) {
          (child.material as THREE.MeshStandardMaterial).wireframe = wireframe;
        }
      }
    });
  }, [color, wireframe]);

  const presetColors = [
    { name: 'Sapphire Pro', hex: '#2563eb' },
    { name: 'Crimson Elite', hex: '#dc2626' },
    { name: 'Emerald Speed', hex: '#059669' },
    { name: 'Amber Gold', hex: '#d97706' },
    { name: 'Obsidian Stealth', hex: '#334155' },
    { name: 'Electric Violet', hex: '#7c3aed' },
  ];

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-cyan-500/20 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col justify-between p-4 shadow-2xl">
      {/* Top Bar with specs */}
      <div className="flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
              3D IFI Certified Model
            </span>
          </div>
          <h4 className="text-base font-bold text-white tracking-wide">{stockName}</h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>IFI Homologated • {weightKg} kg</span>
        </div>
      </div>

      {/* 3D Canvas Canvas Container */}
      <div ref={containerRef} className="w-full h-64 cursor-grab active:cursor-grabbing my-auto" />

      {/* Controls Overlay */}
      <div className="z-10 bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Color Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Shell:</span>
          {presetColors.map((c) => (
            <button
              key={c.hex}
              onClick={() => setColor(c.hex)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                color === c.hex ? 'scale-125 border-white ring-2 ring-cyan-400' : 'border-slate-600 hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
              isRotating
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Auto Rotate"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>Spin</span>
          </button>

          <button
            onClick={() => setIsGliding(!isGliding)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
              isGliding
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Ice Gliding Physics Simulation"
          >
            {isGliding ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Glide Test</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
              wireframe
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="CAD Wireframe Structure"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>CAD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
