import React, { useMemo } from 'react';
import * as THREE from 'three';

// Procedural low-poly tree
const Tree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.2, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Foliage Tier 1 */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.9, 1.4, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      {/* Foliage Tier 2 */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[0.65, 1.1, 6]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>
    </group>
  );
};

const CampusEnvironment = ({ showGreeneryLayer = true }) => {
  // Precompute random tree clusters around the campus perimeter and between buildings
  const treeLocations = useMemo(() => {
    return [
      [-6, 0, -3],
      [-6, 0, 3],
      [6, 0, -2],
      [6, 0, 4],
      [-19, 0, -4],
      [-19, 0, 8],
      [19, 0, -2],
      [19, 0, 12],
      [-4, 0, 10],
      [5, 0, 11],
      [-7, 0, -11],
      [7, 0, -11],
      [-15, 0, 16],
      [15, 0, 16],
      [-16, 0, -12],
      [16, 0, -12],
      [0, 0, -8],
      [0, 0, 8],
      [-20, 0, 0],
      [20, 0, 3],
    ];
  }, []);

  return (
    <group>
      {/* ── Main Campus Ground (Lush Eco Grass) ─────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[65, 65]} />
        <meshStandardMaterial color="#1e3a1e" roughness={0.95} />
      </mesh>

      {/* ── Outer Campus Concrete Border ─────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[72, 72]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* ── Walkways / Paths Connecting Zones ────────────────────────── */}
      {/* North-South Central Axis */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[3, 40]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.85} />
      </mesh>

      {/* East-West Central Axis */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={[40, 3]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.85} />
      </mesh>

      {/* Diagonal Paths to Hostels and Labs */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[2.5, 48]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>

      {/* ── Central Plaza Ring ───────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[5, 6.2, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>

      {/* ── Low-Poly Trees Cluster (When Greenery Layer Enabled) ─────── */}
      {showGreeneryLayer && (
        <group>
          {treeLocations.map(([tx, ty, tz], idx) => (
            <Tree
              key={idx}
              position={[tx, ty, tz]}
              scale={0.85 + (idx % 4) * 0.15}
            />
          ))}
        </group>
      )}
    </group>
  );
};

export default CampusEnvironment;
