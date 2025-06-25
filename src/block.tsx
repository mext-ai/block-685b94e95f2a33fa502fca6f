import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text, Cylinder, Torus } from '@react-three/drei';
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
      {/* Corps de la voiture - Style plus moderne */}
      <Box args={[2, 0.6, 4]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#ff4444" metalness={0.7} roughness={0.3} />
      </Box>
      {/* Toit */}
      <Box args={[1.6, 0.8, 2.2]} position={[0, 1, -0.2]}>
        <meshStandardMaterial color="#cc3333" metalness={0.8} roughness={0.2} />
      </Box>
      {/* Pare-brise */}
      <Box args={[1.4, 0.6, 0.1]} position={[0, 1.2, 0.8]}>
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </Box>
      {/* Roues avec jantes */}
      <Cylinder args={[0.4, 0.4, 0.3]} position={[-1.2, 0, 1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 0.3]} position={[1.2, 0, 1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 0.3]} position={[-1.2, 0, -1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 0.3]} position={[1.2, 0, -1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      {/* Jantes chromées */}
      <Cylinder args={[0.25, 0.25, 0.1]} position={[-1.3, 0, 1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[0.25, 0.25, 0.1]} position={[1.3, 0, 1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[0.25, 0.25, 0.1]} position={[-1.3, 0, -1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Cylinder args={[0.25, 0.25, 0.1]} position={[1.3, 0, -1.5]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
      </Cylinder>
    </group>
  );
}

// Piste 3D procédurale moderne
function RaceTrack() {
  return (
    <group>
      {/* Base de la piste - Tore principal */}
      <Torus args={[18, 4, 8, 30]} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#444444" />
      </Torus>
      
      {/* Lignes blanches sur la piste */}
      <Torus args={[18, 0.1, 4, 30]} position={[0, 0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Torus>
      <Torus args={[16, 0.1, 4, 30]} position={[0, 0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Torus>
      <Torus args={[20, 0.1, 4, 30]} position={[0, 0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Torus>
      
      {/* Bordures de sécurité */}
      <Torus args={[14, 0.5, 8, 30]} position={[0, 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#ff0000" />
      </Torus>
      <Torus args={[22, 0.5, 8, 30]} position={[0, 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#ff0000" />
      </Torus>
      
      {/* Herbe autour de la piste */}
      <Cylinder args={[30, 30, 0.2]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Cylinder>
      
      {/* Arbres décoratifs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 28;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tronc */}
            <Cylinder args={[0.3, 0.4, 3]} position={[0, 1.5, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Cylinder>
            {/* Feuillage */}
            <Box args={[2, 2, 2]} position={[0, 3.5, 0]}>
              <meshStandardMaterial color="#006400" />
            </Box>
          </group>
        );
      })}
      
      {/* Panneaux publicitaires */}
      {Array.from({ length: 4 }).map((_, i) => {
        const positions = [[25, 2, 0], [0, 2, 25], [-25, 2, 0], [0, 2, -25]];
        const rotations = [[0, -Math.PI/2, 0], [0, 0, 0], [0, Math.PI/2, 0], [0, Math.PI, 0]];
        return (
          <group key={i} position={positions[i]} rotation={rotations[i]}>
            <Box args={[6, 3, 0.2]}>
              <meshStandardMaterial color="#0066ff" />
            </Box>
            <Plane args={[5, 2]} position={[0, 0, 0.15]}>
              <meshStandardMaterial color="#ffffff" />
            </Plane>
          </group>
        );
      })}
      
      {/* Checkpoints lumineux */}
      <group>
        {/* Checkpoint 1 (haut) */}
        <Box args={[3, 2, 0.5]} position={[0, 2, 18]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" />
        </Box>
        {/* Checkpoint 2 (droite) */}
        <Box args={[0.5, 2, 3]} position={[18, 2, 0]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" />
        </Box>
        {/* Checkpoint 3 (bas) */}
        <Box args={[3, 2, 0.5]} position={[0, 2, -18]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" />
        </Box>
        {/* Checkpoint 4 (gauche) */}
        <Box args={[0.5, 2, 3]} position={[-18, 2, 0]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" />
        </Box>
      </group>
      
      {/* Ligne de départ/arrivée avec damier */}
      <group position={[0, 0.1, 0]}>
        <Box args={[4, 0.1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        {/* Motif damier */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} args={[0.4, 0.12, 0.8]} position={[-1.6 + i * 0.4, 0, 0]}>
            <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
          </Box>
        ))}
      </group>
      
      {/* Éclairage de la piste */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 24;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 4, z]}>
            <Cylinder args={[0.1, 0.1, 4]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#666666" />
            </Cylinder>
            <Box args={[0.5, 0.5, 0.5]} position={[0, 2.5, 0]}>
              <meshStandardMaterial color="#ffff00" emissive="#444400" />
            </Box>
            <pointLight position={[0, 2, 0]} intensity={0.5} color="#ffff88" />
          </group>
        );
      })}
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
      background: 'rgba(0,0,0,0.8)',
      padding: '20px',
      borderRadius: '15px',
      minWidth: '280px',
      border: '2px solid #ffdd00'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#ffdd00', textAlign: 'center' }}>
        🏁 Circuit F1 - Low Poly
      </h3>
      
      <div style={{ 
        fontSize: '24px', 
        marginBottom: '10px', 
        color: '#00ff88',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        Tour: {currentLap}/{totalLaps}
      </div>
      
      <div style={{ 
        marginBottom: '15px', 
        color: '#88ddff',
        textAlign: 'center',
        fontSize: '18px'
      }}>
        ⏱️ Temps: {Math.floor(raceTime / 1000)}s
      </div>
      
      {gameWon && (
        <div style={{ 
          fontSize: '28px', 
          color: '#ffdd00', 
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
          animation: 'blink 1s infinite',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          🏆 VICTOIRE ! 🏆
        </div>
      )}
      
      <div style={{ 
        fontSize: '14px', 
        borderTop: '1px solid #666', 
        paddingTop: '10px',
        color: '#cccccc'
      }}>
        <div style={{ marginBottom: '5px', color: '#ffdd00' }}>🎮 Contrôles:</div>
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
        camera={{ position: [0, 15, 20], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #87CEEB 0%, #98FB98 50%, #FFE4B5 100%)' }}
      >
        {/* Éclairage amélioré */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[20, 20, 10]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-15, 15, -10]} intensity={0.8} />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
        
        {/* Piste 3D procédurale */}
        <RaceTrack />
        
        {/* Voiture améliorée */}
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