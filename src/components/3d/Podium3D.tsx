import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Sparkles, Award } from 'lucide-react';
import { RankingEntry } from '../../types';

interface Podium3DProps {
  topThree: RankingEntry[];
  title?: string;
  discipline?: string;
}

export const Podium3D: React.FC<Podium3DProps> = ({
  topThree = [],
  title = 'World Championship Podium Ceremony',
  discipline = 'Individual Target',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const podiumGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number>(0);

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = 220;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const podiumGroup = new THREE.Group();
    podiumGroupRef.current = podiumGroup;
    scene.add(podiumGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const goldSpot = new THREE.SpotLight(0xfbbf24, 3.5);
    goldSpot.position.set(0, 6, 4);
    goldSpot.castShadow = true;
    scene.add(goldSpot);

    const blueSpot = new THREE.DirectionalLight(0x38bdf8, 1.5);
    blueSpot.position.set(-5, 4, 3);
    scene.add(blueSpot);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(12, 6);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050c18,
      roughness: 0.2,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Podium Pedestals:
    // 1st Place (Center, Height 1.8) - Gold
    const p1Geo = new THREE.BoxGeometry(1.6, 1.8, 1.4);
    const p1Mat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.2
    });
    const p1 = new THREE.Mesh(p1Geo, p1Mat);
    p1.position.set(0, 0.9, 0);
    p1.castShadow = true;
    podiumGroup.add(p1);

    // 2nd Place (Left, Height 1.3) - Silver
    const p2Geo = new THREE.BoxGeometry(1.5, 1.3, 1.4);
    const p2Mat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.3
    });
    const p2 = new THREE.Mesh(p2Geo, p2Mat);
    p2.position.set(-1.8, 0.65, 0);
    p2.castShadow = true;
    podiumGroup.add(p2);

    // 3rd Place (Right, Height 0.9) - Bronze
    const p3Geo = new THREE.BoxGeometry(1.5, 0.9, 1.4);
    const p3Mat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.7,
      roughness: 0.4
    });
    const p3 = new THREE.Mesh(p3Geo, p3Mat);
    p3.position.set(1.8, 0.45, 0);
    p3.castShadow = true;
    podiumGroup.add(p3);

    // Golden Trophy on 1st place
    const trophyGroup = new THREE.Group();
    const cupGeo = new THREE.CylinderGeometry(0.3, 0.12, 0.5, 24);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.95,
      roughness: 0.1
    });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.y = 2.15;
    trophyGroup.add(cup);

    const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.15, 24);
    const base = new THREE.Mesh(baseGeo, cupMat);
    base.position.y = 1.88;
    trophyGroup.add(base);
    podiumGroup.add(trophyGroup);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      trophyGroup.rotation.y = time * 1.5;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-amber-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
            <p className="text-[11px] text-amber-400/90 font-mono">{discipline} • Official Victory Ceremony</p>
          </div>
        </div>
        <button
          onClick={triggerConfetti}
          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Celebrate</span>
        </button>
      </div>

      {/* 3D Podium Canvas */}
      <div ref={containerRef} className="w-full h-[180px]" />

      {/* Podium Athletes Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* 2nd Place (Silver) */}
        <div className="bg-slate-900/80 border border-slate-700/80 p-2.5 rounded-xl flex flex-col items-center text-center">
          <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center mb-1 shadow-md">
            2
          </div>
          <span className="text-lg">{second?.flag || '🇦🇹'}</span>
          <span className="text-xs font-bold text-white truncate max-w-full">{second?.name || 'Simone Steiner'}</span>
          <span className="text-[10px] text-slate-400 font-mono">{second?.country || 'Austria'}</span>
          <span className="text-[11px] font-mono font-semibold text-slate-300 mt-1">{second?.points || 2390} pts</span>
        </div>

        {/* 1st Place (Gold) */}
        <div className="bg-gradient-to-b from-amber-950/40 to-slate-900/90 border border-amber-500/50 p-2.5 rounded-xl flex flex-col items-center text-center shadow-lg shadow-amber-500/10">
          <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center mb-1 shadow-lg ring-2 ring-amber-300">
            1
          </div>
          <span className="text-xl">{first?.flag || '🇩🇪'}</span>
          <span className="text-xs font-bold text-amber-200 truncate max-w-full">{first?.name || 'Stefan Zellermayer'}</span>
          <span className="text-[10px] text-amber-400/90 font-mono">{first?.country || 'Germany'}</span>
          <span className="text-xs font-mono font-bold text-amber-300 mt-1">{first?.points || 2480} pts</span>
        </div>

        {/* 3rd Place (Bronze) */}
        <div className="bg-slate-900/80 border border-amber-800/50 p-2.5 rounded-xl flex flex-col items-center text-center">
          <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center mb-1 shadow-md">
            3
          </div>
          <span className="text-lg">{third?.flag || '🇮🇹'}</span>
          <span className="text-xs font-bold text-white truncate max-w-full">{third?.name || 'Markus Schätz'}</span>
          <span className="text-[10px] text-slate-400 font-mono">{third?.country || 'Italy'}</span>
          <span className="text-[11px] font-mono font-semibold text-amber-400 mt-1">{third?.points || 2210} pts</span>
        </div>
      </div>
    </div>
  );
};
