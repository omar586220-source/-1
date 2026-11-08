// إعدادات محرك الرسوميات Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // لون السماء

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// إضافة إضاءة للعالم
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

// إنشاء الأرض (الجزيرة)
const groundGeo = new THREE.BoxGeometry(50, 1, 50);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // عشب أخضر
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -0.5;
scene.add(ground);

// إنشاء اللاعب (مجسم ثلاثي الأبعاد بسيط)
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 1;
scene.add(player);

// إنشاء فاكهة الشيطان (مجسم متوهج في العالم)
const fruitGeo = new THREE.SphereGeometry(0.5, 16, 16);
const fruitMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff0000 }); // فاكهة اللهب النارية
const fruit = new THREE.Mesh(fruitGeo, fruitMat);
fruit.position.set(5, 0.5, 5);
scene.add(fruit);

camera.position.set(0, 5, 10);
camera.lookAt(player.position);

// بيانات اللاعب (State)
let playerStats = {
    level: 1,
    beli: 100,
    xp: 0,
    maxXp: 100,
    hp: 100,
    maxHp: 100,
    fruit: "لا يوجد",
    speed: 0.15
};

// إدارة التحكم من لوحة المفاتيح
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// نظام القتال والـ XP عند الضغط على Space
window.addEventListener('keydown', (e) => {
    if (e.key === " ") {
        // إحداث تأثير حركة هجومية سريعة للاعب
        player.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => player.scale.set(1, 1, 1), 100);
        
        // زيادة الـ XP
        playerStats.xp += 20;
        if (playerStats.xp >= playerStats.maxXp) {
            playerStats.xp -= playerStats.maxXp;
            playerStats.level += 1;
            playerStats.maxXp = playerStats.level * 100;
            playerStats.beli += 150;
            playerStats.maxHp += 20;
            playerStats.hp = playerStats.maxHp;
        }
        updateUI();
    }
});

// تحديث واجهات الشاشة ببيانات اللاعب الحالية
function updateUI() {
    document.getElementById('level').innerText = playerStats.level;
    document.getElementById('beli').innerText = playerStats.beli;
    document.getElementById('fruit').innerText = playerStats.fruit;
    document.getElementById('hp-bar').style.width = (playerStats.hp / playerStats.maxHp * 100) + '%';
    document.getElementById('xp-bar').style.width = (playerStats.xp / playerStats.maxXp * 100) + '%';
}

// حلقة تشغيل اللعبة المستمرة (Game Loop)
function animate() {
    requestAnimationFrame(animate);

    // حركة اللاعب بناءً على الأزرار المضغوطة
    if (keys['w'] || keys['arrowup']) player.position.z -= playerStats.speed;
    if (keys['s'] || keys['arrowdown']) player.position.z += playerStats.speed;
    if (keys['a'] || keys['arrowleft']) player.position.x -= playerStats.speed;
    if (keys['d'] || keys['arrowright']) player.position.x += playerStats.speed;

    // جعل الكاميرا تتبع اللاعب بسلاسة
    camera.position.set(player.position.x, player.position.y + 6, player.position.z + 10);
    camera.lookAt(player.position);

    // دوران الفاكهة في مكانها لإعطاء تأثير تفاعلي
    if (scene.children.includes(fruit)) {
        fruit.rotation.y += 0.03;
        
        // نظام تناول الفاكهة: عند اقتراب اللاعب منها (Collision)
        let distance = player.position.distanceTo(fruit.position);
        if (distance < 1.2) {
            scene.remove(fruit); // تختفي الفاكهة من العالم
            playerStats.fruit = "فاكهة اللهب 🔥";
            playerStats.speed = 0.25; // تزيد سرعة اللاعب لأن الفاكهة أعطته قوة
            playerStats.maxHp += 100;
            playerStats.hp = playerStats.maxHp;
            playerMat.color.setHex(0xff4500); // يتغير لون اللاعب إلى البرتقالي الناري
            updateUI();
        }
    }

    renderer.render(scene, camera);
}

// تشغيل اللعبة لأول مرة
updateUI();
animate();

// إعادة ضبط الحجم عند تكبير أو تذكير نافذة المتصفح
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
