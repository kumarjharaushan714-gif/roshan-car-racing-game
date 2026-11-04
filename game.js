
const canvas = document.getElementById("race");
const ctx = canvas.getContext("2d");

const speedText = document.getElementById("speed");
const lapText = document.getElementById("lap");
const positionText = document.getElementById("position");
const message = document.getElementById("message");

const keys = {
  left: false,
  right: false,
  accelerate: false,
  brake: false
};

let player;
let opponents;
let distance;
let finished;
let lastTime = 0;

const road = {
  x: 230,
  width: 440,
  center: 450
};

function resetGame() {
  player = {
    x: 450,
    y: 475,
    speed: 0,
    maxSpeed: 260,
    color: "#00e5ff",
    progress: 0
  };

  opponents = [
    { x: 350, y: 180, speed: 170, color: "#ff3d5a", progress: 0 },
    { x: 450, y: 80, speed: 190, color: "#ffd740", progress: 0 },
    { x: 550, y: 280, speed: 155, color: "#bb86fc", progress: 0 }
  ];

  distance = 0;
  finished = false;
  message.textContent = "Race shuru! Accelerate dabao.";
}

function drawCar(x, y, color) {
  ctx.save();
  ctx.translate(x, y);

  // Wheels
  ctx.fillStyle = "#101010";
  ctx.fillRect(-19, -25, 7, 20);
  ctx.fillRect(12, -25, 7, 20);
  ctx.fillRect(-19, 12, 7, 20);
  ctx.fillRect(12, 12, 7, 20);

  // Car body
  ctx.fillStyle = color;
  ctx.fillRect(-15, -32, 30, 68);

  // Windshield
  ctx.fillStyle = "#bcecff";
  ctx.fillRect(-10, -18, 20, 18);

  // Rear window
  ctx.fillStyle = "#26364c";
  ctx.fillRect(-10, 10, 20, 10);

  // Lights
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-12, 28, 7, 4);
  ctx.fillRect(5, 28, 7, 4);

  ctx.restore();
}

function drawTrack() {
  ctx.fillStyle = "#267a35";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Road
  ctx.fillStyle = "#454a53";
  ctx.fillRect(road.x, 0, road.width, canvas.height);

  // Road edges
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(road.x, 0, 7, canvas.height);
  ctx.fillRect(road.x + road.width - 7, 0, 7, canvas.height);

  // Center dashed line
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  ctx.setLineDash([30, 25]);
  ctx.lineDashOffset = -(distance % 55);
  ctx.beginPath();
  ctx.moveTo(road.center, 0);
  ctx.lineTo(road.center, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Start line
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(road.x + i * 44, 50, 22, 12);
  }
}

function update(dt) {
  if (finished) return;

  if (keys.accelerate) {
    player.speed += 220 * dt;
  } else {
    player.speed -= 70 * dt;
  }

  if (keys.brake) {
    player.speed -= 350 * dt;
  }

  player.speed = Math.max(0, Math.min(player.speed, player.maxSpeed));

  if (keys.left) player.x -= 240 * dt;
  if (keys.right) player.x += 240 * dt;

  player.x = Math.max(
    road.x + 35,
    Math.min(player.x, road.x + road.width - 35)
  );

  const movement = player.speed * dt;
  distance += movement;
  player.progress += movement;

  opponents.forEach((car, i) => {
    car.progress += car.speed * dt;

    // AI cars move along the road
    car.y = 100 + ((canvas.height - car.progress % 500) % 500);
    car.x = [350, 450, 550][i] + Math.sin(car.progress * 0.006) * 20;
  });

  // Three laps, each represented by 1200 distance units
  if (player.progress >= 3600) {
    finished = true;
    player.progress = 3600;
    message.textContent = "🏁 Race complete! You finished the race!";
  }

  speedText.textContent = "Speed: " + Math.round(player.speed / 2) + " km/h";
  lapText.textContent = "Lap: " +
    Math.min(3, Math.floor(player.progress / 1200) + 1) + "/3";

  const ahead = opponents.filter(c => c.progress > player.progress).length;
  positionText.textContent = "Position: " +
    ["1st", "2nd", "3rd", "4th"][3 - ahead];
}

function draw() {
  drawTrack();

  opponents.forEach(car => {
    drawCar(car.x, car.y, car.color);
  });

  drawCar(player.x, player.y, player.color);

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("YOU", player.x - 17, player.y + 52);
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000 || 0, 0.04);
  lastTime = time;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

function bindHold(buttonId, key) {
  const button = document.getElementById(buttonId);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[key] = true;
    button.setPointerCapture(e.pointerId);
  });

  const release = () => keys[key] = false;

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

bindHold("left", "left");
bindHold("right", "right");
bindHold("accelerate", "accelerate");
bindHold("brake", "brake");

document.addEventListener("keydown", e => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = true;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = true;
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") keys.accelerate = true;
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") keys.brake = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = false;
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") keys.accelerate = false;
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") keys.brake = false;
});

document.getElementById("restart").addEventListener("click", resetGame);

document.getElementById("invite").addEventListener("click", async () => {
  const inviteText = "Let's race in ROSHAN RACING ARENA!";

  try {
    await navigator.clipboard.writeText(inviteText);
    message.textContent = "Invite message copied! Online multiplayer abhi add nahi hua hai.";
  } catch {
    message.textContent = "Online multiplayer abhi add nahi hua hai.";
  }
});

resetGame();
requestAnimationFrame(loop);
