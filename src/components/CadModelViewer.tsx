'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Box, RotateCcw, Grid } from 'lucide-react';

interface CadModelViewerProps {
  modelUrl: string;
  cadCode: string;
}

export default function CadModelViewer({ modelUrl, cadCode }: CadModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    setStatus('loading');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    camera.position.set(3, 2.5, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x69afd7, 0.8);
    fillLight.position.set(-4, 3, -5);
    scene.add(fillLight);

    const grid = new THREE.GridHelper(8, 16, 0x94a3b8, 0xe2e8f0);
    grid.position.y = -0.02;
    grid.visible = false;
    gridRef.current = grid;
    scene.add(grid);

    let loadedGroup: THREE.Group | null = null;
    let disposed = false;

    const frameObject = (object: THREE.Object3D) => {
      // Use a wrapper group to separate centering from scaling
      const group = new THREE.Group();
      group.add(object);

      const box = new THREE.Box3().setFromObject(group);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scaleFactor = 3 / maxDim;

      console.log('[CadModelViewer] Model loaded - size:', size, 'center:', center, 'scale:', scaleFactor);

      // Center the object within the group
      object.position.set(-center.x, -center.y, -center.z);
      // Scale the entire group
      group.scale.setScalar(scaleFactor);

      camera.position.set(3, 2.5, 4);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();

      return group;
    };

    const applyDefaultMaterial = (object: THREE.Object3D) => {
      let meshCount = 0;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshCount++;
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x3583b2,
              metalness: 0.35,
              roughness: 0.45
            });
          }
        }
      });
      console.log('[CadModelViewer] Found', meshCount, 'meshes in model');
    };

    const handleLoaded = (object: THREE.Object3D) => {
      if (disposed) return;
      console.log('[CadModelViewer] Model loaded successfully:', modelUrl);
      applyDefaultMaterial(object);
      const group = frameObject(object);
      loadedGroup = group;
      scene.add(group);
      setStatus('ready');
    };

    const handleError = (err?: unknown) => {
      console.error('[CadModelViewer] Failed to load model:', modelUrl, err);
      if (!disposed) setStatus('error');
    };

    const extension = modelUrl.split('?')[0].split('.').pop()?.toLowerCase();
    console.log('[CadModelViewer] Loading model:', modelUrl, 'extension:', extension);

    if (extension === 'glb' || extension === 'gltf') {
      new GLTFLoader().load(modelUrl, (gltf) => handleLoaded(gltf.scene), undefined, handleError);
    } else if (extension === 'obj') {
      new OBJLoader().load(modelUrl, handleLoaded, undefined, handleError);
    } else if (extension === 'stl') {
      new STLLoader().load(
        modelUrl,
        (geometry) => {
          const mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
              color: 0x3583b2,
              metalness: 0.35,
              roughness: 0.45
            })
          );
          handleLoaded(mesh);
        },
        undefined,
        handleError
      );
    } else {
      handleError();
    }

    let animationFrameId = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nextWidth = container.clientWidth || 640;
      const nextHeight = container.clientHeight || 420;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (loadedGroup) {
        loadedGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => material.dispose());
          }
        });
      }
      gridRef.current = null;
      renderer.dispose();
      container.replaceChildren();
    };
  }, [modelUrl]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = showGrid;
    }
  }, [showGrid]);

  const handleReset = () => {
    cameraRef.current?.position.set(3, 2.5, 4);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  };

  return (
    <div className="relative w-full h-full bg-slate-50">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-3 left-3 z-30 bg-white/90 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-xl backdrop-blur-md shadow-sm flex items-center gap-2 font-mono font-bold">
        <Box className="w-4 h-4 text-[#3583b2]" />
        <span>3D PREVIEW - {cadCode}</span>
      </div>

      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleReset}
          className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition-colors"
          title="Đặt lại góc nhìn"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowGrid((prev) => !prev)}
          className={`p-2 rounded-xl border border-slate-200 shadow-sm transition-colors ${
            showGrid ? 'bg-[#3583b2] text-white' : 'bg-white/90 hover:bg-white text-slate-700'
          }`}
          title={showGrid ? 'Ẩn lưới tọa độ' : 'Hiện lưới tọa độ'}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {status !== 'ready' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/80 text-xs font-bold text-slate-500">
          {status === 'loading' ? 'Dang tai file 3D...' : 'Khong doc duoc file 3D preview'}
        </div>
      )}
    </div>
  );
}
