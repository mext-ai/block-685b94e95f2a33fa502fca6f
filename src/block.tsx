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

// Composant de la voiture
function Car({ position, rotation, onPositionChange, onLapComplete, onRotationChange }: any) {
  const carRef = useRef<THREE.Group>(null);
  const [carPosition, setCarPosition] = useState(position);
  const [carRotation, setCarRotation] = useState(rotation);
  const [velocity, setVelocity] = useState({ x: 0, z: 0 });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const [checkpoints, setCheckpoints] = useState({
    checkpoint1: false,
    checkpoint2: false,
    checkpoint3: false
  });
  const [hasStarted, setHasStarted] = useState(false); // Pour détecter le premier passage sur la ligne

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

  // Fonction pour vérifier les checkpoints (adaptée pour la GRANDE piste)
  const checkCheckpoints = (pos: number[]) => {
    const x = pos[0];
    const z = pos[2];
    let newCheckpoints = { ...checkpoints };
    
    // Détection du démarrage (premier passage sur la ligne d'arrivée)
    if (!hasStarted && z > -200 && z < -160 && Math.abs(x) < 50) {
      setHasStarted(true);
      return; // Ne pas compter comme un tour complet
    }
    
    // Checkpoint 1 (haut de la piste) - Échelle x10
    if (z > 150 && Math.abs(x) < 50 && !checkpoints.checkpoint1 && hasStarted) {
      newCheckpoints.checkpoint1 = true;
    }
    // Checkpoint 2 (droite de la piste) - Échelle x10
    if (x > 150 && Math.abs(z) < 50 && checkpoints.checkpoint1 && !checkpoints.checkpoint2 && hasStarted) {
      newCheckpoints.checkpoint2 = true;
    }
    // Checkpoint 3 (gauche de la piste) - Échelle x10
    if (x < -150 && Math.abs(z) < 50 && checkpoints.checkpoint2 && !checkpoints.checkpoint3 && hasStarted) {
      newCheckpoints.checkpoint3 = true;
    }
    
    // Ligne d'arrivée (tour complet) - PERPENDICULAIRE À LA ROUTE (côté sud)
    if (z > -200 && z < -160 && Math.abs(x) < 50 && 
        checkpoints.checkpoint1 && checkpoints.checkpoint2 && checkpoints.checkpoint3 && hasStarted) {
      // Tour complet !
      onLapComplete();
      newCheckpoints = {
        checkpoint1: false,
        checkpoint2: false,
        checkpoint3: false
      };
    }
    
    setCheckpoints(newCheckpoints);
  };

  useFrame(() => {
    if (!carRef.current) return;

    const speed = 0.15; // Vitesse RÉDUITE (était 0.3)
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

    // Friction AUGMENTÉE pour moins de glissement
    newVelocity.x *= 0.92; // Plus de friction (était 0.98)
    newVelocity.z *= 0.92;

    // Mise à jour de la position
    const newPosition = [
      carPosition[0] + newVelocity.x,
      carPosition[1],
      carPosition[2] + newVelocity.z
    ];

    // Limites générales élargies x10
    const trackLimit = 250;
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
    onRotationChange(newRotation);
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

// Piste 3D procédurale GÉANTE et COMPLÈTEMENT PLATE
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

  return (
    <group>
      {/* Surface de route plate principale */}
      <Cylinder args={[220, 220, 0.3]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#444444" />
      </Cylinder>
      
      {/* Piste circulaire avec segments */}
      {createCircularTrack()}
      
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
      
      {/* Bordures de sécurité PLATES */}
      {Array.from({ length: 64 }).map((_, i) => {
        const angle = (i / 64) * Math.PI * 2;
        const xInner = Math.cos(angle) * 140;
        const zInner = Math.sin(angle) * 140;
        const xOuter = Math.cos(angle) * 220;
        const zOuter = Math.sin(angle) * 220;
        return (
          <group key={i}>
            {/* Bordure intérieure */}
            <Box args={[6, 2, 6]} position={[xInner, 1, zInner]}>
              <meshStandardMaterial color="#ff0000" />
            </Box>
            {/* Bordure extérieure */}
            <Box args={[6, 2, 6]} position={[xOuter, 1, zOuter]}>
              <meshStandardMaterial color="#ff0000" />
            </Box>
          </group>
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
      
      {/* Checkpoints - LIGNES VERTES AU SOL (seulement 3 checkpoints) */}
      <group>
        {/* Checkpoint 1 (haut) - Ligne verte striée */}
        <group position={[0, 0.3, 180]}>
          <Box args={[2, 0.2, 60]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#00ff00" emissive="#004400" />
          </Box>
          {/* Rayures vertes alternées */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Box key={i} args={[1, 0.3, 3]} position={[0, 0, -30 + i * 3]}>
              <meshStandardMaterial color={i % 2 === 0 ? "#00ff00" : "#00cc00"} emissive="#002200" />
            </Box>
          ))}
        </group>
        
        {/* Checkpoint 2 (droite) - Ligne verte striée */}
        <group position={[180, 0.3, 0]}>
          <Box args={[60, 0.2, 2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#00ff00" emissive="#004400" />
          </Box>
          {/* Rayures vertes alternées */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Box key={i} args={[3, 0.3, 1]} position={[-30 + i * 3, 0, 0]}>
              <meshStandardMaterial color={i % 2 === 0 ? "#00ff00" : "#00cc00"} emissive="#002200" />
            </Box>
          ))}
        </group>
        
        {/* Checkpoint 3 (gauche) - Ligne verte striée */}
        <group position={[-180, 0.3, 0]}>
          <Box args={[60, 0.2, 2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#00ff00" emissive="#004400" />
          </Box>
          {/* Rayures vertes alternées */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Box key={i} args={[3, 0.3, 1]} position={[-30 + i * 3, 0, 0]}>
              <meshStandardMaterial color={i % 2 === 0 ? "#00ff00" : "#00cc00"} emissive="#002200" />
            </Box>
          ))}
        </group>
      </group>
      
      {/* Ligne de départ/arrivée avec damier - PERPENDICULAIRE À LA ROUTE (côté sud) */}
      <group position={[0, 0.4, -180]} rotation={[0, 0, 0]}>
        {/* Ligne d'arrivée perpendiculaire qui traverse toute la largeur de la piste */}
        <Box args={[3, 0.2, 60]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        {/* Motif damier perpendiculaire - traverse toute la largeur */}
        {Array.from({ length: 15 }).map((_, i) => (
          <Box key={i} args={[2, 0.3, 4]} position={[0, 0, -30 + i * 4]}>
            <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
          </Box>
        ))}
      </group>
      
      {/* Éclairage de la piste - Plus de lampadaires */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 240;
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
        🏁 Circuit F1 - CAMÉRA VERROUILLÉE
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
        <div style={{ marginTop: '10px', color: '#88ddff' }}>
          🎥 Caméra suit automatiquement la voiture
        </div>
        <div style={{ color: '#88ddff' }}>
          Changez le mode de vue avec les boutons
        </div>
      </div>
    </div>
  );
}

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [carPosition, setCarPosition] = useState([0, 1, -200]); // Position de départ AVANT la ligne d'arrivée
  const [carRotation, setCarRotation] = useState(0); // Rotation 0° pour être perpendiculaire à la ligne d'arrivée
  const [currentLap, setCurrentLap] = useState(0);
  const [totalLaps] = useState(3);
  const [gameWon, setGameWon] = useState(false);
  const [startTime] = useState(Date.now());
  const [raceTime, setRaceTime] = useState(0);
  const [cameraMode, setCameraMode] = useState('follow'); // 'follow', 'cockpit', 'aerial'

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
        
        {/* Piste 3D procédurale COMPLÈTEMENT PLATE */}
        <RaceTrack />
        
        {/* Voiture améliorée */}
        <Car 
          position={[0, 1, -200]} 
          rotation={0}
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