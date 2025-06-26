import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text, Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface BlockProps {
  title?: string;
  description?: string;
}

// Menu de démarrage
function StartMenu({ onStartGame }: { onStartGame: () => void }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Titre principal */}
      <div style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
        marginBottom: '20px',
        textAlign: 'center',
        animation: 'titlePulse 2s ease-in-out infinite'
      }}>
        🏎️ SUPER RACING 3D 🏁
      </div>

      {/* Sous-titre */}
      <div style={{
        fontSize: '1.5rem',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        Circuit F1 avec virages et lignes droites !
      </div>

      {/* Émojis animés */}
      <div style={{
        fontSize: '3rem',
        marginBottom: '40px',
        animation: 'bounce 1s ease-in-out infinite'
      }}>
        🏆 🏎️ 💨 ⚡ 🏁
      </div>

      {/* Bouton Play */}
      <button
        onClick={onStartGame}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#fff',
          background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
          border: 'none',
          borderRadius: '50px',
          padding: '20px 60px',
          cursor: 'pointer',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          boxShadow: '0 8px 25px rgba(255,107,107,0.4)',
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
          animation: 'buttonGlow 2s ease-in-out infinite'
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'scale(1.1)';
          target.style.boxShadow = '0 12px 35px rgba(255,107,107,0.6)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'scale(1)';
          target.style.boxShadow = '0 8px 25px rgba(255,107,107,0.4)';
        }}
      >
        🚀 JOUER ! 🚀
      </button>

      {/* Instructions */}
      <div style={{
        marginTop: '40px',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '15px',
        padding: '20px',
        maxWidth: '500px',
        textAlign: 'center',
        color: '#333',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#ff6b6b' }}>🎮 Comment jouer :</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <div>🔸 <strong>↑/W</strong> - Accélérer</div>
          <div>🔸 <strong>↓/S</strong> - Freiner</div>
          <div>🔸 <strong>←/A</strong> - Tourner à gauche</div>
          <div>🔸 <strong>→/D</strong> - Tourner à droite</div>
          <div style={{ marginTop: '10px', color: '#666' }}>
            Passe tous les checkpoints verts et termine 3 tours !
          </div>
        </div>
      </div>

      {/* Styles CSS intégrés */}
      <style>
        {`
          @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes buttonGlow {
            0%, 100% { box-shadow: 0 8px 25px rgba(255,107,107,0.4); }
            50% { box-shadow: 0 8px 35px rgba(255,107,107,0.7); }
          }
        `}
      </style>
    </div>
  );
}

