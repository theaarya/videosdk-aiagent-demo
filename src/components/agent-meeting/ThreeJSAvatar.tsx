import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeJSAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isConnected?: boolean;
  participantId?: string;
  className?: string;
}

const sizeMap = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 160, height: 160 }
};

export const ThreeJSAvatar: React.FC<ThreeJSAvatarProps> = ({
  size = 'md',
  isConnected = false,
  participantId,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);

  const { width, height } = sizeMap[size];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Gradient material
    const vertexShader = `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vPosition;
      uniform float time;
      
      void main() {
        float gradient = (vPosition.y + 1.0) * 0.5;
        vec3 color1 = vec3(0.2, 0.6, 1.0); // Light blue
        vec3 color2 = vec3(0.8, 0.2, 1.0); // Purple
        vec3 finalColor = mix(color1, color2, gradient);
        
        // Add some animation
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        finalColor *= pulse;
        
        gl_FragColor = vec4(finalColor, 0.9);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 }
      },
      transparent: true
    });

    // Create sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphereRef.current = sphere;
    scene.add(sphere);

    // Animation loop
    const animate = () => {
      const time = Date.now() * 0.001;
      
      // Update shader time
      if (material.uniforms.time) {
        material.uniforms.time.value = time;
      }

      // Rotate sphere
      if (sphereRef.current) {
        sphereRef.current.rotation.y = time * 0.5;
        sphereRef.current.rotation.x = Math.sin(time) * 0.1;
        
        // Audio-reactive scaling simulation
        if (isConnected) {
          const scale = 1 + Math.sin(time * 4) * 0.1;
          sphereRef.current.scale.setScalar(scale);
        } else {
          // Gentle breathing animation when not connected
          const scale = 1 + Math.sin(time * 2) * 0.05;
          sphereRef.current.scale.setScalar(scale);
        }
      }

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [width, height, isConnected]);

  return (
    <div 
      ref={mountRef} 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width, height }}
    />
  );
};