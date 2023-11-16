// 이제 점수화, 하면됨.
// 오브젝트 크기 변경 시 css,
// 스크립트에서는 WIDTH와 HEIGHT,
const $player = document.querySelector("#player");
const $$bullets = document.querySelectorAll("#bullets li");
const $board = document.querySelector("#board");
const $$enemies = document.querySelectorAll("#enemies li");
const $score = document.querySelector("#score");
const $retryBtn = document.querySelector('#retry');
const $startBtn = document.getElementById("start-btn");
const $gameMenuScreen = document.getElementById("game-menu-screen");
const $gameOverScreen = document.querySelector(".game-over-screen");
const $resultScore = $gameOverScreen.querySelector("#result-score");
const $resultForm = document.querySelector(".game-over-screen form");
const $sendBtn = $resultForm.querySelector("input[type=submit]");
const $rankingAddMsg = document.querySelector(".add-success");
const $addRankingLoading = $gameOverScreen.querySelector(".add-ranking-loading");


const BULLET_SPEED = 20;
const PLAYER_SPEED = 10;
const SCREEN_FRAME = 20;

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 800;

const ENEMY_WIDTH = 70;
const ENEMY_HEIGHT = 70;

const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 24;


let bullets = [];
let enemies = [];



let playerX;
let playerY;
let playerSpeed = PLAYER_SPEED;

let enemySpeed;;
let enemyTimeCount;
let enemyTimeCountOffset = 100;

let isGameEnd;

let score;

let scorePride;

let keys;

// class
class XY {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// 적의 생성을 setTimeOut을 재귀함수로 사용하면 좋을 듯?
// 적은 새로 생성될 때마다 더 높은 속도
// 적의 이동은 무작위에서 생성되었다가, bullet이 마우스를 바라보는 것 처럼 player를 바라보고
// bullet처럼 일직선으로 이동.
class Enemy {
  x;
  y;
  offsetX;
  offsetY;
  isLive = false;
  $enemy;
  speed;

  constructor($enemy, x = 0, y = 0) {
    this.$enemy = $enemy;
    this.x = x;
    this.y = y;
  }

  draw() {
    this.$enemy.style.top = this.y + "px";
    this.$enemy.style.left = this.x + "px";
  }

  bulletCollide(bullet) {
    if (bullet.x > this.x && bullet.x < this.x + ENEMY_WIDTH) {
      if (
        bullet.y < this.y + ENEMY_HEIGHT &&
        bullet.y + BULLET_HEIGHT > this.y
      ) {
        return true;
      }
    }
  }

  removeEnemy() {
    this.isLive = false;
    this.$enemy.style.display = "none";
  }

  activeEnemy(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    const dx = playerX - this.x - ENEMY_WIDTH / 2;
    const dy = playerY - this.y - ENEMY_HEIGHT / 2;

    let angleDegrees = getAngleDegrees(dx, dy);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;
    this.offsetX = vx;
    this.offsetY = vy;
    this.$enemy.style.transform = angleDegrees;
    this.$enemy.style.left = this.x + "px";
    this.$enemy.style.top = this.y + "px";
    this.$enemy.style.display = "block";
    this.isLive = true;
  }

  moveEnemy() {
    if (!this.isLive) return false;
    this.x += this.offsetX;
    this.y += this.offsetY;
    this.draw();
    if (this.playerCollide()) {
      isGameEnd = true;
    }
    if (this.checkToEnd()) {
      this.activeEnemy(this.x, this.y, enemySpeed);
    }
  }

  playerCollide() {
    if (playerX + PLAYER_WIDTH > this.x && playerX < this.x + ENEMY_WIDTH) {
      if (playerY < this.y + ENEMY_HEIGHT && playerY + PLAYER_HEIGHT > this.y) {
        return true;
      }
    }
  }

  checkToEnd() {
    if (
      this.y <= 0 ||
      this.y >= BOARD_HEIGHT ||
      this.x <= 0 ||
      this.x >= BOARD_WIDTH
    )
      return true;
  }
}

// vx, vy를 필드로 추가하고, firstDraw할 때 인자로 주고, 그 때 받음.
// 그 다음 이동을 그 계산한 값으로 x,y 로 하고 draw
// 처음만 계산하고 그거를 필드에 offsetX, offsetY로 해 뒀다가 계속 그 정도만
// 이동하면 될 듯?
class Bullet {
  $bullet;
  x;
  y;
  offsetX;
  offsetY;
  isShoot = false;

  constructor($bullet, x, y) {
    this.$bullet = $bullet;
    this.x = x;
    this.y = y;
  }

  moveBullet() {
    this.y += this.offsetY;
    this.x += this.offsetX;
    this.draw();
    if (this.checkToEnd()) {
      this.removeBullet();
    }
  }

  draw() {
    this.$bullet.style.top = this.y + "px";
    this.$bullet.style.left = this.x + "px";
  }

  removeBullet() {
    this.$bullet.style.display = "none";
    this.isShoot = false;
  }

