"use strict";
class Star {
  constructor(){
    this.x = Math.random() * 600;
    this.y = Math.random() * 600;
    this.r = Math.random() * 5 + 1;
  }
  
  tick(){
    this.y += this.r;
    if(this.y > 600){
      this.y -= 600;
    }
    drawCircle(this.x, this.y, this.r, "#888800");
  }
}

class Ship {
  constructor(){
    this.img = document.getElementById("ship");
    this.x = 300;
    this.y = 500;
    this.sx = 0;
    this.sy = 0;
  }
  
  move(mouseX, mouseY){
    this.sx = (mouseX - this.x) / 10;
    this.sy = (mouseY - this.y) / 10;
  }
  
  tick(){
    this.x += this.sx;
    this.y += this.sy;
    ctx.drawImage(this.img, this.x - 50, this.y - 50);
  }
  shoot(){
    bullets.push(new Bullet(this.x, this.y, 0, -25, true));
  }
}

class Enemy{
  constructor(){
    this.img = document.getElementById("enemy");
    this.x = Math.random() * 400 + 100;
    this.y = 0;
    this.sx = Math.random() * 5 - 2.5;
    this.sy = Math.random() * 15 + 15;
    this.shoot = false;
  }
  
  tick(){
    this.sy -= 1;
    this.x += this.sx;
    this.y += this.sy;
    ctx.drawImage(this.img, this.x - 50, this.y - 50);
    
    if(this.shoot == false && this.sy < 0){
      let theta = Math.atan2(ship.y - this.y, ship.x - this.x);
      let sx = Math.cos(theta) * 10;
      let sy = Math.sin(theta) * 10;
      bullets.push(new Bullet(this.x, this.y, sx, sy, false));
      this.shoot = true;
    }
  }
}

class Bullet{
  constructor(x, y, sx, sy, isShip){
    this.x = x;
    this.y = y; 
    this.sx = sx;
    this.sy = sy;
    this.isShip = isShip;
  }
  
  tick(){
    this.x += this.sx;
    this.y += this.sy;
    drawCircle(this.x, this.y, 5, this.isShip ? "blue" : "red");
  }  
}

function drawCircle(x, y, r, color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

let ctx;
let ship;
let back;
let count = 0;
let interval = 50;
let timerId;
let bullets = [];
let enemies = [];
const stars = [];

window.onload = function(){
  ctx = document.getElementById("field").getContext("2d");
  ctx.font = "32px 'Times New Roman'";
  ship = new Ship();
  back = document.getElementById("back");
  window.onpointermove = (e) => {
    ship.move(e.clientX, e.clientY);
  };
  window.onpointerdown = (e) => {
    ship.shoot();
  };
  timerId = setInterval(tick, 50);
  for(let i = 0; i < 50; i++){
    stars.push(new Star());
  }
};

function tick(){
  count++;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 600, 600);
  ctx.drawImage(back, 0, 0);
  stars.forEach( (s) => s.tick());
  ship.tick();
  if(count % interval == 0){
    enemies.push(new Enemy());
    interval = Math.max(5, interval - 5);
  }
  let gameOver = false;
  enemies.forEach((e) => {
    e.tick();
    if(dist(e, ship) < 100){
      gameOver = true;
    }
  });
  bullets.forEach((b) => {
    b.tick();
    if( !b.isShip && dist(b, ship) < 30) {
      gameOver = true;
    }
  });
  enemies = enemies.filter((e) => {
    return !bullets.some((b) => {
      return b.isShip && dist(e, b) < 50;
    });
  });
  if (gameOver){
    clearInterval(timerId);
    ctx.fillStyle = "yellow";
    ctx.fillText("GAME OVER", 200, 300);
  }
}

function dist(e0, e1) {
  return Math.sqrt(
    Math.abs(e0.x - e1.x) ** 2 + Math.abs(e0.y - e1.y) ** 2
  );
}
