import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface BlockProps {
  title?: string;
  description?: string;
}

// Composant de la voiture
function Car({ position, rotation, onPositionChange, onLapComplete }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [carPosition, setCarPosition] = useState(position);
  const [carRotation, setCarRotation] = useState(rotation);
  const [velocity, setVelocity] = useState({ x: 0, z: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const [checkpoints, setCheckpoints] = useState({
    checkpoint1: false,
    checkpoint2: false,
    checkpoint3: false,
    checkpoint4: false
  });

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

  // Fonction pour vérifier les checkpoints (adaptée pour la piste circulaire)
  const checkCheckpoints = (pos: number[]) => {
    const x = pos[0];
    const z = pos[2];
    let newCheckpoints = { ...checkpoints };
    
    // Checkpoint 1 (haut de la piste)
    if (z > 15 && Math.abs(x) < 5 && !checkpoints.checkpoint1) {
      newCheckpoints.checkpoint1 = true;
    }
    // Checkpoint 2 (droite de la piste)
    if (x > 15 && Math.abs(z) < 5 && checkpoints.checkpoint1 && !checkpoints.checkpoint2) {
      newCheckpoints.checkpoint2 = true;
    }
    // Checkpoint 3 (bas de la piste)
    if (z < -15 && Math.abs(x) < 5 && checkpoints.checkpoint2 && !checkpoints.checkpoint3) {
      newCheckpoints.checkpoint3 = true;
    }
    // Checkpoint 4 (gauche de la piste)
    if (x < -15 && Math.abs(z) < 5 && checkpoints.checkpoint3 && !checkpoints.checkpoint4) {
      newCheckpoints.checkpoint4 = true;
    }
    
    // Ligne d'arrivée (tour complet)
    if (z > -5 && z < 5 && Math.abs(x) < 5 && 
        checkpoints.checkpoint1 && checkpoints.checkpoint2 && 
        checkpoints.checkpoint3 && checkpoints.checkpoint4) {
      // Tour complet !
      onLapComplete();
      newCheckpoints = {
        checkpoint1: false,
        checkpoint2: false,
        checkpoint3: false,
        checkpoint4: false
      };
    }
    
    setCheckpoints(newCheckpoints);
  };

  useFrame(() => {
    if (!carRef.current) return;

    const speed = 0.1;
    const rotationSpeed = 0.04;
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
      newVelocity.x -= Math.sin(newRotation) * speed * 0.6;
      newVelocity.z -= Math.cos(newRotation) * speed * 0.6;
    }

    // Friction
    newVelocity.x *= 0.96;
    newVelocity.z *= 0.96;

    // Mise à jour de la position
    const newPosition = [
      carPosition[0] + newVelocity.x,
      carPosition[1],
      carPosition[2] + newVelocity.z
    ];

    // Limites générales pour éviter que la voiture sorte trop loin
    const trackLimit = 25;
    if (Math.abs(newPosition[0]) > trackLimit) {
      newPosition[0] = carPosition[0];
      newVelocity.x *= -0.3;
    }
    if (Math.abs(newPosition[2]) > trackLimit) {
      newPosition[2] = carPosition[2];
      newVelocity.z *= -0.3;
    }

    setCarPosition(newPosition);
    setCarRotation(newRotation);
    setVelocity(newVelocity);
    checkCheckpoints(newPosition);

    // Mise à jour de l'objet 3D
    if (carRef.current) {
      carRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
      carRef.current.rotation.y = newRotation;
    }

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

// Composant pour charger et afficher votre piste 3D
function RaceTrack() {
  const { scene } = useGLTF('https://mext-content-library.s3.eu-west-3.amazonaws.com/uploads/90d075a3-bdf2-4b14-9d30-30d8df192786.glb');
  
  return (
    <group>
      <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} />
      
      {/* Checkpoints verts pour le système de tours */}
      <Box args={[3, 0.5, 1]} position={[0, 1, 20]}>
        <meshStandardMaterial color="#00ff00" transparent opacity={0.7} />
      </Box>
      <Box args={[1, 0.5, 3]} position={[20, 1, 0]}>
        <meshStandardMaterial color="#00ff00" transparent opacity={0.7} />
      </Box>
      <Box args={[3, 0.5, 1]} position={[0, 1, -20]}>
        <meshStandardMaterial color="#00ff00" transparent opacity={0.7} />
      </Box>
      <Box args={[1, 0.5, 3]} position={[-20, 1, 0]}>
        <meshStandardMaterial color="#00ff00" transparent opacity={0.7} />
      </Box>
      
      {/* Ligne de départ/arrivée */}
      <Box args={[4, 0.5, 1]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
    </group>
  );
}

// Caméra qui suit la voiture
function CarCamera({ carPosition }: { carPosition: number[] }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const cameraOffset = new THREE.Vector3(0, 8, 12);
    const targetPosition = new THREE.Vector3(carPosition[0], carPosition[1], carPosition[2]);
    
    camera.position.lerp(targetPosition.clone().add(cameraOffset), 0.05);
    camera.lookAt(targetPosition);
  });

  return null;
}

// Interface utilisateur avec compteur de tours
function UI({ currentLap, totalLaps, gameWon, raceTime }: any) {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      padding: '20px',
      borderRadius: '15px',
      minWidth: '250px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#ffdd00' }}>🏁 Piste Low Poly</h3>
      
      <div style={{ fontSize: '20px', marginBottom: '10px', color: '#00ff88' }}>
        Tour: {currentLap}/{totalLaps}
      </div>
      
      <div style={{ marginBottom: '15px', color: '#88ddff' }}>
        Temps: {Math.floor(raceTime / 1000)}s
      </div>
      
      {gameWon && (
        <div style={{ 
          fontSize: '24px', 
          color: '#ffdd00', 
          fontWeight: 'bold',
          marginBottom: '15px',
          animation: 'blink 1s infinite'
        }}>
          🏆 VICTOIRE ! 🏆
        </div>
      )}
      
      <div style={{ fontSize: '14px', borderTop: '1px solid #666', paddingTop: '10px' }}>
        <div>🎮 Contrôles:</div>
        <div>↑/W - Accélérer</div>
        <div>↓/S - Freiner</div>
        <div>←/A - Tourner à gauche</div>
        <div>→/D - Tourner à droite</div>
      </div>
    </div>
  );
}

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [carPosition, setCarPosition] = useState([0, 1, 0]);
  const [currentLap, setCurrentLap] = useState(0);
  const [totalLaps] = useState(3);
  const [gameWon, setGameWon] = useState(false);
  const [startTime] = useState(Date.now());
  const [raceTime, setRaceTime] = useState(0);

  const handleLapComplete = () => {
    if (!gameWon) {
      const newLap = currentLap + 1;
      setCurrentLap(newLap);
      
      if (newLap >= totalLaps) {
        setGameWon(true);
        // Envoyer l'événement de completion quand la course est terminée
        window.postMessage({ 
          type: 'BLOCK_COMPLETION', 
          blockId: 'car-racing-3d', 
          completed: true,
          score: Math.max(1000 - Math.floor((Date.now() - startTime) / 100), 100),
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        }, '*');
        window.parent.postMessage({ 
          type: 'BLOCK_COMPLETION', 
          blockId: 'car-racing-3d', 
          completed: true,
          score: Math.max(1000 - Math.floor((Date.now() - startTime) / 100), 100),
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        }, '*');
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setRaceTime(Date.now() - startTime);
    }, 100);
    
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
        `}
      </style>
      
      <UI 
        currentLap={currentLap} 
        totalLaps={totalLaps} 
        gameWon={gameWon}
        raceTime={raceTime}
      />
      
      <Canvas
        camera={{ position: [0, 12, 15], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #87CEEB, #98FB98)' }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[15, 15, 10]} intensity={1.2} />
        <directionalLight position={[-15, 15, -10]} intensity={0.8} />
        
        {/* Votre piste 3D */}
        <RaceTrack />
        
        {/* Voiture - Position légèrement surélevée */}
        <Car 
          position={[0, 1, 0]} 
          rotation={Math.PI}
          onPositionChange={setCarPosition}
          onLapComplete={handleLapComplete}
        />
        
        {/* Caméra qui suit */}
        <CarCamera carPosition={carPosition} />
      </Canvas>
    </div>
  );
};

export default Block;