  checkToEnd() {
    if (
      this.y <= 0 ||
      this.y >= BOARD_HEIGHT ||
      this.x <= 0 ||
      this.x >= BOARD_WIDTH
    )
      return true;
  }

  firstDraw(dx, dy) {
    const angleDegrees = getAngleDegrees(dx, dy);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * BULLET_SPEED;
    const vy = (dy / distance) * BULLET_SPEED;
    this.y = playerY + PLAYER_HEIGHT / 2 - BULLET_HEIGHT / 2;
    this.x = playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2;
    this.offsetX = vx;
    this.offsetY = vy;

    this.$bullet.style.transform = angleDegrees;
    this.$bullet.style.left = this.x + "px";
    this.$bullet.style.top = this.y + "px";
    this.isShoot = true;
    this.$bullet.style.display = "block";
  }
}



const enemiesRespawnAreas = [];
for (let i = -1; i < BOARD_HEIGHT / 100 + 2; i++) {
  enemiesRespawnAreas.push(new XY(-(ENEMY_WIDTH + 30), i * (ENEMY_WIDTH + 30)));
}
for (let i = -1; i < BOARD_HEIGHT / 100 + 2; i++) {
  enemiesRespawnAreas.push(
    new XY(BOARD_WIDTH + (ENEMY_WIDTH + 30), i * (30 + ENEMY_WIDTH))
  );
}
for (let i = 0; i < BOARD_WIDTH / 100 + 2; i++) {
  enemiesRespawnAreas.push(new XY(i * (ENEMY_WIDTH + 30), -(ENEMY_WIDTH + 30)));
}
for (let i = 0; i < BOARD_WIDTH / 100 + 2; i++) {
  enemiesRespawnAreas.push(new XY(i * (ENEMY_WIDTH + 30), -(ENEMY_WIDTH + 30)));
}

$$bullets.forEach(($bullet) => {
  bullets.push(new Bullet($bullet, 100, 100));
});


const moveKeyDownEvent = (e) =>{
  if(e.code === 'Space'){
    e.preventDefault();
  }
  keys[e.code] = true;
}

const moveKeyUpEvent = (e) => {
  keys[e.code] = false;
}

$startBtn.addEventListener('click', ()=>{
  $gameMenuScreen.style.display = 'none';
  initGame();
})

$retryBtn.addEventListener('click', ()=>{
  $gameMenuScreen.style.display = 'none';
  initGame();
})

const mouseMoveEvent = (e) => {
  const dx = e.offsetX - playerX - PLAYER_WIDTH / 2;
  const dy = e.offsetY - playerY - PLAYER_HEIGHT / 2;

  $player.style.transform = getAngleDegrees(dx, dy);
};

const clickEvent = (e) => {
  const dx = e.offsetX - playerX - PLAYER_WIDTH / 2;
  const dy = e.offsetY - playerY - PLAYER_HEIGHT / 2;

  attack(dx, dy);
};
// $board.addEventListener("click", clickEvent);

$$enemies.forEach(($enemy) => {
  const enemy = new Enemy($enemy);
  enemies.push(enemy);
});

// Game Loop
let gameInterval;
function gameLoop() {
  if (isGameEnd) {
    gameEnd();
  }
  moveEnemy();
  moveBullet();
  move();
  score++;
  $score.textContent = score;
  changeScoreStyle();
}
// Game Loop End



// 총알처럼 적이 이동. let enemySpeed 로 적이 생성될 때 마다 높아짐.
// let enemyTimeCount는 적이 생성될 때마다 줄어듬.
// Enemy Active

let enemyRespawnInterval;
// Enemy Active End


//initGame();

// function
function intervalFunction() {
  let enemy;
  for (let i = 0; i < enemies.length; i++) {
    if (!enemies[i].isLive) {
      enemy = enemies[i];
      break;
    }
  }
  let xy =
    enemiesRespawnAreas[getRandomNumber(0, enemiesRespawnAreas.length - 1)];
  enemy.activeEnemy(xy.x, xy.y, (enemySpeed += 0.1));
  enemyTimeCount =
    enemyTimeCount - enemyTimeCountOffset <= 300
      ? 300
      : enemyTimeCount - enemyTimeCountOffset;

  clearInterval(enemyRespawnInterval);
  enemyRespawnInterval = setInterval(intervalFunction, enemyTimeCount);
}

function gameEnd() {
  clearInterval(gameInterval);
  clearInterval(enemyRespawnInterval);
  $board.removeEventListener("mousemove", mouseMoveEvent);
  $board.removeEventListener("click", clickEvent);
  document.removeEventListener("keydown", moveKeyDownEvent);
  document.removeEventListener("keyup", moveKeyUpEvent);
  $resultScore.textContent = score;
  $gameMenuScreen.style.display = 'block';
  $gameOverScreen.style.display = 'flex';

  console.log("you died.");
}

function getAngleDegrees(x, y) {
  const angle = Math.atan2(y, x);
  return `rotate(${angle * (180 / Math.PI) + 90}deg)`;
}

function move() {
  if (keys.KeyA) {
    if (!(playerX - playerSpeed < 0)) playerX -= playerSpeed;
  }
  if (keys.KeyD) {
    if (!(playerX + playerSpeed > BOARD_WIDTH - PLAYER_WIDTH))
      playerX += playerSpeed;
  }
  if (keys.KeyW) {
    if (!(playerY - playerSpeed < 0)) playerY -= playerSpeed;
  }
  if (keys.KeyS) {
    if (!(playerY + playerSpeed > BOARD_HEIGHT - PLAYER_HEIGHT))
      playerY += playerSpeed;
  }
  if (keys.Space) {
    playerSpeed = PLAYER_SPEED / 2;
  } else {
    playerSpeed = PLAYER_SPEED;
  }

  $player.style.left = playerX + "px";
  $player.style.top = playerY + "px";
}

function getRandomColorCode() {
  let colorCode;
  colorCode = `#${getRandomNumber(0, 10)}${getRandomNumber(
    0,
    10
  )}${getRandomNumber(0, 10)}`;
  return colorCode;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function attack(dx, dy) {
  let bullet;
  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i].isShoot === false) {
      bullet = bullets[i];
      break;
    }
  }
  bullet.firstDraw(dx, dy);
}

