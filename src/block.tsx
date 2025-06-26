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
        Circuit complexe avec virages et lignes droites !
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
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 12px 35px rgba(255,107,107,0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 8px 25px rgba(255,107,107,0.4)';
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

      {/* Voitures animées en arrière-plan */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-100px',
        fontSize: '3rem',
        animation: 'carMove1 8s linear infinite'
      }}>
        🏎️
      </div>
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '-100px',
        fontSize: '3rem',
        animation: 'carMove2 10s linear infinite'
      }}>
        🏁
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
          
          @keyframes carMove1 {
            0% { left: -100px; }
            100% { left: 100%; }
          }
          
          @keyframes carMove2 {
            0% { right: -100px; }
            100% { right: 100%; }
          }
        `}
      </style>
    </div>
  );
}

// Définition des points du circuit complexe
const TRACK_POINTS = [
  // LIGNE DE DÉPART - Ligne droite sud
  { x: 0, z: -200, angle: Math.PI/2 },
  { x: 0, z: -180, angle: Math.PI/2 },
  { x: 0, z: -160, angle: Math.PI/2 },
  { x: 0, z: -140, angle: Math.PI/2 },
  
  // PREMIÈRE LIGNE DROITE LONGUE vers le nord
  { x: 0, z: -120, angle: Math.PI/2 },
  { x: 0, z: -100, angle: Math.PI/2 },
  { x: 0, z: -80, angle: Math.PI/2 },
  { x: 0, z: -60, angle: Math.PI/2 },
  { x: 0, z: -40, angle: Math.PI/2 },
  { x: 0, z: -20, angle: Math.PI/2 },
  { x: 0, z: 0, angle: Math.PI/2 },
  { x: 0, z: 20, angle: Math.PI/2 },
  { x: 0, z: 40, angle: Math.PI/2 },
  { x: 0, z: 60, angle: Math.PI/2 },
  { x: 0, z: 80, angle: Math.PI/2 },
  { x: 0, z: 100, angle: Math.PI/2 },
  { x: 0, z: 120, angle: Math.PI/2 },
  { x: 0, z: 140, angle: Math.PI/2 },
  
  // VIRAGE SERRÉ À DROITE (CHECKPOINT 1)
  { x: 10, z: 160, angle: Math.PI/3 },
  { x: 25, z: 175, angle: Math.PI/4 },
  { x: 45, z: 185, angle: 0 },
  { x: 70, z: 190, angle: -Math.PI/6 },
  { x: 100, z: 185, angle: -Math.PI/4 },
  { x: 130, z: 175, angle: -Math.PI/3 },
  { x: 155, z: 160, angle: -Math.PI/2 },
  
  // LIGNE DROITE VERS L'EST
  { x: 175, z: 140, angle: -Math.PI/2 },
  { x: 190, z: 120, angle: -Math.PI/2 },
  { x: 200, z: 100, angle: -Math.PI/2 },
  { x: 205, z: 80, angle: -Math.PI/2 },
  { x: 210, z: 60, angle: -Math.PI/2 },
  { x: 215, z: 40, angle: -Math.PI/2 },
  { x: 220, z: 20, angle: -Math.PI/2 },
  { x: 220, z: 0, angle: -Math.PI/2 },
  { x: 220, z: -20, angle: -Math.PI/2 },
  
  // VIRAGE EN ÉPINGLE VERS LA GAUCHE (CHECKPOINT 2)
  { x: 215, z: -40, angle: -2*Math.PI/3 },
  { x: 200, z: -55, angle: -3*Math.PI/4 },
  { x: 180, z: -65, angle: -Math.PI },
  { x: 155, z: -70, angle: -5*Math.PI/4 },
  { x: 130, z: -65, angle: -3*Math.PI/2 },
  { x: 110, z: -55, angle: -5*Math.PI/3 },
  { x: 95, z: -40, angle: -Math.PI/2 },
  
  // LIGNE DROITE VERS L'OUEST
  { x: 80, z: -25, angle: -Math.PI/2 },
  { x: 60, z: -15, angle: -Math.PI/2 },
  { x: 40, z: -10, angle: -Math.PI/2 },
  { x: 20, z: -8, angle: -Math.PI/2 },
  { x: 0, z: -10, angle: -Math.PI/2 },
  { x: -20, z: -15, angle: -Math.PI/2 },
  { x: -40, z: -25, angle: -Math.PI/2 },
  { x: -60, z: -40, angle: -Math.PI/2 },
  { x: -80, z: -60, angle: -Math.PI/2 },
  { x: -100, z: -80, angle: -Math.PI/2 },
  { x: -120, z: -100, angle: -Math.PI/2 },
  { x: -140, z: -120, angle: -Math.PI/2 },
  { x: -155, z: -135, angle: -Math.PI/2 },
  
  // VIRAGE LARGE VERS LA GAUCHE (CHECKPOINT 3)
  { x: -170, z: -150, angle: -4*Math.PI/3 },
  { x: -180, z: -170, angle: -3*Math.PI/2 },
  { x: -185, z: -190, angle: -5*Math.PI/3 },
  { x: -180, z: -210, angle: -Math.PI },
  { x: -170, z: -225, angle: -5*Math.PI/6 },
  { x: -155, z: -235, angle: -2*Math.PI/3 },
  { x: -135, z: -240, angle: -Math.PI/2 },
  { x: -115, z: -235, angle: -Math.PI/3 },
  { x: -95, z: -225, angle: -Math.PI/6 },
  { x: -80, z: -210, angle: 0 },
  { x: -70, z: -190, angle: Math.PI/6 },
  { x: -65, z: -170, angle: Math.PI/3 },
  { x: -60, z: -150, angle: Math.PI/2 },
  
  // SECTION SINUEUSE VERS LA LIGNE D'ARRIVÉE
  { x: -50, z: -130, angle: Math.PI/2 },
  { x: -35, z: -115, angle: Math.PI/3 },
  { x: -15, z: -105, angle: Math.PI/6 },
  { x: 10, z: -100, angle: 0 },
  { x: 30, z: -105, angle: -Math.PI/6 },
  { x: 45, z: -115, angle: -Math.PI/3 },
  { x: 55, z: -130, angle: -Math.PI/2 },
  { x: 50, z: -150, angle: -2*Math.PI/3 },
  { x: 40, z: -165, angle: -3*Math.PI/4 },
  { x: 25, z: -175, angle: -5*Math.PI/6 },
  { x: 5, z: -185, angle: -Math.PI },
  { x: -10, z: -190, angle: -7*Math.PI/6 },
  { x: -20, z: -195, angle: -4*Math.PI/3 },
  { x: -15, z: -200, angle: -3*Math.PI/2 },
  { x: 0, z: -200, angle: Math.PI/2 } // RETOUR À LA LIGNE D'ARRIVÉE
];

// Composant de la voiture avec SYSTÈME DE COLLISION COMPLEXE
function Car({ position, rotation, onPositionChange, onLapComplete, onRotationChange }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [carPosition, setCarPosition] = useState(position);
  const [carRotation, setCarRotation] = useState(rotation);
  const [velocity, setVelocity] = useState({ x: 0, z: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // SYSTÈME DE TOUR ADAPTÉ AU NOUVEAU CIRCUIT
  const [lapProgress, setLapProgress] = useState({
    currentLap: 0,
    checkpoints: {
      checkpoint1: false, // VIRAGE NORD-EST (zone x > 150, z > 150)
      checkpoint2: false, // VIRAGE EST (zone x > 200, z < 0)
      checkpoint3: false  // VIRAGE OUEST (zone x < -150, z < -150)
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

  // Fonction pour vérifier si un point est proche du tracé de la piste
  const isOnTrack = (x: number, z: number) => {
    const trackWidth = 45; // Largeur de la piste
    
    // Vérifier la distance au point de piste le plus proche
    let minDistance = Infinity;
    
    for (let i = 0; i < TRACK_POINTS.length; i++) {
      const point = TRACK_POINTS[i];
      const distance = Math.sqrt((x - point.x) ** 2 + (z - point.z) ** 2);
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    return minDistance <= trackWidth;
  };

  // SYSTÈME DE COLLISION COMPLEXE BASÉ SUR LE TRACÉ DE PISTE
  const checkComplexCollisions = (newPos: number[]) => {
    const x = newPos[0];
    const z = newPos[2];
    
    // Si la voiture n'est pas sur la piste, la ramener au point le plus proche
    if (!isOnTrack(x, z)) {
      let closestPoint = TRACK_POINTS[0];
      let minDistance = Infinity;
      
      // Trouver le point de piste le plus proche
      for (const point of TRACK_POINTS) {
        const distance = Math.sqrt((x - point.x) ** 2 + (z - point.z) ** 2);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }
      
      // Ramener la voiture vers la piste avec un petit décalage
      const directionX = (closestPoint.x - x) * 0.3;
      const directionZ = (closestPoint.z - z) * 0.3;
      
      return [
        x + directionX,
        newPos[1],
        z + directionZ
      ];
    }
    
    return newPos; // Pas de collision
  };

  // LOGIQUE DE DÉTECTION DES CHECKPOINTS POUR LE NOUVEAU CIRCUIT
  const checkLapProgress = (pos: number[]) => {
    const x = pos[0];
    const z = pos[2];
    const currentTime = Date.now();
    
    const newProgress = { ...lapProgress };
    let stateChanged = false;

    // CHECKPOINT 1 - VIRAGE NORD-EST (x > 150 ET z > 150)
    if (!newProgress.checkpoints.checkpoint1 && x > 150 && z > 150) {
      newProgress.checkpoints.checkpoint1 = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 1 (VIRAGE NORD-EST) franchi !");
    }
    
    // CHECKPOINT 2 - ZONE EST (x > 200 ET z < 0)
    else if (newProgress.checkpoints.checkpoint1 && 
             !newProgress.checkpoints.checkpoint2 && 
             x > 200 && z < 0) {
      newProgress.checkpoints.checkpoint2 = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 2 (ZONE EST) franchi !");
    }
    
    // CHECKPOINT 3 - VIRAGE OUEST (x < -150 ET z < -150)
    else if (newProgress.checkpoints.checkpoint1 && 
             newProgress.checkpoints.checkpoint2 && 
             !newProgress.checkpoints.checkpoint3 && 
             x < -150 && z < -150) {
      newProgress.checkpoints.checkpoint3 = true;
      newProgress.canFinishLap = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 3 (VIRAGE OUEST) franchi ! Peut finir le tour.");
    }
    
    // LIGNE D'ARRIVÉE - Zone de départ/arrivée (x proche de 0, z < -180)
    else if (newProgress.canFinishLap && 
             Math.abs(x) < 50 && z < -180) {
      
      const minDelay = 1000;
      
      if ((currentTime - newProgress.lastLapTime) > minDelay) {
        newProgress.currentLap += 1;
        newProgress.lastLapTime = currentTime;
        
        // Reset pour le tour suivant
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

    const speed = 0.15;
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
    newVelocity.x *= 0.92;
    newVelocity.z *= 0.92;

    // Calcul de la nouvelle position
    let newPosition = [
      carPosition[0] + newVelocity.x,
      carPosition[1],
      carPosition[2] + newVelocity.z
    ];

    // VÉRIFIER LES COLLISIONS COMPLEXES
    const collisionCheckedPosition = checkComplexCollisions(newPosition);
    
    // Si collision, réduire la vitesse
    if (collisionCheckedPosition[0] !== newPosition[0] || collisionCheckedPosition[2] !== newPosition[2]) {
      newVelocity.x *= 0.2;
      newVelocity.z *= 0.2;
      console.log("💥 COLLISION - Retour sur la piste !");
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

// NOUVEAU CIRCUIT COMPLEXE AVEC TRACÉ IRRÉGULIER
function ComplexRaceTrack() {
  // Créer la piste basée sur les points définis
  const createComplexTrack = () => {
    const segments = [];
    const trackWidth = 45;
    
    for (let i = 0; i < TRACK_POINTS.length; i++) {
      const point = TRACK_POINTS[i];
      const nextPoint = TRACK_POINTS[(i + 1) % TRACK_POINTS.length];
      
      // Calculer la distance entre les points
      const distance = Math.sqrt(
        (nextPoint.x - point.x) ** 2 + (nextPoint.z - point.z) ** 2
      );
      
      segments.push(
        <Box 
          key={i} 
          args={[trackWidth, 0.5, Math.max(distance, 8)]} 
          position={[point.x, 0, point.z]} 
          rotation={[0, point.angle, 0]}
        >
          <meshStandardMaterial color="#333333" />
        </Box>
      );
    }
    return segments;
  };

  // Créer les barrières de sécurité le long du tracé
  const createTrackBarriers = () => {
    const barriers = [];
    const barrierOffset = 30; // Distance des barrières par rapport au centre de la piste
    
    for (let i = 0; i < TRACK_POINTS.length; i += 2) { // Espacement des barrières
      const point = TRACK_POINTS[i];
      
      // Barrières extérieures
      const outerX = point.x + Math.cos(point.angle + Math.PI/2) * barrierOffset;
      const outerZ = point.z - Math.sin(point.angle + Math.PI/2) * barrierOffset;
      
      barriers.push(
        <group key={`outer-${i}`} position={[outerX, 0, outerZ]} rotation={[0, point.angle, 0]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" metalness={0.3} roughness={0.7} />
          </Box>
          <Box args={[3.2, 1, 8.2]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
          <Box args={[3.2, 1, 8.2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
      
      // Barrières intérieures
      const innerX = point.x - Math.cos(point.angle + Math.PI/2) * barrierOffset;
      const innerZ = point.z + Math.sin(point.angle + Math.PI/2) * barrierOffset;
      
      barriers.push(
        <group key={`inner-${i}`} position={[innerX, 0, innerZ]} rotation={[0, point.angle + Math.PI, 0]}>
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" metalness={0.3} roughness={0.7} />
          </Box>
          <Box args={[3.2, 1, 8.2]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
          <Box args={[3.2, 1, 8.2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        </group>
      );
    }
    
    return barriers;
  };

  return (
    <group>
      {/* Surface de base étendue */}
      <Plane args={[600, 600]} rotation={[-Math.PI/2, 0, 0]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Plane>
      
      {/* Piste complexe */}
      {createComplexTrack()}
      
      {/* Barrières de sécurité */}
      {createTrackBarriers()}
      
      {/* Lignes blanches centrales le long du tracé */}
      {TRACK_POINTS.map((point, i) => (
        <Box 
          key={`centerline-${i}`}
          args={[2, 0.1, 10]} 
          position={[point.x, 0.3, point.z]} 
          rotation={[0, point.angle, 0]}
        >
          <meshStandardMaterial color="#ffffff" />
        </Box>
      ))}
      
      {/* CHECKPOINTS POUR LE NOUVEAU CIRCUIT */}
      
      {/* Checkpoint 1 - Virage Nord-Est (x > 150, z > 150) */}
      <group position={[170, 0.3, 170]}>
        <Box args={[40, 0.2, 40]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" transparent opacity={0.7} />
        </Box>
        <Text 
          position={[0, 5, 0]} 
          fontSize={10} 
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          CHECKPOINT 1
        </Text>
      </group>
      
      {/* Checkpoint 2 - Zone Est (x > 200, z < 0) */}
      <group position={[220, 0.3, -10]}>
        <Box args={[20, 0.2, 60]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" transparent opacity={0.7} />
        </Box>
        <Text 
          position={[0, 5, 0]} 
          fontSize={10} 
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          CHECKPOINT 2
        </Text>
      </group>
      
      {/* Checkpoint 3 - Virage Ouest (x < -150, z < -150) */}
      <group position={[-170, 0.3, -200]}>
        <Box args={[40, 0.2, 40]}>
          <meshStandardMaterial color="#00ff00" emissive="#004400" transparent opacity={0.7} />
        </Box>
        <Text 
          position={[0, 5, 0]} 
          fontSize={10} 
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          CHECKPOINT 3
        </Text>
      </group>
      
      {/* Ligne de départ/arrivée */}
      <group position={[0, 0.4, -200]} rotation={[0, 0, 0]}>
        <Box args={[60, 0.2, 8]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        {/* Motif damier */}
        {Array.from({ length: 30 }).map((_, i) => (
          <Box key={i} args={[4, 0.3, 4]} position={[-60 + i * 4, 0, 0]}>
            <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
          </Box>
        ))}
        <Text 
          position={[0, 15, 15]} 
          fontSize={8} 
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          DÉPART / ARRIVÉE
        </Text>
      </group>
      
      {/* Arbres et décoration */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
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
      
      {/* Éclairage du circuit */}
      {TRACK_POINTS.filter((_, i) => i % 8 === 0).map((point, i) => (
        <group key={`light-${i}`} position={[point.x + 40, 20, point.z]}>
          <Cylinder args={[0.5, 0.5, 20]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#666666" />
          </Cylinder>
          <Box args={[3, 3, 3]} position={[0, 12, 0]}>
            <meshStandardMaterial color="#ffff00" emissive="#444400" />
          </Box>
          <pointLight position={[0, 10, 0]} intensity={2} color="#ffff88" distance={80} />
        </group>
      ))}
    </group>
  );
}

// Caméra qui suit automatiquement la voiture
function FollowCamera({ carPosition, carRotation, cameraMode }: { carPosition: number[], carRotation: number, cameraMode: string }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const carX = carPosition[0];
    const carY = carPosition[1];
    const carZ = carPosition[2];
    
    if (cameraMode === 'follow') {
      const distance = 30;
      const height = 20;
      
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
      const height = 50;
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
        🏁 CIRCUIT COMPLEXE F1
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
      
      {/* Sélecteur de mode de caméra */}
      <div style={{ 
        marginBottom: '15px', 
        borderTop: '1px solid #666', 
        paddingTop: '10px' 
      }}>
        <div style={{ marginBottom: '8px', color: '#ffdd00' }}>📷 Mode Caméra:</div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onCameraModeChange('follow')}
            style={{
              background: cameraMode === 'follow' ? '#ffdd00' : '#333',
              color: cameraMode === 'follow' ? '#000' : '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Suivi
          </button>
          <button 
            onClick={() => onCameraModeChange('cockpit')}
            style={{
              background: cameraMode === 'cockpit' ? '#ffdd00' : '#333',
              color: cameraMode === 'cockpit' ? '#000' : '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cockpit
          </button>
          <button 
            onClick={() => onCameraModeChange('aerial')}
            style={{
              background: cameraMode === 'aerial' ? '#ffdd00' : '#333',
              color: cameraMode === 'aerial' ? '#000' : '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Aérienne
          </button>
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
          🏁 Circuit avec virages serrés et lignes droites !
        </div>
      </div>
    </div>
  );
}

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [carPosition, setCarPosition] = useState([0, 1, -200]); // Position de départ sur la ligne d'arrivée
  const [carRotation, setCarRotation] = useState(Math.PI / 2); // Direction initiale vers le nord
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
        // Envoyer l'événement de completion
        window.postMessage({ 
          type: 'BLOCK_COMPLETION', 
          blockId: 'complex-racing-3d', 
          completed: true,
          score: Math.max(1000 - Math.floor((Date.now() - startTime) / 100), 100),
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        }, '*');
        window.parent.postMessage({ 
          type: 'BLOCK_COMPLETION', 
          blockId: 'complex-racing-3d', 
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
        camera={{ position: [0, 60, 100], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #87CEEB 0%, #98FB98 30%, #FFE4B5 70%, #FFA07A 100%)' }}
      >
        {/* Éclairage amélioré */}
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
        
        {/* NOUVEAU CIRCUIT COMPLEXE */}
        <ComplexRaceTrack />
        
        {/* Voiture */}
        <Car 
          position={[0, 1, -200]} 
          rotation={Math.PI / 2}
          onPositionChange={setCarPosition}
          onRotationChange={setCarRotation}
          onLapComplete={handleLapComplete}
        />
        
        {/* Caméra qui suit la voiture */}
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