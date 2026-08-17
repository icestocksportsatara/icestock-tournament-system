import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe, MapPin, Trophy, Users, Shield, Flag } from 'lucide-react';

interface NationData {
  name: string;
  code: string;
  flag: string;
  lat: number;
  lng: number;
  players: number;
  medals: number;
  status: 'ACTIVE' | 'REGISTERED';
}

const NATIONS: NationData[] = [
  { name: 'Germany', code: 'GER', flag: '🇩🇪', lat: 51.1657, lng: 10.4515, players: 48, medals: 24, status: 'ACTIVE' },
  { name: 'Austria', code: 'AUT', flag: '🇦🇹', lat: 47.5162, lng: 14.5501, players: 42, medals: 21, status: 'ACTIVE' },
  { name: 'Italy', code: 'ITA', flag: '🇮🇹', lat: 41.8719, lng: 12.5674, players: 36, medals: 16, status: 'ACTIVE' },
  { name: 'Switzerland', code: 'SUI', flag: '🇨🇭', lat: 46.8182, lng: 8.2275, players: 28, medals: 11, status: 'ACTIVE' },
  { name: 'India', code: 'IND', flag: '🇮🇳', lat: 20.5937, lng: 78.9629, players: 32, medals: 8, status: 'ACTIVE' },
  { name: 'Brazil', code: 'BRA', flag: '🇧🇷', lat: -14.235, lng: -51.9253, players: 24, medals: 6, status: 'ACTIVE' },
  { name: 'Canada', code: 'CAN', flag: '🇨🇦', lat: 56.1304, lng: -106.3468, players: 18, medals: 4, status: 'ACTIVE' },
  { name: 'USA', code: 'USA', flag: '🇺🇸', lat: 37.0902, lng: -95.7129, players: 20, medals: 5, status: 'ACTIVE' },
  { name: 'Slovenia', code: 'SLO', flag: '🇸🇮', lat: 46.1512, lng: 14.9955, players: 16, medals: 7, status: 'ACTIVE' },
  { name: 'Czech Republic', code: 'CZE', flag: '🇨🇿', lat: 49.8175, lng: 15.473, players: 18, medals: 4, status: 'ACTIVE' },
  { name: 'Australia', code: 'AUS', flag: '🇦🇺', lat: -25.2744, lng: 133.7751, players: 12, medals: 2, status: 'REGISTERED' },
  { name: 'Japan', code: 'JPN', flag: '🇯🇵', lat: 36.2048, lng: 138.2529, players: 14, medals: 3, status: 'REGISTERED' },
];

export const Globe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNation, setSelectedNation] = useState<NationData>(NATIONS[0]);
  const [hoveredNation, setHoveredNation] = useState<NationData | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number>(0);

  // Convert lat/lng to 3D sphere coordinate
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 320;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Globe Core Sphere (Dark Blue / Ice Hex Atmosphere)
    const globeRadius = 2.4;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x051329,
      roughness: 0.8,
      metalness: 0.2,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);

    // Wireframe Grid Overlay for futuristic sports tech feel
    const wireGeo = new THREE.SphereGeometry(globeRadius + 0.02, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Outer Atmospheric Glow
    const haloGeo = new THREE.SphereGeometry(globeRadius + 0.25, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // Add glowing pin markers for all nations
    NATIONS.forEach((nation) => {
      const pos = latLngToVector3(nation.lat, nation.lng, globeRadius);

      // Pin base
      const pinGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.1
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      globeGroup.add(pinMesh);

      // Pulse ring on each nation
      const pulseGeo = new THREE.RingGeometry(0.08, 0.11, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.copy(pos.clone().multiplyScalar(1.01));
      pulseMesh.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(pulseMesh);

      // Elevated Light Beams pointing outwards
      const beamGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.7
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.copy(pos.clone().multiplyScalar(1.08));
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      globeGroup.add(beamMesh);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Mouse rotation drag
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !globeGroupRef.current) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      globeGroupRef.current.rotation.y += deltaX * 0.006;
      globeGroupRef.current.rotation.x += deltaY * 0.004;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize observer
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
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (globeGroupRef.current && !isDragging) {
        globeGroupRef.current.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-cyan-500/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-4">
      {/* 3D Globe Canvas Container */}
      <div className="relative w-full md:w-3/5 h-64 md:h-72 cursor-grab active:cursor-grabbing flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full" />
        
        {/* Globe overlay tag */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
          <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>IFI 38 Member Federations</span>
        </div>
      </div>

      {/* Nation Selector & Stats Column */}
      <div className="w-full md:w-2/5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-mono">Global Footprint</h4>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{selectedNation.flag}</span>
              <span>{selectedNation.name} Federation</span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 font-mono">
            {selectedNation.status}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>Accredited</span>
            </div>
            <div className="text-base font-bold text-white font-mono">{selectedNation.players} Athletes</div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 flex items-center gap-1 mb-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Medal Vault</span>
            </div>
            <div className="text-base font-bold text-amber-400 font-mono">{selectedNation.medals} Titles</div>
          </div>
        </div>

        {/* Quick Country Buttons Carousel */}
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {NATIONS.map((nation) => (
            <button
              key={nation.code}
              onClick={() => setSelectedNation(nation)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
                selectedNation.code === nation.code
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{nation.flag}</span>
              <span>{nation.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
