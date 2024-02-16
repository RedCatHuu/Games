"use strict";

const data = [
  // マップデータ。0:通路, 1:目的地, 2:荷物, 6:壁
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,2,0,0,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,0,0,2,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,0,0,2,0,0,2,0,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,0,6,0,6,6,6,0,6,6,6,6,6,6,6,6,6,6],
  [6,0,0,0,6,0,6,6,6,0,6,6,6,6,0,0,1,1,6,6],
  [6,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,1,1,6,6],
  [6,6,6,6,6,0,6,6,6,6,0,6,0,6,0,0,1,1,6,6],
  [6,6,6,6,6,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  ];
  let gc = null;
  let px = 12;
  let py = 8;
  
  function init(){
    gc = document.getElementById("soko").getContext("2d");
    // キーボードが押されたら、mykeydownを実行
    window.onkeydown = mykeydown;
    repaint();
  }
  
  function mykeydown(e){
    let dx0 = px;
    let dy0 = py;
    let dx1 = px;
    let dy1 = py;
    switch (e.keyCode){
      case 37:
        dx0--;
        dx1 -= 2;
        break;
      case 38:
        dy0--;
        dy1 -= 2;
        break;
      case 39:
        dx0++;
        dx1 += 2;
        break;
      case 40:
        dy0++;
        dy1 += 2;
        break;
    }
    
    if ((data[dy0][dx0] & 0x2) == 0){
      px = dx0;
      py = dy0;
    } else if ((data[dy0][dx0] & 0x6) == 2){
      if ((data[dy1][dx1] & 0x2) == 0){
        data[dy0][dx0] ^= 2;
        data[dy1][dx1] |= 2;
        px = dx0;
        py = dy0;
      }
    }
    repaint();
  }
  
  function repaint(){
    gc.fillStyle = "black";
    gc.fillRect(0, 0, 800, 440);
    
    for (let y = 0; y < data.length; y++){
      for (let x =0; x < data[y].length; x++){
        if (data[y][x] & 0x1){
          gc.drawImage(imgGoal, x * 40, y * 40, 40, 40);
        }
        if (data[y][x] & 0x2){
          gc.drawImage(imgLuggage, x * 40, y * 40, 40, 40);
        }
        if (data[y][x] == 6){
          gc.drawImage(imgWall, x * 40, y * 40, 40, 40);
        }
      }
    }
    gc.drawImage(imgWorker, px * 40, py * 40, 40, 40);
  }