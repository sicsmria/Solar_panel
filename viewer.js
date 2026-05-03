
// 정적 페이지용 Three.js 뷰어
// importmap이 부모 HTML에 정의돼 있음 (THREE, three/addons/)

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log('[viewer] Three.js loaded, version:', THREE.REVISION);

const container = document.getElementById('solar-viewer-3d');
if (!container) {
    console.warn('[viewer] #solar-viewer-3d container not found, skipping init');
} else {
    initViewer(container);
}

function initViewer(container) {
    // 컨테이너 크기 확보 대기 (CSS 로드 전이면 0일 수 있음)
    let W = container.clientWidth;
    let H = container.clientHeight;
    console.log('[viewer] container size:', W, 'x', H);

    if (W === 0 || H === 0) {
        console.warn('[viewer] container size is 0, retrying in 100ms');
        setTimeout(() => initViewer(container), 100);
        return;
    }

    container.style.position = 'relative';

    // 로딩 메시지
    const loading = document.createElement('div');
    loading.textContent = '🔄 3D 모델 로드 중...';
    loading.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#8b949e;font-family:sans-serif;z-index:10;';
    container.appendChild(loading);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161b22);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 5000);
    camera.position.set(20, 20, 20);

    // Renderer
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);
        console.log('[viewer] WebGL renderer created');
    } catch (e) {
        console.error('[viewer] WebGL initialization failed:', e);
        loading.textContent = '❌ WebGL 초기화 실패: ' + e.message;
        loading.style.color = '#f88';
        return;
    }

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dl1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dl1.position.set(50, 80, 30);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dl2.position.set(-50, 30, -30);
    scene.add(dl2);

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(grid);

    // GLB load
    const glbUrl = './scene.glb';
    console.log('[viewer] Loading', glbUrl);
    const loader = new GLTFLoader();

    loader.load(
        glbUrl,
        (gltf) => {
            console.log('[viewer] GLB loaded successfully', gltf);
            const model = gltf.scene;
            scene.add(model);

            // 자동 줌
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            console.log('[viewer] model size:', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2));

            const fov = camera.fov * (Math.PI / 180);
            const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 2.0;

            camera.position.set(
                center.x + cameraDistance * 0.7,
                center.y + cameraDistance * 0.7,
                center.z + cameraDistance * 0.7
            );
            controls.target.copy(center);
            controls.update();
            grid.position.y = box.min.y;

            loading.remove();
        },
        (xhr) => {
            if (xhr.lengthComputable) {
                const pct = (xhr.loaded / xhr.total * 100).toFixed(0);
                loading.textContent = `🔄 로드 중... ${pct}%`;
            }
        },
        (err) => {
            console.error('[viewer] GLB load failed:', err);
            const isHttp = err && err.target && err.target.status;
            const detail = isHttp
                ? `HTTP ${err.target.status}`
                : (err.message || String(err));
            loading.innerHTML =
                '❌ 3D 모델 로드 실패<br>' +
                '<span style="font-size:11px;color:#888">' + detail + '</span><br>' +
                '<span style="font-size:11px;color:#888">F12 → Console에서 자세한 로그 확인</span>';
            loading.style.color = '#f88';
        }
    );

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    console.log('[viewer] Animation loop started');

    // 컨테이너 리사이즈 대응
    new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    }).observe(container);
}
