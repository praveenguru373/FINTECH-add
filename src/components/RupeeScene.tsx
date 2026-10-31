import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

function Coin({ position, scale = 1, speed = 0.5 }: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * speed;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.45 + position[0]) * 0.12;
    group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.08;
  });

  return <group ref={group} position={position} scale={scale}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.63, 0.63, 0.12, 48]} />
      <meshStandardMaterial color="#e0bd72" metalness={0.78} roughness={0.24} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.04}>
      <torusGeometry args={[0.61, 0.025, 8, 48]} />
      <meshStandardMaterial color="#fff1d2" metalness={0.72} roughness={0.23} />
    </mesh>
  </group>;
}

function SceneObjects() {
  const group = useRef<Group>(null);
  const center = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
      group.current.rotation.x += (pointer.y * 0.12 - group.current.rotation.x) * 0.035;
      group.current.rotation.z += (pointer.x * -0.1 - group.current.rotation.z) * 0.035;
    }
    if (center.current) center.current.rotation.y += delta * 0.2;
  });

  return <group ref={group}>
    <mesh ref={center} position={[0, 0, 0]}>
      <sphereGeometry args={[1.18, 48, 48]} />
      <meshStandardMaterial color="#414b68" metalness={0.48} roughness={0.22} emissive="#252d46" emissiveIntensity={0.34} />
    </mesh>
    <mesh position={[0, 0, 0.84]}>
      <torusGeometry args={[1.32, 0.028, 12, 96]} />
      <meshStandardMaterial color="#d58a70" metalness={0.8} roughness={0.2} emissive="#754538" emissiveIntensity={0.22} />
    </mesh>
    <Coin position={[-1.85, 1.08, 0.45]} scale={0.57} speed={0.62} />
    <Coin position={[1.85, -0.92, 0.38]} scale={0.42} speed={-0.42} />
    <Coin position={[1.68, 1.18, -0.55]} scale={0.3} speed={0.7} />
    <pointLight position={[2.8, 2.8, 3.6]} color="#fff0d0" intensity={20} distance={9} />
    <pointLight position={[-2.8, -1.5, 2]} color="#d58a70" intensity={12} distance={8} />
  </group>;
}

export default function RupeeScene() {
  return <Canvas
    dpr={[1, 1.5]}
    camera={{ position: [0, 0, 6.7], fov: 40 }}
    gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    aria-hidden="true"
  >
    <ambientLight intensity={1.4} />
    <directionalLight position={[-3, 5, 5]} intensity={3} color="#ffffff" />
    <SceneObjects />
  </Canvas>;
}
