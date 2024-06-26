"use strict";
class Sprite{
  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.sx = 0;
    this.sy = 0;
    this.r = r;
    this.count = 0;
  }
  draw(){
    this.count += 0.5;
    let t  = Math.sin(this.count) * 0.5;
    let d = Math.atan2(this.sy, this.sx);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.r, d + t, d + Math.PI * 2 -t);
    ctx.closePath();
    ctx.fill();
  }
}

class Eat extends Sprite{
  tick(){
    this.sx += (mouse.x - this.x) / 50;
    this.sy += (mouse.y - this.y) / 50;
    this.sx *= 0.98;
    this.sy *= 0.98;
    this.x += this.sx;
    this.y += this.sy;
    this.draw();
  }
}

class Dot extends Sprite{
  constructor(){
    super(Math.random() * 500 + 50, Math.random() * 500 + 50, 10);
    this.sx = Math.random() * 10 - 5;
    this.sy = Math.random() * 10 - 5;
  }

  tick(){
    this.x = (this.x + this.sx + 600) % 600;
    this.y = (this.y + this.sy + 600) % 600;
    this.draw();
  }
}

let ctx;
let dots = [];
let life = 600;
let timerId = NaN;
let back;
const mouse = { x: 0, y: 0};
const eat = new Eat(300, 300, 30);

window.onload = function(){
  ctx = document.getElementById("field").getContext("2d");
  ctx.font = "32px 'Times New Roman'";
  window.onmousemove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };
  for (let i = 0; i < 15; i++){
    dots.push(new Dot(Math.random() * 600, Math.random() * 600, 10));
  }
  back = document.getElementById("back");
  timerId = setInterval(tick, 50);
};

function tick(){
  ctx.drawImage(back, 0, 0);
  ctx.fillStyle = "#aa0";
  eat.tick();

  dots.forEach((d) => {
    d.tick();
  });

  dots = dots.filter((d) => {
    return Math.abs(eat.x - d.x) > 30 || Math.abs(eat.y - d.y) > 30;
  });

  life -= 2.4;
  ctx.fillRect(0, 0, life, 5);
  if(life < 0){
    clearInterval(timerId);
    ctx.fillText("GAME OVER",200, 300);
  }
  if(dots.length == 0){
    clearInterval(timerId);
    ctx.fillText("CLEAR !!!", 200, 300);
  }
}