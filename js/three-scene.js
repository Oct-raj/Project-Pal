
const container = document.getElementById("cube-container");

if (container && window.THREE) {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(2, 2, 2);

    const material = new THREE.MeshBasicMaterial({
        color: 0x39ff14,
        wireframe: true
    });

    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    camera.position.z = 4;

    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }

    animate();
}
