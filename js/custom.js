const $player = document.querySelector('#player');
const $$bullets = document.querySelectorAll('li');

let bullets = [];

class Bullet{
  $bullet;
  x;
  y;
  isShoot = false;

  constructor($bullet, x,y){
    this.$bullet = $bullet;
    this.x = x;
    this.y = y;
  }

  moveBullet(){
    this.y -= 10;
    this.draw();
    this.removeBullet();
  }

  draw(){
    this.$bullet.style.top = this.y + 'px';
  }

  removeBullet(){
    if(this.y <= 0){
      this.$bullet.style.display = 'none';
      this.isShoot = false;
    }
  }

  firstDraw(){
    this.$bullet.style.display = 'block';
    this.y = playerY;
    this.x = playerX + 45;
    this.$bullet.style.left = this.x + 'px';
    this.$bullet.style.top = this.y + 'px';
    this.$bullet.style.color = getRandomColorCode();
    this.isShoot = true;
  }
}

let playerX = 0;
let playerY = 0;

let keys = {
  'ArrowLeft':false,
  'ArrowRight':false,
  'ArrowUp':false,
  'ArrowDown':false
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

setInterval(gameLoop, 20);
function gameLoop(){
  moveBullet();
  move();
}

function move(){
  if(keys.ArrowLeft){
    playerX -= 10;
  }
  if(keys.ArrowRight){
    playerX += 10;
  }
  if(keys.ArrowUp){
    playerY -= 10;
  }
  if(keys.ArrowDown){
    playerY += 10;
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
