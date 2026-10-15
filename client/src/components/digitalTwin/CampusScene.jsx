import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BuildingMesh from './BuildingMesh';
import CampusEnvironment from './CampusEnvironment';
import { CAMPUS_ZONES } from './campusData';

// Component to handle smooth camera target panning when a zone is selected
const CameraController = ({ selectedZone, autoRotate }) => {
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current && selectedZone && Array.isArray(selectedZone.position)) {
      const [tx, ty, tz] = selectedZone.position;
      // Smoothly set OrbitControls target to selected building
      controlsRef.current.target.set(tx, ty, tz);
    } else if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
  }, [selectedZone]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.1} // Prevent going below ground
      minDistance={12}
      maxDistance={70}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
    />
  );
};

const CampusScene = ({
  selectedZone,
  onSelectZone,
  showSolarLayer = true,
  showBinsLayer = true,
  showGreeneryLayer = true,
  autoRotate = false,
}) => {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [28, 22, 28], fov: 45 }}
        className="w-full h-full bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950"
      >
        {/* ── Environment Lighting ──────────────────────────────────── */}
        <ambientLight intensity={0.7} />
        <hemisphereLight
          args={['#7dd3fc', '#14532d', 0.6]} // Sky to ground tint
        />
        <directionalLight
          position={[25, 40, 20]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
          shadow-camera-near={1}
          shadow-camera-far={100}
        />

        {/* Subtle decorative fog for depth */}
        <fog attach="fog" args={['#0f172a', 35, 90]} />

        {/* ── Camera Controls ───────────────────────────────────────── */}
        <CameraController selectedZone={selectedZone} autoRotate={autoRotate} />

        {/* ── Campus Terrain & Environment ──────────────────────────── */}
        <CampusEnvironment showGreeneryLayer={showGreeneryLayer} />

        {/* ── Procedural Campus Buildings ───────────────────────────── */}
        {CAMPUS_ZONES.map((zone) => (
          <BuildingMesh
            key={zone.id}
            zone={zone}
            isSelected={selectedZone?.id === zone.id}
            onSelect={onSelectZone}
            showSolarLayer={showSolarLayer}
            showBinsLayer={showBinsLayer}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default CampusScene;