// Composant de la voiture avec système de collision amélioré
function Car({ position, rotation, onPositionChange, onLapComplete, onRotationChange }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [carPosition, setCarPosition] = useState(position);
  const [carRotation, setCarRotation] = useState(rotation);
  const [velocity, setVelocity] = useState({ x: 0, z: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // Système de tour avec checkpoints
  const [lapProgress, setLapProgress] = useState({
    currentLap: 0,
    checkpoints: {
      checkpoint1: false, // Nord (z > 150)
      checkpoint2: false, // Est (x > 150)
      checkpoint3: false  // Ouest (x < -150)
    },
    lastLapTime: 0,
    canFinishLap: false
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

  // Fonction pour vérifier si on est sur la piste
  const isOnTrack = (x: number, z: number) => {
    const trackWidth = 50;
    
    // Ligne droite sud (départ)
    if (Math.abs(x) < trackWidth && z >= -250 && z <= -100) return true;
    
    // Ligne droite nord
    if (Math.abs(x) < trackWidth && z >= 100 && z <= 250) return true;
    
    // Ligne droite est
    if (Math.abs(z) < trackWidth && x >= 100 && x <= 250) return true;
    
    // Ligne droite ouest
    if (Math.abs(z) < trackWidth && x >= -250 && x <= -100) return true;
    
    // Virage nord-est
    const neDistance = Math.sqrt((x - 150) ** 2 + (z - 150) ** 2);
    if (neDistance >= 100 - trackWidth && neDistance <= 100 + trackWidth) return true;
    
    // Virage sud-est
    const seDistance = Math.sqrt((x - 150) ** 2 + (z + 150) ** 2);
    if (seDistance >= 100 - trackWidth && seDistance <= 100 + trackWidth) return true;
    
    // Virage sud-ouest
    const swDistance = Math.sqrt((x + 150) ** 2 + (z + 150) ** 2);
    if (swDistance >= 100 - trackWidth && swDistance <= 100 + trackWidth) return true;
    
    // Virage nord-ouest
    const nwDistance = Math.sqrt((x + 150) ** 2 + (z - 150) ** 2);
    if (nwDistance >= 100 - trackWidth && nwDistance <= 100 + trackWidth) return true;
    
    return false;
  };

  // Système de collision
  const checkCollisions = (newPos: number[]) => {
    const x = newPos[0];
    const z = newPos[2];
    
    if (!isOnTrack(x, z)) {
      // Ramener vers la position précédente
      return [
        carPosition[0] + (x - carPosition[0]) * 0.1,
        newPos[1],
        carPosition[2] + (z - carPosition[2]) * 0.1
      ];
    }
    
    return newPos;
  };

  // Détection des checkpoints
  const checkLapProgress = (pos: number[]) => {
    const x = pos[0];
    const z = pos[2];
    const currentTime = Date.now();
    
    const newProgress = { ...lapProgress };
    let stateChanged = false;

    // Checkpoint 1 - Nord (z > 150)
    if (!newProgress.checkpoints.checkpoint1 && z > 150 && Math.abs(x) < 100) {
      newProgress.checkpoints.checkpoint1 = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 1 (NORD) franchi !");
    }
    
    // Checkpoint 2 - Est (x > 150) 
    else if (newProgress.checkpoints.checkpoint1 && 
             !newProgress.checkpoints.checkpoint2 && 
             x > 150 && Math.abs(z) < 100) {
      newProgress.checkpoints.checkpoint2 = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 2 (EST) franchi !");
    }
    
    // Checkpoint 3 - Ouest (x < -150)
    else if (newProgress.checkpoints.checkpoint1 && 
             newProgress.checkpoints.checkpoint2 && 
             !newProgress.checkpoints.checkpoint3 && 
             x < -150 && Math.abs(z) < 100) {
      newProgress.checkpoints.checkpoint3 = true;
      newProgress.canFinishLap = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 3 (OUEST) franchi ! Peut finir le tour.");
    }
    
    // Ligne d'arrivée
    else if (newProgress.canFinishLap && 
             Math.abs(x) < 50 && z < -150) {
      
      const minDelay = 1000;
      
      if ((currentTime - newProgress.lastLapTime) > minDelay) {
        newProgress.currentLap += 1;
        newProgress.lastLapTime = currentTime;
        
        newProgress.checkpoints = {
          checkpoint1: false,
          checkpoint2: false,
          checkpoint3: false
        };
        newProgress.canFinishLap = false;
        
        stateChanged = true;
        console.log(`🏁 TOUR ${newProgress.currentLap} TERMINÉ !`);
        
        onLapComplete();
      }
    }

    if (stateChanged) {
      setLapProgress(newProgress);
    }
  };

  useFrame(() => {
    if (!carRef.current) return;

    const speed = 0.18;
    const rotationSpeed = 0.045;
    let newVelocity = { ...velocity };
    let newRotation = carRotation;

    // Contrôles
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
      newRotation += rotationSpeed;
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
      newRotation -= rotationSpeed;
    }
    if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) {
      newVelocity.x += Math.sin(newRotation) * speed;
      newVelocity.z += Math.cos(newRotation) * speed;
    }
    if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) {
      newVelocity.x -= Math.sin(newRotation) * speed * 0.6;
      newVelocity.z -= Math.cos(newRotation) * speed * 0.6;
    }

    // Friction
    newVelocity.x *= 0.93;
    newVelocity.z *= 0.93;

    // Nouvelle position
    let newPosition = [
      carPosition[0] + newVelocity.x,
      carPosition[1],
      carPosition[2] + newVelocity.z
    ];

    // Vérifier les collisions
    const collisionCheckedPosition = checkCollisions(newPosition);
    
    if (collisionCheckedPosition[0] !== newPosition[0] || collisionCheckedPosition[2] !== newPosition[2]) {
      newVelocity.x *= 0.3;
      newVelocity.z *= 0.3;
    }
    
    newPosition = collisionCheckedPosition;

    setCarPosition(newPosition);
    setCarRotation(newRotation);
    setVelocity(newVelocity);
    
    checkLapProgress(newPosition);

    if (carRef.current) {
      carRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
      carRef.current.rotation.y = newRotation;
    }

    onPositionChange(newPosition);
    onRotationChange(newRotation);
  });

  return (
    <group ref={carRef} scale={[1.5, 1.5, 1.5]}>
      {/* Corps de la voiture */}
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
      {/* Roues */}
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
      {/* Jantes */}
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

// Circuit rectangulaire avec virages arrondis
function RectangularTrack() {
  // Surface de base
  const createTrackSurface = () => {
    const segments = [];
    
    // Lignes droites
    // Sud (départ/arrivée)
    segments.push(
      <Box key="straight-south" args={[60, 0.5, 150]} position={[0, 0, -175]}>
        <meshStandardMaterial color="#333333" />
      </Box>
    );
    
    // Nord
    segments.push(
      <Box key="straight-north" args={[60, 0.5, 150]} position={[0, 0, 175]}>
        <meshStandardMaterial color="#333333" />
      </Box>
    );
    
    // Est
    segments.push(
      <Box key="straight-east" args={[150, 0.5, 60]} position={[175, 0, 0]}>
        <meshStandardMaterial color="#333333" />
      </Box>
    );
    
    // Ouest
    segments.push(
      <Box key="straight-west" args={[150, 0.5, 60]} position={[-175, 0, 0]}>
        <meshStandardMaterial color="#333333" />
      </Box>
    );
    
    // Virages arrondis
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI / 2;
      
      // Virage nord-est
      const neX = 100 + Math.cos(angle) * 75;
      const neZ = 100 + Math.sin(angle) * 75;
      segments.push(
        <Box key={`ne-${i}`} args={[60, 0.5, 15]} position={[neX, 0, neZ]} rotation={[0, angle, 0]}>
          <meshStandardMaterial color="#333333" />
        </Box>
      );
      
      // Virage sud-est
      const seX = 100 + Math.cos(angle + Math.PI/2) * 75;
      const seZ = -100 + Math.sin(angle + Math.PI/2) * 75;
      segments.push(
        <Box key={`se-${i}`} args={[60, 0.5, 15]} position={[seX, 0, seZ]} rotation={[0, angle + Math.PI/2, 0]}>
          <meshStandardMaterial color="#333333" />
        </Box>
      );
      
      // Virage sud-ouest
      const swX = -100 + Math.cos(angle + Math.PI) * 75;
      const swZ = -100 + Math.sin(angle + Math.PI) * 75;
      segments.push(
        <Box key={`sw-${i}`} args={[60, 0.5, 15]} position={[swX, 0, swZ]} rotation={[0, angle + Math.PI, 0]}>
          <meshStandardMaterial color="#333333" />
        </Box>
      );
      
      // Virage nord-ouest
      const nwX = -100 + Math.cos(angle + 3*Math.PI/2) * 75;
      const nwZ = 100 + Math.sin(angle + 3*Math.PI/2) * 75;
      segments.push(
        <Box key={`nw-${i}`} args={[60, 0.5, 15]} position={[nwX, 0, nwZ]} rotation={[0, angle + 3*Math.PI/2, 0]}>
          <meshStandardMaterial color="#333333" />
        </Box>
      );
    }
    
    return segments;
  };

  // Barrières de sécurité
  const createBarriers = () => {
    const barriers = [];
    
    // Barrières lignes droites
    // Sud - extérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-south-out-${i}`} position={[i * 20, 0, -260]}>
          <Box args={[8, 4, 3]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[8, 1, 3]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Sud - intérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-south-in-${i}`} position={[i * 20, 0, -90]}>
          <Box args={[8, 4, 3]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[8, 1, 3]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Nord - extérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-north-out-${i}`} position={[i * 20, 0, 260]}>
          <Box args={[8, 4, 3]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[8, 1, 3]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Nord - intérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-north-in-${i}`} position={[i * 20, 0, 90]}>
          <Box args={[8, 4, 3]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[8, 1, 3]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Est - extérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-east-out-${i}`} position={[260, 0, i * 20]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[3, 1, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Est - intérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-east-in-${i}`} position={[90, 0, i * 20]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[3, 1, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Ouest - extérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-west-out-${i}`} position={[-260, 0, i * 20]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[3, 1, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Ouest - intérieur
    for (let i = -4; i <= 4; i++) {
      barriers.push(
        <group key={`barrier-west-in-${i}`} position={[-90, 0, i * 20]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[3, 1, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    // Barrières des virages
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI / 2;
      
      // Barrières extérieures des virages
      // Nord-est
      const neOutX = 100 + Math.cos(angle) * 110;
      const neOutZ = 100 + Math.sin(angle) * 110;
      barriers.push(
        <group key={`barrier-ne-out-${i}`} position={[neOutX, 0, neOutZ]} rotation={[0, angle + Math.PI, 0]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[3, 1, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
      
      // Barrières intérieures des virages
      const neInX = 100 + Math.cos(angle) * 40;
      const neInZ = 100 + Math.sin(angle) * 40;
      barriers.push(
        <group key={`barrier-ne-in-${i}`} position={[neInX, 0, neInZ]} rotation={[0, angle, 0]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
          <Box args={[3, 1, 8]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
      
      // Répéter pour les autres virages...
      // Sud-est
      const seOutX = 100 + Math.cos(angle + Math.PI/2) * 110;
      const seOutZ = -100 + Math.sin(angle + Math.PI/2) * 110;
      barriers.push(
        <group key={`barrier-se-out-${i}`} position={[seOutX, 0, seOutZ]} rotation={[0, angle + 3*Math.PI/2, 0]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
        </group>
      );
      
      // Sud-ouest
      const swOutX = -100 + Math.cos(angle + Math.PI) * 110;
      const swOutZ = -100 + Math.sin(angle + Math.PI) * 110;
      barriers.push(
        <group key={`barrier-sw-out-${i}`} position={[swOutX, 0, swOutZ]} rotation={[0, angle + Math.PI/2, 0]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
        </group>
      );
      
      // Nord-ouest
      const nwOutX = -100 + Math.cos(angle + 3*Math.PI/2) * 110;
      const nwOutZ = 100 + Math.sin(angle + 3*Math.PI/2) * 110;
      barriers.push(
        <group key={`barrier-nw-out-${i}`} position={[nwOutX, 0, nwOutZ]} rotation={[0, angle, 0]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" />
          </Box>
        </group>
      );
    }
    
    return barriers;
  };

  return (
    <group>
      {/* Surface de base */}
      <Plane args={[800, 800]} rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Plane>
      
      {/* Piste */}
      {createTrackSurface()}
      
      {/* Barrières */}
      {createBarriers()}
      
      {/* Lignes blanches centrales */}
      <Box args={[2, 0.1, 150]} position={[0, 0.3, -175]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[2, 0.1, 150]} position={[0, 0.3, 175]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[150, 0.1, 2]} position={[175, 0.3, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[150, 0.1, 2]} position={[-175, 0.3, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      {/* Checkpoints */}
      <group position={[0, 0.3, 200]}>
        <Box args={[100, 0.2, 20]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" transparent opacity={0.7} />
        </Box>
        <Text position={[0, 5, 0]} fontSize={8} color="#00ff00" anchorX="center" anchorY="middle">
          CHECKPOINT 1
        </Text>
      </group>
      
      <group position={[200, 0.3, 0]}>
        <Box args={[20, 0.2, 100]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" transparent opacity={0.7} />
        </Box>
        <Text position={[0, 5, 0]} fontSize={8} color="#00ff00" anchorX="center" anchorY="middle">
          CHECKPOINT 2
        </Text>
      </group>
      
      <group position={[-200, 0.3, 0]}>
        <Box args={[20, 0.2, 100]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" transparent opacity={0.7} />
        </Box>
        <Text position={[0, 5, 0]} fontSize={8} color="#00ff00" anchorX="center" anchorY="middle">
          CHECKPOINT 3
        </Text>
      </group>
      
      {/* Ligne d'arrivée */}
      <group position={[0, 0.4, -230]}>
        <Box args={[100, 0.2, 8]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        {Array.from({ length: 25 }).map((_, i) => (
          <Box key={i} args={[4, 0.3, 4]} position={[-50 + i * 4, 0, 0]}>
            <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
          </Box>
        ))}
        <Text position={[0, 15, 15]} fontSize={8} color="#ffffff" anchorX="center" anchorY="middle">
          DÉPART / ARRIVÉE
        </Text>
      </group>
      
      {/* Arbres décoratifs */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 350;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]}>
            <Cylinder args={[2, 3, 15]} position={[0, 7.5, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Cylinder>
            <Box args={[12, 12, 12]} position={[0, 18, 0]}>
              <meshStandardMaterial color="#006400" />
            </Box>
          </group>
        );
      })}
      
      {/* Éclairage */}
      {Array.from({ length: 12 }).map((_, i) => {
        const positions = [
          [0, 300], [150, 150], [300, 0], [150, -150],
          [0, -300], [-150, -150], [-300, 0], [-150, 150],
          [100, 250], [250, 100], [100, -250], [-100, 250]
        ];
        const pos = positions[i];
        if (!pos) return null;
        
        return (
          <group key={i} position={[pos[0], 20, pos[1]]}>
            <Cylinder args={[0.5, 0.5, 20]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#666666" />
            </Cylinder>
            <Box args={[3, 3, 3]} position={[0, 12, 0]}>
              <meshStandardMaterial color="#ffff00" emissive="#444400" />
            </Box>
            <pointLight position={[0, 10, 0]} intensity={2} color="#ffff88" distance={150} />
          </group>
        );
      })}
    </group>
  );
}

// Caméra qui suit la voiture
function FollowCamera({ carPosition, carRotation, cameraMode }: { carPosition: number[], carRotation: number, cameraMode: string }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const carX = carPosition[0];
    const carY = carPosition[1];
    const carZ = carPosition[2];
    
    if (cameraMode === 'follow') {
      const distance = 35;
      const height = 25;
      
      const cameraX = carX - Math.sin(carRotation) * distance;
      const cameraY = carY + height;
      const cameraZ = carZ - Math.cos(carRotation) * distance;
      
      const targetX = carX + Math.sin(carRotation) * 15;
      const targetY = carY + 2;
      const targetZ = carZ + Math.cos(carRotation) * 15;
      
      camera.position.lerp(new THREE.Vector3(cameraX, cameraY, cameraZ), 0.1);
      camera.lookAt(new THREE.Vector3(targetX, targetY, targetZ));
    } else if (cameraMode === 'cockpit') {
      const offsetY = 2;
      const offsetZ = 1;
      
      const cockpitX = carX + Math.sin(carRotation) * offsetZ;
      const cockpitY = carY + offsetY;
      const cockpitZ = carZ + Math.cos(carRotation) * offsetZ;
      
      const targetX = carX + Math.sin(carRotation) * 20;
      const targetY = carY + 1;
      const targetZ = carZ + Math.cos(carRotation) * 20;
      
      camera.position.lerp(new THREE.Vector3(cockpitX, cockpitY, cockpitZ), 0.15);
      camera.lookAt(new THREE.Vector3(targetX, targetY, targetZ));
    } else if (cameraMode === 'aerial') {
      const height = 60;
      camera.position.lerp(new THREE.Vector3(carX, carY + height, carZ), 0.05);
      camera.lookAt(new THREE.Vector3(carX, carY, carZ));
    }
  });

  return null;
}

// Interface utilisateur
function UI({ currentLap, totalLaps, gameWon, raceTime, cameraMode, onCameraModeChange }: any) {
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
        🏁 CIRCUIT F1 RECTANGULAIRE
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
      
      {/* Sélecteur de caméra */}
      <div style={{ 
        marginBottom: '15px', 
        borderTop: '1px solid #666', 
        paddingTop: '10px' 
      }}>
        <div style={{ marginBottom: '8px', color: '#ffdd00' }}>📷 Mode Caméra:</div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {(['follow', 'cockpit', 'aerial'] as const).map(mode => (
            <button 
              key={mode}
              onClick={() => onCameraModeChange(mode)}
              style={{
                background: cameraMode === mode ? '#ffdd00' : '#333',
                color: cameraMode === mode ? '#000' : '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {mode === 'follow' ? 'Suivi' : mode === 'cockpit' ? 'Cockpit' : 'Aérienne'}
            </button>
          ))}
        </div>
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
        <div style={{ marginTop: '10px', color: '#00ff00' }}>
          🏁 Circuit rectangulaire avec virages !
        </div>
      </div>
    </div>
  );
}

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [carPosition, setCarPosition] = useState([0, 1, -200]);
  const [carRotation, setCarRotation] = useState(Math.PI / 2);
  const [currentLap, setCurrentLap] = useState(0);
  const [totalLaps] = useState(3);
  const [gameWon, setGameWon] = useState(false);
  const [startTime] = useState(Date.now());
  const [raceTime, setRaceTime] = useState(0);
  const [cameraMode, setCameraMode] = useState('follow');

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleLapComplete = () => {
    if (!gameWon) {
      const newLap = currentLap + 1;
      setCurrentLap(newLap);
      
      if (newLap >= totalLaps) {
        setGameWon(true);
        window.postMessage({ 
          type: 'BLOCK_COMPLETION', 
          blockId: 'rectangular-racing-3d', 
          completed: true,
          score: Math.max(1000 - Math.floor((Date.now() - startTime) / 100), 100),
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        }, '*');
        window.parent.postMessage({ 
          type: 'BLOCK_COMPLETION', 
          blockId: 'rectangular-racing-3d', 
          completed: true,
          score: Math.max(1000 - Math.floor((Date.now() - startTime) / 100), 100),
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        }, '*');
      }
    }
  };

  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        setRaceTime(Date.now() - startTime);
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, [startTime, gameStarted]);

  if (!gameStarted) {
    return <StartMenu onStartGame={handleStartGame} />;
  }

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
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
      />
      
      <Canvas
        camera={{ position: [0, 80, 120], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #87CEEB 0%, #98FB98 30%, #FFE4B5 70%, #FFA07A 100%)' }}
      >
        {/* Éclairage */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[100, 100, 50]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-75, 75, -50]} intensity={0.8} />
        <pointLight position={[0, 50, 0]} intensity={1} color="#ffffff" />
        
        {/* Circuit rectangulaire */}
        <RectangularTrack />
        
        {/* Voiture */}
        <Car 
          position={[0, 1, -200]} 
          rotation={Math.PI / 2}
          onPositionChange={setCarPosition}
          onRotationChange={setCarRotation}
          onLapComplete={handleLapComplete}
        />
        
        {/* Caméra */}
        <FollowCamera 
          carPosition={carPosition} 
          carRotation={carRotation}
          cameraMode={cameraMode}
        />
      </Canvas>
    </div>
  );
};

export default Block;