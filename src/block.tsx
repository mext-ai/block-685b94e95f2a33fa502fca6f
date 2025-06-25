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
        Prêt pour la course de ta vie ?
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

// Composant de la voiture avec SYSTÈME DE COLLISION
function Car({ position, rotation, onPositionChange, onLapComplete, onRotationChange }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [carPosition, setCarPosition] = useState(position);
  const [carRotation, setCarRotation] = useState(rotation);
  const [velocity, setVelocity] = useState({ x: 0, z: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // SYSTÈME DE TOUR AVEC ORDRE CORRIGÉ DES CHECKPOINTS
  const [lapProgress, setLapProgress] = useState({
    currentLap: 0,
    checkpoints: {
      checkpoint1: false, // DROITE (x > 150) - Premier checkpoint dans le sens de circulation
      checkpoint2: false, // HAUT (z > 150) - Deuxième checkpoint
      checkpoint3: false  // GAUCHE (x < -150) - Troisième checkpoint
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

  // SYSTÈME DE COLLISION AVEC LES BARRIÈRES
  const checkBarrierCollisions = (newPos: number[]) => {
    const x = newPos[0];
    const z = newPos[2];
    const carRadius = 3; // Rayon de collision de la voiture
    
    // Calculer la distance du centre (0,0)
    const distanceFromCenter = Math.sqrt(x * x + z * z);
    
    // COLLISION AVEC BARRIÈRE EXTÉRIEURE (rayon ~235)
    if (distanceFromCenter > 235 - carRadius) {
      // Calculer la direction vers le centre
      const angle = Math.atan2(z, x);
      const maxDistance = 235 - carRadius;
      return [
        Math.cos(angle) * maxDistance,
        newPos[1],
        Math.sin(angle) * maxDistance
      ];
    }
    
    // COLLISION AVEC BARRIÈRE INTÉRIEURE (rayon ~145)
    if (distanceFromCenter < 145 + carRadius) {
      // Calculer la direction vers l'extérieur
      const angle = Math.atan2(z, x);
      const minDistance = 145 + carRadius;
      return [
        Math.cos(angle) * minDistance,
        newPos[1],
        Math.sin(angle) * minDistance
      ];
    }
    
    return newPos; // Pas de collision
  };

  // LOGIQUE DE DÉTECTION ÉLARGIE : CHECKPOINTS COUVRANT TOUTE LA LARGEUR DE LA ROUTE
  const checkLapProgress = (pos: number[]) => {
    const x = pos[0];
    const z = pos[2];
    const currentTime = Date.now();
    
    // Créer une copie de l'état actuel
    const newProgress = { ...lapProgress };
    let stateChanged = false;

    // CHECKPOINT 1 - DROITE de la piste (x > 140) - ZONE ÉLARGIE pour couvrir toute la largeur
    // Zone élargie : de x=140 à x=220 (toute la largeur de la route), z entre -100 et +100
    if (!newProgress.checkpoints.checkpoint1 && x > 140 && x < 220 && z > -100 && z < 100) {
      newProgress.checkpoints.checkpoint1 = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 1 (DROITE) franchi ! Zone élargie activée.");
    }
    
    // CHECKPOINT 2 - HAUT de la piste (z > 140) - ZONE ÉLARGIE pour couvrir toute la largeur
    // Zone élargie : de z=140 à z=220 (toute la largeur de la route), x entre -100 et +100
    else if (newProgress.checkpoints.checkpoint1 && 
             !newProgress.checkpoints.checkpoint2 && 
             z > 140 && z < 220 && x > -100 && x < 100) {
      newProgress.checkpoints.checkpoint2 = true;
      stateChanged = true;
      console.log("✅ CHECKPOINT 2 (HAUT) franchi ! Zone élargie activée.");
    }
    
    // CHECKPOINT 3 - GAUCHE de la piste (x < -140) - ZONE ÉLARGIE pour couvrir toute la largeur
    // Zone élargie : de x=-220 à x=-140 (toute la largeur de la route), z entre -100 et +100
    else if (newProgress.checkpoints.checkpoint1 && 
             newProgress.checkpoints.checkpoint2 && 
             !newProgress.checkpoints.checkpoint3 && 
             x < -140 && x > -220 && z > -100 && z < 100) {
      newProgress.checkpoints.checkpoint3 = true;
      newProgress.canFinishLap = true; // Maintenant on peut finir le tour
      stateChanged = true;
      console.log("✅ CHECKPOINT 3 (GAUCHE) franchi ! Zone élargie activée. Peut finir le tour maintenant.");
    }
    
    // LIGNE D'ARRIVÉE - Finir le tour (zone élargie de ligne d'arrivée au sud)
    // Zone élargie : z entre -220 et -140, x entre -100 et +100 (toute la largeur)
    else if (newProgress.canFinishLap && 
             z < -140 && z > -220 && x > -100 && x < 100) {
      
      // Vérification du délai minimum entre les tours
      const minDelay = 1000; // 1 seconde entre les tours
      
      if ((currentTime - newProgress.lastLapTime) > minDelay) {
        // TOUR TERMINÉ !
        newProgress.currentLap += 1;
        newProgress.lastLapTime = currentTime;
        
        // Remettre à zéro pour le tour suivant
        newProgress.checkpoints = {
          checkpoint1: false,
          checkpoint2: false,
          checkpoint3: false
        };
        newProgress.canFinishLap = false;
        
        stateChanged = true;
        console.log(`🏁 TOUR ${newProgress.currentLap} TERMINÉ ! Zone d'arrivée élargie.`);
        
        // Signaler le tour complet au composant parent
        onLapComplete();
      }
    }

    // Mettre à jour l'état seulement si quelque chose a changé
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

    // VÉRIFIER LES COLLISIONS AVEC LES BARRIÈRES
    const collisionCheckedPosition = checkBarrierCollisions(newPosition);
    
    // Si il y a eu collision, réduire la vitesse
    if (collisionCheckedPosition[0] !== newPosition[0] || collisionCheckedPosition[2] !== newPosition[2]) {
      newVelocity.x *= 0.1; // Forte réduction de vitesse lors d'une collision
      newVelocity.z *= 0.1;
      console.log("💥 COLLISION avec barrière !");
    }
    
    newPosition = collisionCheckedPosition;

    setCarPosition(newPosition);
    setCarRotation(newRotation);
    setVelocity(newVelocity);
    
    // Vérifier la progression du tour avec zones élargies
    checkLapProgress(newPosition);

    // Mise à jour de l'objet 3D
    if (carRef.current) {
      carRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
      carRef.current.rotation.y = newRotation;
    }

    onPositionChange(newPosition);
    onRotationChange(newRotation);
  });

  return (
    <group ref={carRef} scale={[1.5, 1.5, 1.5]}>
      {/* Corps de la voiture - Style plus moderne - AGRANDI x1.5 */}
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

// Piste 3D avec BARRIÈRES DE SÉCURITÉ et COLLISIONS
function RaceTrack() {
  // Créer la piste circulaire avec des segments droits
  const createCircularTrack = () => {
    const segments = [];
    const radius = 180;
    const trackWidth = 40;
    const numSegments = 64;
    
    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      segments.push(
        <Box 
          key={i} 
          args={[trackWidth, 0.5, trackWidth/2]} 
          position={[x, 0, z]} 
          rotation={[0, angle, 0]}
        >
          <meshStandardMaterial color="#333333" />
        </Box>
      );
    }
    return segments;
  };

  // CRÉER LES BARRIÈRES DE SÉCURITÉ
  const createSafetyBarriers = () => {
    const barriers = [];
    const numBarriers = 80;
    
    // BARRIÈRES EXTÉRIEURES (rayon 235)
    for (let i = 0; i < numBarriers; i++) {
      const angle = (i / numBarriers) * Math.PI * 2;
      const x = Math.cos(angle) * 235;
      const z = Math.sin(angle) * 235;
      
      barriers.push(
        <group key={`outer-${i}`} position={[x, 0, z]} rotation={[0, angle, 0]}>
          {/* Barrière principale */}
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" metalness={0.3} roughness={0.7} />
          </Box>
          {/* Rayures de sécurité */}
          <Box args={[3.2, 1, 8.2]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
          <Box args={[3.2, 1, 8.2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
          {/* Support métallique */}
          <Cylinder args={[0.2, 0.2, 4]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
          </Cylinder>
        </group>
      );
    }
    
    // BARRIÈRES INTÉRIEURES (rayon 145)
    for (let i = 0; i < numBarriers; i++) {
      const angle = (i / numBarriers) * Math.PI * 2;
      const x = Math.cos(angle) * 145;
      const z = Math.sin(angle) * 145;
      
      barriers.push(
        <group key={`inner-${i}`} position={[x, 0, z]} rotation={[0, angle + Math.PI, 0]}>
          {/* Barrière principale */}
          <Box args={[3, 4, 8]}>
            <meshStandardMaterial color="#ff3333" metalness={0.3} roughness={0.7} />
          </Box>
          {/* Rayures de sécurité */}
          <Box args={[3.2, 1, 8.2]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
          <Box args={[3.2, 1, 8.2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
          {/* Support métallique */}
          <Cylinder args={[0.2, 0.2, 4]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
          </Cylinder>
        </group>
      );
    }
    
    return barriers;
  };

  return (
    <group>
      {/* Surface de route plate principale */}
      <Cylinder args={[220, 220, 0.3]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#444444" />
      </Cylinder>
      
      {/* Piste circulaire avec segments */}
      {createCircularTrack()}
      
      {/* BARRIÈRES DE SÉCURITÉ AVEC COLLISIONS */}
      {createSafetyBarriers()}
      
      {/* Lignes blanches centrales - Segments plats */}
      {Array.from({ length: 64 }).map((_, i) => {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * 180;
        const z = Math.sin(angle) * 180;
        return (
          <Box 
            key={i} 
            args={[2, 0.1, 8]} 
            position={[x, 0.3, z]} 
            rotation={[0, angle, 0]}
          >
            <meshStandardMaterial color="#ffffff" />
          </Box>
        );
      })}
      
      {/* Lignes blanches intérieures */}
      {Array.from({ length: 64 }).map((_, i) => {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * 160;
        const z = Math.sin(angle) * 160;
        return (
          <Box 
            key={i} 
            args={[2, 0.1, 8]} 
            position={[x, 0.3, z]} 
            rotation={[0, angle, 0]}
          >
            <meshStandardMaterial color="#ffffff" />
          </Box>
        );
      })}
      
      {/* Lignes blanches extérieures */}
      {Array.from({ length: 64 }).map((_, i) => {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * 200;
        const z = Math.sin(angle) * 200;
        return (
          <Box 
            key={i} 
            args={[2, 0.1, 8]} 
            position={[x, 0.3, z]} 
            rotation={[0, angle, 0]}
          >
            <meshStandardMaterial color="#ffffff" />
          </Box>
        );
      })}
      
      {/* Herbe autour de la piste - GÉANTE */}
      <Cylinder args={[300, 300, 0.2]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Cylinder>
      
      {/* Arbres décoratifs - Plus espacés */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 280;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tronc */}
            <Cylinder args={[2, 3, 15]} position={[0, 7.5, 0]}>
              <meshStandardMaterial color="#8B4513" />
            </Cylinder>
            {/* Feuillage */}
            <Box args={[12, 12, 12]} position={[0, 18, 0]}>
              <meshStandardMaterial color="#006400" />
            </Box>
          </group>
        );
      })}
      
      {/* Panneaux publicitaires - Échelle x10 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 250;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 10, z]} rotation={[0, -angle, 0]}>
            <Box args={[30, 15, 1]}>
              <meshStandardMaterial color="#0066ff" />
            </Box>
            <Plane args={[25, 10]} position={[0, 0, 0.6]}>
              <meshStandardMaterial color="#ffffff" />
            </Plane>
          </group>
        );
      })}
      
      {/* Checkpoints ÉLARGIS - COUVRENT TOUTE LA LARGEUR DE LA ROUTE */}
      <group>
        {/* Checkpoint 1 (DROITE) - ZONE ÉLARGIE de x=140 à x=220, z de -100 à +100 */}
        <group position={[180, 0.3, 0]}>
          {/* Ligne principale élargie */}
          <Box args={[200, 0.2, 8]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#00ff00" emissive="#004400" />
          </Box>
          {/* Rayures vertes alternées plus larges */}
          {Array.from({ length: 50 }).map((_, i) => (
            <Box key={i} args={[4, 0.3, 4]} position={[-100 + i * 4, 0, 0]}>
              <meshStandardMaterial color={i % 2 === 0 ? "#00ff00" : "#00cc00"} emissive="#002200" />
            </Box>
          ))}
        </group>
        
        {/* Checkpoint 2 (HAUT) - ZONE ÉLARGIE de z=140 à z=220, x de -100 à +100 */}
        <group position={[0, 0.3, 180]}>
          {/* Ligne principale élargie */}
          <Box args={[8, 0.2, 200]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#00ff00" emissive="#004400" />
          </Box>
          {/* Rayures vertes alternées plus larges */}
          {Array.from({ length: 50 }).map((_, i) => (
            <Box key={i} args={[4, 0.3, 4]} position={[0, 0, -100 + i * 4]}>
              <meshStandardMaterial color={i % 2 === 0 ? "#00ff00" : "#00cc00"} emissive="#002200" />
            </Box>
          ))}
        </group>
        
        {/* Checkpoint 3 (GAUCHE) - ZONE ÉLARGIE de x=-220 à x=-140, z de -100 à +100 */}
        <group position={[-180, 0.3, 0]}>
          {/* Ligne principale élargie */}
          <Box args={[200, 0.2, 8]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#00ff00" emissive="#004400" />
          </Box>
          {/* Rayures vertes alternées plus larges */}
          {Array.from({ length: 50 }).map((_, i) => (
            <Box key={i} args={[4, 0.3, 4]} position={[-100 + i * 4, 0, 0]}>
              <meshStandardMaterial color={i % 2 === 0 ? "#00ff00" : "#00cc00"} emissive="#002200" />
            </Box>
          ))}
        </group>
      </group>
      
      {/* Ligne de départ/arrivée avec damier - ZONE ÉLARGIE */}
      <group position={[0, 0.4, -180]} rotation={[0, 0, 0]}>
        {/* Ligne d'arrivée perpendiculaire élargie qui traverse toute la largeur de la piste */}
        <Box args={[8, 0.2, 200]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        {/* Motif damier perpendiculaire élargi - traverse toute la largeur */}
        {Array.from({ length: 50 }).map((_, i) => (
          <Box key={i} args={[4, 0.3, 4]} position={[0, 0, -100 + i * 4]}>
            <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
          </Box>
        ))}
        {/* Panneau DÉPART/ARRIVÉE - GARDÉ pour la ligne d'arrivée */}
        <Box args={[15, 10, 1]} position={[0, 10, 15]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
      </group>
      
      {/* Éclairage de la piste - Plus de lampadaires */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 260; // Déplacés plus loin pour laisser place aux barrières
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 20, z]}>
            <Cylinder args={[0.5, 0.5, 20]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#666666" />
            </Cylinder>
            <Box args={[3, 3, 3]} position={[0, 12, 0]}>
              <meshStandardMaterial color="#ffff00" emissive="#444400" />
            </Box>
            <pointLight position={[0, 10, 0]} intensity={2} color="#ffff88" distance={100} />
          </group>
        );
      })}
    </group>
  );
}

// Caméra qui suit automatiquement la voiture (troisième personne)
function FollowCamera({ carPosition, carRotation, cameraMode }: { carPosition: number[], carRotation: number, cameraMode: string }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const carX = carPosition[0];
    const carY = carPosition[1];
    const carZ = carPosition[2];
    
    if (cameraMode === 'follow') {
      // Caméra de suivi (troisième personne)
      const distance = 25;
      const height = 15;
      
      // Position de la caméra derrière la voiture
      const cameraX = carX - Math.sin(carRotation) * distance;
      const cameraY = carY + height;
      const cameraZ = carZ - Math.cos(carRotation) * distance;
      
      // Position cible (devant la voiture)
      const targetX = carX + Math.sin(carRotation) * 10;
      const targetY = carY + 2;
      const targetZ = carZ + Math.cos(carRotation) * 10;
      
      // Interpolation fluide pour éviter les mouvements brusques
      camera.position.lerp(new THREE.Vector3(cameraX, cameraY, cameraZ), 0.1);
      camera.lookAt(new THREE.Vector3(targetX, targetY, targetZ));
    } else if (cameraMode === 'cockpit') {
      // Vue cockpit (première personne)
      const offsetY = 2;
      const offsetZ = 1;
      
      const cockpitX = carX + Math.sin(carRotation) * offsetZ;
      const cockpitY = carY + offsetY;
      const cockpitZ = carZ + Math.cos(carRotation) * offsetZ;
      
      // Position cible devant la voiture
      const targetX = carX + Math.sin(carRotation) * 20;
      const targetY = carY + 1;
      const targetZ = carZ + Math.cos(carRotation) * 20;
      
      camera.position.lerp(new THREE.Vector3(cockpitX, cockpitY, cockpitZ), 0.15);
      camera.lookAt(new THREE.Vector3(targetX, targetY, targetZ));
    } else if (cameraMode === 'aerial') {
      // Vue aérienne
      const height = 40;
      camera.position.lerp(new THREE.Vector3(carX, carY + height, carZ), 0.05);
      camera.lookAt(new THREE.Vector3(carX, carY, carZ));
    }
  });

  return null;
}

// Interface utilisateur avec compteur de tours et sélecteur de caméra
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
        🏁 Circuit F1 - CHECKPOINTS ÉLARGIS
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
          ✅ Checkpoints élargis pour plus de facilité !
        </div>
      </div>
    </div>
  );
}

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [gameStarted, setGameStarted] = useState(false);
  // POSITION DE DÉPART CORRIGÉE : Sur la piste circulaire à la ligne d'arrivée
  const [carPosition, setCarPosition] = useState([0, 1, -180]); // Exactement sur la ligne d'arrivée (piste circulaire)
  const [carRotation, setCarRotation] = useState(Math.PI / 2); // 90° pour regarder vers la droite (checkpoint 1)
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
        camera={{ position: [0, 50, 80], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #87CEEB 0%, #98FB98 50%, #FFE4B5 100%)' }}
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
        
        {/* Piste 3D avec BARRIÈRES DE SÉCURITÉ */}
        <RaceTrack />
        
        {/* Voiture avec SYSTÈME DE COLLISION */}
        <Car 
          position={[0, 1, -180]} 
          rotation={Math.PI / 2}
          onPositionChange={setCarPosition}
          onRotationChange={setCarRotation}
          onLapComplete={handleLapComplete}
        />
        
        {/* Caméra qui suit automatiquement la voiture */}
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