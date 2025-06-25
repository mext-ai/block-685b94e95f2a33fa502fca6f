import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text } from '@react-three/drei';
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
  const [lastLapTime, setLastLapTime] = useState(Date.now());

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

  // Fonction pour vérifier les checkpoints
  const checkCheckpoints = (pos: number[]) => {
    const x = pos[0];
    const z = pos[2];
    let newCheckpoints = { ...checkpoints };
    
    // Checkpoint 1 (haut de la piste)
    if (z > 8 && Math.abs(x) < 3 && !checkpoints.checkpoint1) {
      newCheckpoints.checkpoint1 = true;
    }
    // Checkpoint 2 (droite de la piste)
    if (x > 8 && Math.abs(z) < 3 && checkpoints.checkpoint1 && !checkpoints.checkpoint2) {
      newCheckpoints.checkpoint2 = true;
    }
    // Checkpoint 3 (bas de la piste)
    if (z < -8 && Math.abs(x) < 3 && checkpoints.checkpoint2 && !checkpoints.checkpoint3) {
      newCheckpoints.checkpoint3 = true;
    }
    // Checkpoint 4 (gauche de la piste)
    if (x < -8 && Math.abs(z) < 3 && checkpoints.checkpoint3 && !checkpoints.checkpoint4) {
      newCheckpoints.checkpoint4 = true;
    }
    
    // Ligne d'arrivée (tour complet)
    if (z > 0 && z < 3 && Math.abs(x) < 3 && 
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

    const speed = 0.08;
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

    // Collision avec les bordures de la piste circulaire
    const centerDistance = Math.sqrt(newPosition[0] * newPosition[0] + newPosition[2] * newPosition[2]);
    const outerLimit = 13;
    const innerLimit = 6;
    
    if (centerDistance > outerLimit || centerDistance < innerLimit) {
      // Collision - arrêt de la voiture
      newVelocity.x *= -0.3;
      newVelocity.z *= -0.3;
    } else {
      setCarPosition(newPosition);
      checkCheckpoints(newPosition);
    }

    setCarRotation(newRotation);
    setVelocity(newVelocity);

    // Mise à jour de l'objet 3D
    carRef.current.position.set(carPosition[0], carPosition[1], carPosition[2]);
    carRef.current.rotation.y = newRotation;

    onPositionChange(carPosition);
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

// Composant de la piste circulaire
function CircularTrack() {
  const trackSegments = [];
  const checkpointMarkers = [];
  
  // Créer les segments de la piste circulaire
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    
    // Bordure extérieure
    trackSegments.push(
      <Box key={`outer-${i}`} args={[1, 1, 1]} position={[x * 13, 0, z * 13]}>
        <meshStandardMaterial color="#ff8800" />
      </Box>
    );
    
    // Bordure intérieure
    trackSegments.push(
      <Box key={`inner-${i}`} args={[1, 1, 1]} position={[x * 6, 0, z * 6]}>
        <meshStandardMaterial color="#ff8800" />
      </Box>
    );
  }
  
  // Marqueurs de checkpoints
  const checkpointPositions = [
    [0, 0.1, 10], // Checkpoint 1
    [10, 0.1, 0], // Checkpoint 2
    [0, 0.1, -10], // Checkpoint 3
    [-10, 0.1, 0], // Checkpoint 4
  ];
  
  checkpointPositions.forEach((pos, i) => {
    checkpointMarkers.push(
      <Box key={`checkpoint-${i}`} args={[4, 0.2, 1]} position={pos}>
        <meshStandardMaterial color="#00ff00" transparent opacity={0.7} />
      </Box>
    );
  });

  return (
    <group>
      {/* Sol de la piste */}
      <Plane args={[40, 40]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#333333" />
      </Plane>
      
      {/* Piste circulaire */}
      <Plane args={[28, 28]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <meshStandardMaterial color="#444444" />
      </Plane>
      
      {/* Ligne de départ/arrivée */}
      <Box args={[4, 0.2, 0.5]} position={[0, 0.1, 1.5]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      {/* Bordures */}
      {trackSegments}
      
      {/* Checkpoints */}
      {checkpointMarkers}
    </group>
  );
}

// Caméra qui suit la voiture
function CarCamera({ carPosition }: { carPosition: number[] }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const cameraOffset = new THREE.Vector3(0, 8, 12);
    const targetPosition = new THREE.Vector3(carPosition[0], carPosition[1], carPosition[2]);
    
    camera.position.lerp(targetPosition.clone().add(cameraOffset), 0.08);
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
      <h3 style={{ margin: '0 0 15px 0', color: '#ffdd00' }}>🏁 Course Circulaire</h3>
      
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
  const [carPosition, setCarPosition] = useState([0, 0, 1.5]);
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
        camera={{ position: [0, 8, 12], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #87CEEB, #98FB98)' }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[15, 15, 10]} intensity={1.2} />
        
        {/* Piste circulaire */}
        <CircularTrack />
        
        {/* Voiture */}
        <Car 
          position={[0, 0, 1.5]} 
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