function moveBullet() {
  bullets.forEach((bullet) => {
    if (bullet.isShoot === true) {
      bullet.moveBullet();
      enemies.forEach((enemy) => {
        if (enemy.bulletCollide(bullet) && enemy.isLive) {
          score += enemy.speed * 10;
          $score.textContent = score;
          enemy.removeEnemy();
          bullet.removeBullet();
        }
      });
    }
  });
}

function moveEnemy() {
  enemies.forEach((enemy) => {
    enemy.moveEnemy();
  });
}

function changeScoreStyle() {
  let updatedScorePride = getSocorePride();
  if (updatedScorePride === scorePride) return;
  scorePride = updatedScorePride;
  switch (scorePride) {
    case 0:
      $score.style.color = "black";
      $score.style.transform = "scale(1)";
      break;
    case 1:
      $score.style.color = "red";
      $score.style.transform = "scale(1.2)";
      break;
    case 2:
      $score.style.color = "purple";
      $score.style.transform = "scale(1.5)";
      break;
    case 3:
      $score.style.color = "orange";
      $score.style.transform = "scale(1.7)";
      break;
    case 4:
      $score.style.color = "#7092be";
      $score.style.transform = "scale(2)";
      break;
    case 5:
      $score.style.color = "gray";
      $score.style.transform = "scale(2.3)";
      break;
    default:
      $score.style.color = "black";
      $score.style.transform = "scale(1)";
      break;
  }
}

function getSocorePride() {
  if (score < 1000) {
    return 0;
  } else if (score < 2000) {
    return 1;
  } else if (score < 3000) {
    return 2;
  } else if (score < 4000) {
    return 3;
  } else if (score < 5000) {
    return 4;
  } else {
    return 5;
  }
}

function initGame() {
  playerX = BOARD_WIDTH/2 - PLAYER_WIDTH/2;
  playerY = 600;

  enemySpeed = 5;
  enemyTimeCount = 1000;

  isGameEnd = false;

  score = 0;

  scorePride = 0;
  $score.style.color = "black";
  $score.style.transform = "scale(1)";
  keys = {
    KeyA: false,
    KeyD: false,
    KeyW: false,
    KeyS: false,
    Space: false,
  };

  enemies.forEach(enemy=>{
    enemy.removeEnemy();
  })
  bullets.forEach(bullet=>{
    bullet.removeBullet();
  })
  clearInterval(gameInterval);
  clearInterval(enemyRespawnInterval);
  clearInterval(moveKeyDownEvent);
  clearInterval(moveKeyUpEvent);

  document.addEventListener("keydown", moveKeyDownEvent);
  document.addEventListener("keyup", moveKeyUpEvent);
  
  $board.addEventListener("mousemove", mouseMoveEvent);
  $board.addEventListener("click", clickEvent);

  gameInterval = setInterval(gameLoop, SCREEN_FRAME);

  enemyRespawnInterval = setInterval(intervalFunction, enemyTimeCount);
  $rankingAddMsg.style.display = 'none';
  $resultForm.querySelector("input[type=submit]").disabled = false;
  $addRankingLoading.style.display = 'none';
}



$sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.target.disabled = true;
  $addRankingLoading.style.display = 'block';

  fetch("https://space-war-server.onrender.com/ranking/add", {
    method:"post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name:$resultForm.name.value,
      message:$resultForm.message.value,
      score:score
    })
  })
  .then((res)=>{
    $addRankingLoading.style.display = 'none';
    $rankingAddMsg.style.display = 'block';
    score = 0;
    $resultForm.name.value = "";
    $resultForm.message.value = "";
  })
  .catch(err=>{
    console.log(err);
  })
});




