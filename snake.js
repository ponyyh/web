const COLS = 16;
const ROWS = 16;
const board = document.getElementById("snake-board");
const ctx = board.getContext("2d");
const scoreEl = document.getElementById("snake-score");
const hintEl = document.getElementById("snake-hint");
const startBtn = document.getElementById("snake-start");

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const snakeGame = {
  body: [],
  dir: DIRS.right,
  nextDir: DIRS.right,
  food: null,
  score: 0,
  timer: null,
  status: "idle",
  overlay: "准备",
};

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function opposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

function resetSnake() {
  snakeGame.body = [
    { x: 4, y: 8 },
    { x: 3, y: 8 },
    { x: 2, y: 8 },
  ];
  snakeGame.dir = DIRS.right;
  snakeGame.nextDir = DIRS.right;
  snakeGame.score = 0;
  snakeGame.status = "idle";
  snakeGame.overlay = "准备";
  scoreEl.textContent = "0";
  hintEl.textContent = "方向键或 WASD";
  startBtn.textContent = "开始";
  placeFood();
  drawSnake();
}

function placeFood() {
  const taken = new Set(snakeGame.body.map(cellKey));
  const open = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (!taken.has(`${x},${y}`)) open.push({ x, y });
    }
  }
  if (open.length === 0) {
    snakeGame.food = null;
    return false;
  }
  snakeGame.food = open[Math.floor(Math.random() * open.length)];
  return true;
}

function setHint(text) {
  hintEl.textContent = text;
}

function drawCell(cell, color, inset) {
  const size = board.width / COLS;
  const pad = inset;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(
    cell.x * size + pad,
    cell.y * size + pad,
    size - pad * 2,
    size - pad * 2,
    4
  );
  ctx.fill();
}

function drawSnake() {
  ctx.clearRect(0, 0, board.width, board.height);
  ctx.fillStyle = "#f7f3eb";
  ctx.fillRect(0, 0, board.width, board.height);

  if (snakeGame.food) drawCell(snakeGame.food, "#c45c26", 3);
  snakeGame.body.forEach((cell, index) => {
    drawCell(cell, index === 0 ? "#2f8f4e" : "#1c1915", 2);
  });

  if (snakeGame.status !== "running") {
    ctx.fillStyle = "rgba(28, 25, 21, 0.42)";
    ctx.fillRect(0, 0, board.width, board.height);
    ctx.fillStyle = "#fffdf8";
    ctx.font = "500 28px Avenir Next, PingFang SC, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(snakeGame.overlay, board.width / 2, board.height / 2);
  }
}

function stopSnake() {
  if (snakeGame.timer) {
    clearInterval(snakeGame.timer);
    snakeGame.timer = null;
  }
}

function endSnake(message) {
  snakeGame.status = "over";
  snakeGame.overlay = message === "吃满了" ? "吃满了" : "撞到了";
  stopSnake();
  startBtn.textContent = "再来";
  setHint(message === "吃满了" ? "吃满了" : `得分 ${snakeGame.score}`);
  drawSnake();
}

function tick() {
  snakeGame.dir = snakeGame.nextDir;
  const head = snakeGame.body[0];
  const next = { x: head.x + snakeGame.dir.x, y: head.y + snakeGame.dir.y };
  const hitWall = next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS;
  const hitSelf = snakeGame.body.some((cell) => sameCell(cell, next));

  if (hitWall || hitSelf) {
    endSnake(`得分 ${snakeGame.score}`);
    return;
  }

  snakeGame.body.unshift(next);
  if (snakeGame.food && sameCell(next, snakeGame.food)) {
    snakeGame.score += 1;
    scoreEl.textContent = String(snakeGame.score);
    if (!placeFood()) {
      endSnake("吃满了");
      return;
    }
    schedule();
  } else {
    snakeGame.body.pop();
  }
  drawSnake();
}

function schedule() {
  stopSnake();
  const delay = Math.max(72, 150 - snakeGame.score * 5);
  snakeGame.timer = setInterval(tick, delay);
}

function startSnake() {
  if (snakeGame.status !== "idle") resetSnake();
  snakeGame.status = "running";
  startBtn.textContent = "重开";
  setHint("方向键或 WASD");
  schedule();
  drawSnake();
}

function turn(name) {
  const next = DIRS[name];
  if (!next) return;
  if (snakeGame.status !== "running") {
    if (snakeGame.status === "over") resetSnake();
    snakeGame.dir = next;
    snakeGame.nextDir = next;
    startSnake();
    return;
  }
  if (opposite(next, snakeGame.nextDir)) return;
  snakeGame.nextDir = next;
}

startBtn.addEventListener("click", () => {
  if (snakeGame.status === "running") {
    stopSnake();
    resetSnake();
    return;
  }
  startSnake();
});

const widget = document.querySelector(".snake");
const toggleBtn = document.getElementById("snake-toggle");
const narrowScreen = window.matchMedia("(max-width: 760px)");
let pausedByCollapse = false;

function setCollapsed(collapsed) {
  widget.classList.toggle("is-collapsed", collapsed);
  document.body.classList.toggle("snake-collapsed", collapsed);
  document.body.classList.toggle("snake-open", !collapsed && narrowScreen.matches);
  toggleBtn.setAttribute("aria-expanded", String(!collapsed));
  toggleBtn.textContent = collapsed ? "贪吃蛇" : "收起";
  if (collapsed && snakeGame.status === "running") {
    stopSnake();
    pausedByCollapse = true;
  } else if (!collapsed && pausedByCollapse && snakeGame.status === "running") {
    pausedByCollapse = false;
    schedule();
    drawSnake();
  }
}

toggleBtn.addEventListener("click", () => {
  setCollapsed(!widget.classList.contains("is-collapsed"));
});

narrowScreen.addEventListener("change", () => {
  setCollapsed(narrowScreen.matches);
});

if (narrowScreen.matches) setCollapsed(true);

document.querySelector(".snake-pad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  turn(button.dataset.dir);
});

document.addEventListener("keydown", (event) => {
  const byKey = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right",
  };
  const name = byKey[event.key];
  if (!name) return;
  event.preventDefault();
  turn(name);
});

resetSnake();
