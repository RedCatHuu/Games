class Jumper{
  constructor(){
    this.y = 200;
    this.sy = 0;
    this.index = 0;
    this.images = [];
    this.landed = true;
    for( let i = 0; i < 8; i++){
      this.images.push(document.getElementById("stick" + i));
    }
  }
  jump(power){
    if(this.landed){
      this.y -= 10;
      this.sy = -power;
    }
  }
  paint(){
    if(!this.landed){
      this.index = (this.index + 1) % this.images.length;
      this.sy += 0.3;
      this.y += this.sy;
    }
    ctx.drawImage(this.images[this.index], 100, this.y);
    this.landed = false;
    boxes.forEach((b) => {
      let foot = this.y + 150;
      let right = b.x + b.w;
      if(b.x < 150 && 150 < right && b.y <= foot && foot <= b.y + 40){
        this.landed = true;
        this.y = b.y - 150;
      }
    });
  }
}

class Box{
  constructor(x, y, w){
    this.x = x;
    this.y= y;
    this.w = w;
  }
  paint(){
    ctx.fillStyle = 'rgba(50, 0, 0, 0.5)';
    ctx.fillRect(this.x, this.y, this.w, 600);
  }
}

let ctx;
let jumper;
let power = 0;
let timerId = NaN;
let isMouseDown = false;
let boxes = [new Box(0, 350, 300)];
let back;

window.onload = function(){
  jumper = new Jumper(100, 200);
  for(let x = 400; x < 3000;){
    let w = Math.random() * 200 + 100;
    let y = Math.random() * 300 + 300;
    boxes.push(new Box(x, y ,w));
    x += w + Math.random() * 200 + 100;
  }

  ctx = document.getElementById("field").getContext("2d");
  ctx.font = "72px 'sans-serif'";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5;
  back = document.getElementById("back");

  window.onpointerdown = () => {
    isMouseDown = true;
  };
  window.onpointerup = () => {
    isMouseDown = false;
    jumper.jump(power / 20);
  };

  timerId = setInterval(tick, 50);
};

function tick(){
  power = isMouseDown ? Math.min(power + 10, 600) : 0;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 800, 600);
  ctx.drawImage(back, 0, 0);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, power, 15);
  jumper.paint();
  boxes.forEach((b) => {
    if(!jumper.landed){
      b.x -= 5;
    }
    b.paint();
  });
  if(jumper.y > 500){
    clearInterval(timerId);
    ctx.fillText("Game Over", 150, 300);
  }
  if(boxes[boxes.length - 1].x < 0){
    clearInterval(timerId);
    ctx.fillText("CLEAR !!!", 150, 300);
  }
}