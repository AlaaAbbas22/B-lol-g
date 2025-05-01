import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';

function Earth() {
  const earthRef = useRef();
  const texture = useLoader(TextureLoader, '/2k_earth_daymap.jpg');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 3 - 1,
        y: (event.clientY / window.innerHeight) * 3 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (earthRef.current) {
      (earthRef.current as Mesh).rotation.y = mousePosition.x * 2;
      (earthRef.current as Mesh).rotation.x = mousePosition.y * 2;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function EarthCanvas() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Earth />
    </Canvas>
  );
}