const modal = document.getElementById("orderModal");
const totalPrice = document.getElementById("totalPrice");

/* OPEN MODAL */
function openModal() {
  modal.style.display = "flex";
  calculate();
}

/* CLOSE MODAL */
function closeModal() {
  modal.style.display = "none";
}

/* OPEN ONLY BY BUTTON CLICK */
document.querySelectorAll(".buy-btn").forEach((button) => {
  button.addEventListener("click", openModal);
});

/* TOTAL CALCULATION */
function calculate() {
  let sum = 0;

  document.querySelectorAll(".product").forEach((item) => {
    const checkbox = item.querySelector(".product-check");
    const qtyInput = item.querySelector(".qty");

    let qty = parseInt(qtyInput.value);

    // защита от отрицательных и пустых значений
    if (isNaN(qty) || qty < 1) {
      qty = 1;
      qtyInput.value = 1;
    }

    if (checkbox.checked) {
      sum += checkbox.dataset.price * qty;
    }
  });

  totalPrice.textContent = sum;
}

document.querySelectorAll(".product").forEach((item) => {
  const checkbox = item.querySelector(".product-check");
  const qty = item.querySelector(".qty");

  checkbox.addEventListener("change", () => {
    qty.disabled = !checkbox.checked;
    calculate();
  });

  qty.disabled = !checkbox.checked;
});

/* LIVE UPDATE */
document.addEventListener("input", calculate);
document.addEventListener("change", calculate);

/* CLOSE WHEN CLICK OUTSIDE */
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function sendToTelegram(text) {
  const token = "8435312690:AAGEck4Jadc-1csAaXiizKDg6r_87VlOmHo"; // ← новый токен
  const chatId = "6568515777";

  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}

document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let orderDetails = "";
  let total = 0;

  document.querySelectorAll(".product").forEach((item) => {
    const check = item.querySelector(".product-check");
    const qtyInput = item.querySelector(".qty");
    const name = item.querySelector(".product-text").textContent;

    let qty = parseInt(qtyInput.value);
    if (isNaN(qty) || qty < 1) qty = 1;

    if (check.checked) {
      const price = parseInt(check.dataset.price);
      orderDetails += `${name} × ${qty}\n`;
      total += price * qty;
    }
  });

  const data = {
    name: this.name.value,
    address: this.address.value,
    email: this.email.value,
    phone: this.phone.value,
    comment: this.comment.value,
  };

  const telegramText = `
🛒 Новый заказ

👤 ФИО: ${data.name}
📍 Адрес: ${data.address}
📧 Email: ${data.email}
📞 Телефон: ${data.phone}

📦 Заказ:
${orderDetails || "Ничего не выбрано"}

💬 Комментарий:
${data.comment || "—"}

💰 Итого: ${total} ₸
  `;

  sendToTelegram(telegramText)
    .then(() => {
      alert("Заказ отправлен!");
      this.reset();
      closeModal();
    })
    .catch((err) => {
      alert("Ошибка отправки в Telegram");
      console.error(err);
    });
});

document.querySelectorAll(".glasses-canvas").forEach((canvas) => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / 300,
    0.1,
    100
  );
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(canvas.clientWidth, 300);
  renderer.setPixelRatio(window.devicePixelRatio);

  // LIGHT
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // LOAD MODEL (ОДИН РАЗ)
  let model;
  const loader = new THREE.GLTFLoader();

  // TEST OBJECT — если это НЕ видно, Three.js вообще не работает
  const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial()
  );
  scene.add(testCube);

  loader.load(
    "./ultraglasses.glb",
    (gltf) => {
      model = gltf.scene;

      // === АВТО-ЦЕНТРИРОВАНИЕ ===
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // === АВТО-МАСШТАБ ===
      const size = box.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxAxis;
      model.scale.setScalar(scale);

      scene.add(model);
      console.log("3D model centered & scaled ✅");
    },
    undefined,
    (err) => console.error("GLB error:", err)
  );

  // MOUSE
  let mouseX = 0;
  let mouseY = 0;

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    testCube.rotation.x += 0.01;
    testCube.rotation.y += 0.01;

    if (model) {
      model.rotation.y += (mouseX * 0.8 - model.rotation.y) * 0.1;
      model.rotation.x += (-mouseY * 0.4 - model.rotation.x) * 0.1;
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    const width = canvas.clientWidth;
    const height = 300;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
});
