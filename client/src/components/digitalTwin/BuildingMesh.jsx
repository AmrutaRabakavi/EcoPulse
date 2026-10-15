import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BuildingMesh = ({
  zone,
  isSelected,
  onSelect,
  showSolarLayer = true,
  showBinsLayer = true,
}) => {
  const meshRef = useRef();
  const beaconRef = useRef();
  const [hovered, setHovered] = useState(false);

  const [x, y, z] = zone.position;
  const [w, h, d] = zone.size;

  // Pulse beacon animation
  useFrame((state, delta) => {
    if (beaconRef.current) {
      beaconRef.current.position.y = h / 2 + 1.8 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
      beaconRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* ── Main Building Structure ─────────────────────────────────── */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(zone);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={hovered ? zone.accentColor : zone.color}
          roughness={0.4}
          metalness={0.2}
          emissive={isSelected ? '#10b981' : hovered ? '#0284c7' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* ── Concrete Base Plinth ─────────────────────────────────────── */}
      <mesh position={[0, -h / 2 + 0.1, 0]} receiveShadow>
        <boxGeometry args={[w + 0.6, 0.2, d + 0.6]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>

      {/* ── Rooftop Parapet Border ───────────────────────────────────── */}
      <mesh position={[0, h / 2 + 0.1, 0]}>
        <boxGeometry args={[w + 0.15, 0.2, d + 0.15]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* ── Rooftop Solar Panel Array (When Solar Layer Enabled) ─────── */}
      {showSolarLayer && zone.hasSolar && (
        <group position={[0, h / 2 + 0.25, 0]}>
          <mesh rotation={[-Math.PI / 12, 0, 0]}>
            <boxGeometry args={[w * 0.75, 0.1, d * 0.65]} />
            <meshStandardMaterial
              color="#0c4a6e"
              metalness={0.8}
              roughness={0.15}
              emissive="#0284c7"
              emissiveIntensity={0.15}
            />
          </mesh>
        </group>
      )}

      {/* ── Smart Dustbin Station Marker (When Bin Layer Enabled) ─────── */}
      {showBinsLayer && zone.hasBins && (
        <group position={[w / 2 + 0.5, -h / 2 + 0.4, d / 3]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.7, 12]} />
            <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Bin Lid */}
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.08, 12]} />
            <meshStandardMaterial color="#047857" />
          </mesh>
        </group>
      )}

      {/* ── Floating Status Beacon ──────────────────────────────────── */}
      <group ref={beaconRef} position={[0, h / 2 + 1.8, 0]}>
        {/* Glowing Diamond / Crystal */}
        <mesh>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial
            color={zone.beaconColor}
            emissive={zone.beaconColor}
            emissiveIntensity={isSelected ? 0.9 : 0.6}
            roughness={0.1}
          />
        </mesh>
        {/* Pulsing Light Halo */}
        <pointLight
          color={zone.beaconColor}
          intensity={isSelected ? 3 : 1.5}
          distance={4}
          decay={2}
        />
      </group>
    </group>
  );
};

export default BuildingMesh;
