// 贪吃蛇核心逻辑自测（与 index.html 中逻辑等价的可测副本）
// 运行：node snake/test.js

var GRID = 20;

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

// 输入处理：反向输入被忽略，返回生效的 nextDir
function applyInput(dir, input) {
  return isOpposite(input, dir) ? dir : input;
}

function spawnFood(snake, rand) {
  var occupied = {};
  for (var i = 0; i < snake.length; i++) {
    occupied[snake[i].x + ',' + snake[i].y] = true;
  }
  var free = [];
  for (var y = 0; y < GRID; y++) {
    for (var x = 0; x < GRID; x++) {
      if (!occupied[x + ',' + y]) free.push({ x: x, y: y });
    }
  }
  return free[Math.floor(rand() * free.length)];
}

// 走一步，返回新状态 { snake, food, score, gameOver }
function step(state, rand) {
  var snake = state.snake.map(function (s) { return { x: s.x, y: s.y }; });
  var dir = state.dir;
  var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
    return { snake: snake, food: state.food, score: state.score, gameOver: true };
  }
  var ate = (head.x === state.food.x && head.y === state.food.y);
  var body = ate ? snake : snake.slice(0, snake.length - 1);
  for (var i = 0; i < body.length; i++) {
    if (body[i].x === head.x && body[i].y === head.y) {
      return { snake: snake, food: state.food, score: state.score, gameOver: true };
    }
  }
  snake.unshift(head);
  var food = state.food;
  var score = state.score;
  if (ate) {
    score++;
    food = spawnFood(snake, rand || Math.random);
  } else {
    snake.pop();
  }
  return { snake: snake, food: food, score: score, gameOver: false };
}

// ---------- 测试 ----------
var pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('PASS: ' + name); }
  else { fail++; console.log('FAIL: ' + name); }
}

// 1. 反向输入被忽略
var d = applyInput({ x: 1, y: 0 }, { x: -1, y: 0 });
check('向右时按左键无效', d.x === 1 && d.y === 0);
var d2 = applyInput({ x: 1, y: 0 }, { x: 0, y: -1 });
check('向右时按上键生效', d2.x === 0 && d2.y === -1);

// 2. 吃到食物：长度 +1、得分 +1
var s2 = {
  snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
  dir: { x: 1, y: 0 },
  food: { x: 11, y: 10 },
  score: 0
};
var r2 = step(s2, Math.random);
check('吃食物后长度 +1', r2.snake.length === 4);
check('吃食物后得分 +1', r2.score === 1);
check('吃食物后游戏未结束', r2.gameOver === false);

// 3. 撞墙判定结束
var s3 = {
  snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
  dir: { x: 1, y: 0 },
  food: { x: 0, y: 0 },
  score: 0
};
check('撞右墙结束', step(s3).gameOver === true);
var s3b = {
  snake: [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }],
  dir: { x: 0, y: -1 },
  food: { x: 0, y: 0 },
  score: 0
};
check('撞上墙结束', step(s3b).gameOver === true);

// 4. 撞自身判定结束（蛇绕圈咬到自己身体）
var s4 = {
  snake: [
    { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 },
    { x: 5, y: 6 }, { x: 4, y: 6 }
  ],
  dir: { x: 0, y: 1 }, // 头 (5,5) 向下 → (5,6) 是身体
  food: { x: 0, y: 0 },
  score: 0
};
check('撞自身结束', step(s4).gameOver === true);

// 尾格在本步会移走，追尾不算撞（边界正确性）
var s4b = {
  snake: [
    { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }
  ],
  dir: { x: 0, y: 1 }, // 头进入尾格 (5,6)，尾同时移走
  food: { x: 0, y: 0 },
  score: 0
};
check('追上正在移走的尾格不算撞', step(s4b).gameOver === false);

// 5. 食物重生永不落在蛇身上（随机 100 次）
var longSnake = [];
for (var i = 0; i < 50; i++) longSnake.push({ x: i % GRID, y: Math.floor(i / GRID) });
var ok = true;
for (var t = 0; t < 100; t++) {
  var f = spawnFood(longSnake, Math.random);
  for (var j = 0; j < longSnake.length; j++) {
    if (longSnake[j].x === f.x && longSnake[j].y === f.y) { ok = false; break; }
  }
  if (f.x < 0 || f.x >= GRID || f.y < 0 || f.y >= GRID) ok = false;
  if (!ok) break;
}
check('食物重生 100 次均不在蛇身且在棋盘内', ok);

console.log('---');
console.log('通过 ' + pass + ' / 失败 ' + fail);
process.exit(fail === 0 ? 0 : 1);
