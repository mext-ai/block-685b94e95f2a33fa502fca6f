import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BlockProps {
  title?: string;
  description?: string;
}

// Composant de la voiture
function Car({ position, rotation, onPositionChange }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [carPosition, setCarPosition] = useState(position);
  const [carRotation, setCarRotation] = useState(rotation);
  const [velocity, setVelocity] = useState({ x: 0, z: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.code] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!carRef.current) return;

    const speed = 0.05;
    const rotationSpeed = 0.03;
    let newVelocity = { ...velocity };
    let newRotation = carRotation;

    // Contrôles de direction
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
      newRotation += rotationSpeed;
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
      newRotation -= rotationSpeed;
    }

    // Contrôles d'accélération
    if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) {
      newVelocity.x += Math.sin(newRotation) * speed;
      newVelocity.z += Math.cos(newRotation) * speed;
    }
    if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) {
      newVelocity.x -= Math.sin(newRotation) * speed * 0.5;
      newVelocity.z -= Math.cos(newRotation) * speed * 0.5;
    }

    // Friction
    newVelocity.x *= 0.95;
    newVelocity.z *= 0.95;

    // Mise à jour de la position
    const newPosition = [
      carPosition[0] + newVelocity.x,
      carPosition[1],
      carPosition[2] + newVelocity.z
    ];

    // Limites de la piste
    const trackLimit = 15;
    if (Math.abs(newPosition[0]) > trackLimit) {
      newPosition[0] = carPosition[0];
      newVelocity.x = 0;
    }
    if (Math.abs(newPosition[2]) > trackLimit) {
      newPosition[2] = carPosition[2];
      newVelocity.z = 0;
    }

    setCarPosition(newPosition);
    setCarRotation(newRotation);
    setVelocity(newVelocity);

    // Mise à jour de l'objet 3D
    carRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
    carRef.current.rotation.y = newRotation;

    onPositionChange(newPosition);
  });

  return (
    <group ref={carRef}>
      {/* Corps de la voiture */}
      <Box args={[2, 0.5, 4]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#ff4444" />
      </Box>
      {/* Toit */}
      <Box args={[1.5, 0.8, 2]} position={[0, 0.9, -0.2]}>
        <meshStandardMaterial color="#cc3333" />
      </Box>
      {/* Roues */}
      <Box args={[0.3, 0.6, 0.6]} position={[-1.2, -0.1, 1.3]}>
        <meshStandardMaterial color="#222222" />
      </Box>
      <Box args={[0.3, 0.6, 0.6]} position={[1.2, -0.1, 1.3]}>
        <meshStandardMaterial color="#222222" />
      </Box>
      <Box args={[0.3, 0.6, 0.6]} position={[-1.2, -0.1, -1.3]}>
        <meshStandardMaterial color="#222222" />
      </Box>
      <Box args={[0.3, 0.6, 0.6]} position={[1.2, -0.1, -1.3]}>
        <meshStandardMaterial color="#222222" />
      </Box>
    </group>
  );
}

// Composant de la piste
function Track() {
  return (
    <group>
      {/* Sol principal */}
      <Plane args={[40, 40]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#333333" />
      </Plane>
      
      {/* Lignes de la piste */}
      <Plane args={[0.2, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Plane>
      <Plane args={[30, 0.2]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Plane>
      
      {/* Bordures */}
      {[-15, 15].map((x, i) => (
        <Box key={`border-x-${i}`} args={[0.5, 1, 30]} position={[x, 0, 0]}>
          <meshStandardMaterial color="#ff8800" />
        </Box>
      ))}
      {[-15, 15].map((z, i) => (
        <Box key={`border-z-${i}`} args={[30, 1, 0.5]} position={[0, 0, z]}>
          <meshStandardMaterial color="#ff8800" />
        </Box>
      ))}
    </group>
  );
}

// Caméra qui suit la voiture
function CarCamera({ carPosition }: { carPosition: number[] }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Position de la caméra derrière et au-dessus de la voiture
    const cameraOffset = new THREE.Vector3(0, 5, 8);
    const targetPosition = new THREE.Vector3(carPosition[0], carPosition[1], carPosition[2]);
    
    camera.position.lerp(targetPosition.clone().add(cameraOffset), 0.05);
    camera.lookAt(targetPosition);
  });

  return null;
}

// Interface utilisateur
function UI() {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      padding: '15px',
      borderRadius: '10px'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>🏎️ Jeu de Course 3D</h3>
      <div>🎮 Contrôles:</div>
      <div>↑/W - Accélérer</div>
      <div>↓/S - Freiner</div>
      <div>←/A - Tourner à gauche</div>
      <div>→/D - Tourner à droite</div>
    </div>
  );
}

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [carPosition, setCarPosition] = useState([0, 0, 0]);

  useEffect(() => {
    // Envoyer l'événement de completion au démarrage
    const sendCompletion = () => {
      window.postMessage({ type: 'BLOCK_COMPLETION', blockId: 'car-racing-3d', completed: true }, '*');
      window.parent.postMessage({ type: 'BLOCK_COMPLETION', blockId: 'car-racing-3d', completed: true }, '*');
    };
    
    // Délai pour s'assurer que le jeu est chargé
    setTimeout(sendCompletion, 1000);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <UI />
      <Canvas
        camera={{ position: [0, 5, 8], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #87CEEB, #98FB98)' }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Piste */}
        <Track />
        
        {/* Voiture */}
        <Car 
          position={[0, 0, 0]} 
          rotation={0}
          onPositionChange={setCarPosition}
        />
        
        {/* Caméra qui suit */}
        <CarCamera carPosition={carPosition} />
      </Canvas>
    </div>
  );
};

export default Block;