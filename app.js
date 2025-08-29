// app.js
// Plain JS 3D game using Three.js (global version via CDN).
// Donut (+10 points), Bomb (-1 health), 60s timer.

(() => {
  // DOM Elements
  const $score = document.getElementById("score");
  const $time = document.getElementById("time");
  const $health = document.getElementById("health");
  const $overlay = document.getElementById("overlay");
  const $gameOver = document.getElementById("gameOver");
  const $finalScore = document.getElementById("finalScore");
  const $startBtn = document.getElementById("startBtn");
  const $restartBtn = document.getElementById("restartBtn");
  const $webgl = document.getElementById("webgl");

  // Game state
  const state = {
    score: 0,
    timeLeft: 60,
    health: 3,
    running: false,
    startedOnce: false,
  };

  // Three.js essentials
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfafafa);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  $webgl.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  // Objects
  const objects = [];

  function spawnDonut() {
    const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xffd166 });
    const mesh = new THREE.Mesh(geometry, material);
    resetObjectPosition(mesh);
    mesh.userData.type = "donut";
    scene.add(mesh);
    objects.push(mesh);
  }

  function spawnBomb() {
    const geometry = new THREE.SphereGeometry(0.4, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xef476f });
    const mesh = new THREE.Mesh(geometry, material);
    resetObjectPosition(mesh);
    mesh.userData.type = "bomb";
    scene.add(mesh);
    objects.push(mesh);
  }

  function resetObjectPosition(mesh) {
    mesh.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2
    );
  }

  // Game loop
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function animate() {
    if (state.running) {
      objects.forEach((obj) => {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
      });
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Click detection
  renderer.domElement.addEventListener("click", (event) => {
    if (!state.running) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData.type === "donut") {
        state.score += 10;
        resetObjectPosition(obj);
      } else if (obj.userData.type === "bomb") {
        state.health -= 1;
        resetObjectPosition(obj);
        if (state.health <= 0) endGame();
      }
      updateHUD();
    }
  });

  // HUD
  function updateHUD() {
    $score.textContent = state.score;
    $time.textContent = state.timeLeft;
    $health.textContent = state.health;
  }

  // Game control
  let timerInterval;

  function startGame() {
    state.running = true;
    state.startedOnce = true;
    state.score = 0;
    state.health = 3;
    state.timeLeft = 60;

    updateHUD();
    $overlay.classList.add("hidden");
    $gameOver.classList.add("hidden");

    objects.forEach((o) => scene.remove(o));
    objects.length = 0;
    spawnDonut();
    spawnBomb();

    timerInterval = setInterval(() => {
      if (state.timeLeft > 0) {
        state.timeLeft--;
        updateHUD();
      } else {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    state.running = false;
    clearInterval(timerInterval);
    $finalScore.textContent = state.score;
    $gameOver.classList.remove("hidden");
  }

  $startBtn.addEventListener("click", startGame);
  $restartBtn.addEventListener("click", startGame);

  // Resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
