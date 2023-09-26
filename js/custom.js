const BULLET_SPEED = 20;
const PLAYER_SPEED = 10;
const SCREEN_FRAME = 20;

const PLAYER_WIDTH = 100;
const PLAYER_HEIGHT = 100;

const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 800;

const ENEMY_WIDTH = 70;
const ENEMY_HEIGHT = 70;

const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 24;

const $player = document.querySelector("#player");
const $$bullets = document.querySelectorAll("#bullets li");
const $board = document.querySelector("#board");
const $$enemies = document.querySelectorAll("#enemies li");



let bullets = [];
let enemies = [];

let playerX = 550;
let playerY = 600;
let playerSpeed = PLAYER_SPEED;

let enemySpeed = 5;
let enemyTimeCount = 1000;
let enemyTimeCountOffset = 100;

let isGameEnd = false;



let keys = {
  KeyA: false,
  KeyD: false,
  KeyW: false,
  KeyS: false,
  Space: false,
};

// class
class XY{
  x;
  y;
  constructor(x,y){
    this.x= x;
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

  constructor($enemy,x = 0, y = 0) {
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
    this.$enemy.style.display = "none";
    this.isLive = false;
  }

  activeEnemy(x, y,speed){
    this.x = x;
    this.y = y;
    this.speed = speed;
    const dx = playerX - this.x - ENEMY_WIDTH/2
    const dy = playerY - this.y - ENEMY_HEIGHT/2

    let angleDegrees = getAngleDegrees(dx, dy);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;
    this.offsetX = vx;
    this.offsetY = vy;
    this.$enemy.style.transform = angleDegrees;
    this.$enemy.style.left = this.x + 'px';
    this.$enemy.style.top = this.y + 'px';
    this.$enemy.style.display = 'block';
    this.isLive = true;
  }

  moveEnemy() {
    if(!this.isLive) return false;
    this.x += this.offsetX;
    this.y += this.offsetY;
    this.draw();
    if(this.playerCollide()){
      isGameEnd = true;
    }
    if(this.checkToEnd()){
      this.activeEnemy(this.x, this.y,this.speed);
    }
  }

  playerCollide(){
    
    if (playerX + PLAYER_WIDTH> this.x && playerX  < this.x + ENEMY_WIDTH) {
      if (
        playerY < this.y + ENEMY_HEIGHT &&
        playerY + PLAYER_HEIGHT > this.y
      ) {
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
    this.y = playerY + 38;
    this.x = playerX + 47;
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
for(let i = -1; i < 10; i++){
  enemiesRespawnAreas.push(new XY(-(ENEMY_WIDTH + 30), i* (ENEMY_WIDTH + 30)));
}
for(let i = -1; i < 10; i++){
  enemiesRespawnAreas.push(new XY(BOARD_WIDTH + (ENEMY_WIDTH + 30), i* (30 + ENEMY_WIDTH)));
}
for(let i = 0; i < 12;i++){
  enemiesRespawnAreas.push(new XY(i*(ENEMY_WIDTH + 30), -(ENEMY_WIDTH + 30)));
}
for(let i = 0; i < 12;i++){
  enemiesRespawnAreas.push(new XY(i*(ENEMY_WIDTH + 30), -(ENEMY_WIDTH + 30)));
}

$$bullets.forEach(($bullet) => {
  bullets.push(new Bullet($bullet, 100, 100));
});



document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

$board.addEventListener("mousemove", (e) => {
  const dx = e.offsetX - playerX - PLAYER_WIDTH / 2;
  const dy = e.offsetY - playerY - PLAYER_HEIGHT / 2;

  $player.style.transform = getAngleDegrees(dx, dy);
});

$board.addEventListener("click", (e) => {
  const dx = e.offsetX - playerX - PLAYER_WIDTH / 2;
  const dy = e.offsetY - playerY - PLAYER_HEIGHT / 2;

  attack(dx, dy);
});

$$enemies.forEach(($enemy) => {
  const enemy = new Enemy($enemy);
  enemies.push(enemy);
});

// Game Loop
const gameInterval = setInterval(gameLoop, SCREEN_FRAME);
function gameLoop() {
  if(isGameEnd){
    gameEnd();
  }
  moveEnemy();
  moveBullet();
  move();
}
// Game Loop End



// 총알처럼 적이 이동. let enemySpeed 로 적이 생성될 때 마다 높아짐. 
// let enemyTimeCount는 적이 생성될 때마다 줄어듬.
// Enemy Active

let enemyRespawnInterval = setInterval(intervalFunction, enemyTimeCount); 


// Enemy Active End



// function
function intervalFunction() {
  let enemy;
  for(let i = 0; i < enemies.length; i++){
    if(!enemies[i].isLive){
      enemy = enemies[i];
      break;
    }
  }
  let xy = enemiesRespawnAreas[getRandomNumber(0, enemiesRespawnAreas.length - 1)];
  enemy.activeEnemy(xy.x, xy.y, enemySpeed+= 0.1);
  enemyTimeCount = enemyTimeCount - enemyTimeCountOffset <= 300? 300 : enemyTimeCount - enemyTimeCountOffset;
  
  clearInterval(enemyRespawnInterval);
  enemyRespawnInterval = setInterval(intervalFunction, enemyTimeCount);
}

function gameEnd(){
  clearInterval(gameInterval);
  clearInterval(enemyRespawnInterval);
  console.log('you died.');
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
