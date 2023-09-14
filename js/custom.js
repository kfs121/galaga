const BULLET_SPEED = 20;
const PLAYER_SPEED = 10;
const SCREEN_FRAME = 20;
const BULLET_FIRST_SIZE = 36;

const $player = document.querySelector('#player');
const $$bullets = document.querySelectorAll('li');

let bullets = [];

let playerX = 900;
let playerY = 800;

let keys = {
  'ArrowLeft':false,
  'ArrowRight':false,
  'ArrowUp':false,
  'ArrowDown':false
}

class Bullet{
  $bullet;
  x;
  y;
  size;
  isShoot = false;

  constructor($bullet, x,y){
    this.$bullet = $bullet;
    this.x = x;
    this.y = y;
  }

  moveBullet(){
    this.y -= BULLET_SPEED;
    this.size += 2;
    this.draw();
    this.removeBullet();
  }

  draw(){
    this.$bullet.style.top = this.y + 'px';
    this.$bullet.style.fontSize = this.size + 'px';
  }

  removeBullet(){
    if(this.y <= 0){
      this.$bullet.style.display = 'none';
      
      this.isShoot = false;
    }
  }

  async firstDraw(){
    this.y = playerY;
    this.x = playerX + 32;
    this.size = BULLET_FIRST_SIZE;
    this.$bullet.style.fontSize = this.size + 'px';
    this.$bullet.style.left = this.x + 'px';
    this.$bullet.style.top = this.y + 'px';
    this.$bullet.style.color = getRandomColorCode();
    this.isShoot = true;
    this.$bullet.style.display = 'block';
  }
}

$$bullets.forEach(($bullet)=>{
  bullets.push(new Bullet($bullet, 100,100));
})

document.addEventListener('keydown', (e)=>{
  keys[e.code] = true;
  if(e.code === 'Space'){
    attack();
  }
})

document.addEventListener('keyup', (e)=>{
  keys[e.code] = false;
})

setInterval(gameLoop, SCREEN_FRAME);
function gameLoop(){
  moveBullet();
  move();
}

function move(){
  if(keys.ArrowLeft){
    playerX -= PLAYER_SPEED;
  }
  if(keys.ArrowRight){
    playerX += PLAYER_SPEED;
  }
  if(keys.ArrowUp){
    playerY -= PLAYER_SPEED;
  }
  if(keys.ArrowDown){
    playerY += PLAYER_SPEED;
  }

  $player.style.left = playerX + 'px';
  $player.style.top = playerY + 'px';
}

function getRandomColorCode(){
  let colorCode;
  colorCode = `#${getRandomNumber(0,10)}${getRandomNumber(0,10)}${getRandomNumber(0,10)}`;
  return colorCode;
}

function getRandomNumber(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function attack(){
  let bullet;
  for(let i = 0; i < bullets.length; i++){
    if(bullets[i].isShoot === false){
      bullet = bullets[i];
      break;
    }
  }
  bullet.firstDraw();
}

function moveBullet(){
  bullets.forEach((bullet)=>{
    if(bullet.isShoot === true){
      bullet.moveBullet();
    }
  });
}


