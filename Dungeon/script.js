
"use strict";

let scroller = new Scroller(); // スクロール管理オブジェクト
Player.prototype = scroller; // scrollerをPlayerのprototypeに設定
Alien.prototype = scroller; // scrollerをAlienのprototypeに設定

const W = 31; // 迷路の幅
const H = 31; // 迷路の高さ
const GAMECLEAR = 1; // ゲームクリア状態
const GAMEOVER = 2; // ゲームオーバー状態
const maze = []; // 迷路
const player = new Player(1, 1); // 主人公
const aliens = [new Alien(W - 2, 1), new Alien(1, W - 2)]; // エイリアンの配列

let ctx; // 描画用コンテキスト
let keyCode = 0; // 押下されたキー
let status = 0; // ゲームの状態
let timer = NaN; // タイマー

// スクロール処理オブジェクト
function Scroller() {
  // 移動先(dx,dy)が設定された場合にスクロール
  this.doScroll = function () {
    if (this.dx == 0 && this.dy == 0) {
      return; // 移動先dx,dyが0のときは何もしない
    }

    if (++this.scrollCount >= 5) {
      this.x = this.x + this.dx; // x座標更新
      this.y = this.y + this.dy; // y座標更新
      this.dx = 0; // 移動先とカウンタをリセット
      this.dy = 0;
      this.scrollCount = 0;
    }
  };

  // 現在のx座標を返す
  this.getScrollX = function () {
    return this.x * 50 + this.dx * this.scrollCount * 10; // 移動中スクロール量を含むx座標
  };

  // 現在のy座標を返す
  this.getScrollY = function () {
    return this.y * 50 + this.dy * this.scrollCount * 10; // 移動中スクロール量を含むy座標
  };
}

// 主人公オブジェクトコンストラクタ
function Player(x, y) {
  this.x = x; // x座標
  this.y = y; // y座標
  this.dx = 0; // x方向移動量
  this.dy = 0; // y方向移動量
  this.dir = 0; // 向き
  this.scrollCount = 0; // スクロールカウンタ

  this.update = function () {
    this.doScroll(); // スクロール移動
    if (this.scrollCount > 0) {
      return; // スクロール中は何もしない
    }

    if (this.x == W - 2 && this.y == H - 2) {
      clearInterval(timer); // 主人公の座標が(W-2, H-2)のときゲームクリア
      status = GAMECLEAR;
      document.getElementById("bgm").pause();
      repaint();
    }

    this.dx = 0; // x方向移動量リセット
    this.dy = 0; // y方向移動量リセット
    let nx = 0; // 仮のx方向移動量
    let ny = 0; // 仮のy方向移動量
    switch (keyCode) {
      case 37:
        nx = -1;
        this.dir = 2;
        break;
      case 38:
        ny = -1;
        this.dir = 0;
        break;
      case 39:
        nx = +1;
        this.dir = 3;
        break;
      case 40:
        ny = +1;
        this.dir = 1;
        break;
    }
    if (maze[this.y + ny][this.x + nx] == 0) {
      // 移動先の座標が通路(0)のとき
      this.dx = nx; // x方向移動量を設定
      this.dy = ny; // y方向移動量を設定
    }
  };

  this.paint = function (gc, x, y, w, h) {
    let img = document.getElementById("hero" + this.dir);
    gc.drawImage(img, x, y, w, h); // 主人公描画
  };
}

// 敵オブジェクトコンストラクタ
function Alien(x, y) {
  this.x = x; // x座標
  this.y = y; // y座標
  this.dx = 0; // x方向移動量
  this.dy = 0; // y方向移動量
  this.dir = 0; // 向き
  this.scrollCount = 0; // スクロールカウンタ

  this.update = function () {
    this.doScroll(); // スクロール

    // 主人公との衝突判定（x軸、y軸の距離の差が40以下⇒衝突）
    let diffX = Math.abs(player.getScrollX() - this.getScrollX()); // x方向差分
    let diffY = Math.abs(player.getScrollY() - this.getScrollY()); // y方向差分
    if (diffX <= 40 && diffY <= 40) {
      clearInterval(timer); // 衝突時処理 -> ゲームオーバー
      status = GAMEOVER;
      document.getElementById("bgm").pause();
      repaint();
    }

    // 敵の次の移動先を乱数で求める
    let gapx = player.x - this.x; // 主人公とのx方向の差分
    let gapy = player.y - this.y; // 主人公とのy方向の差分
    switch (random(4)) {
      case 0: // x軸方向に近づく
        this.dx = gapx > 0 ? 1 : -1;
        this.dir = this.dx == -1 ? 2 : 3;
        break;
      case 1: // y軸方向に近づく
        this.dy = gapy > 0 ? 1 : -1;
        this.dir = this.dy == -1 ? 0 : 1;
        break;
      default: // 移動しない
        this.dx = 0;
        this.dy = 0;
        break;
    }
  };

  this.paint = function (gc, w, h) {
    let img = document.getElementById("alien" + this.dir);
    gc.drawImage(img, this.getScrollX(), this.getScrollY(), w, h); // 敵描画
  };
}

function random(v) {
  return Math.floor(Math.random() * v); // 0 から vまでの乱数を整数で返す
}

function init() {
  let maze = document.getElementById("maze");
  ctx = maze.getContext("2d"); // 描画コンテキスト
  ctx.font = "bold 48px sans-serif";

  createMaze(W, H); // 迷路作成
  repaint();
}

function go() {
  window.onkeydown = mykeydown;
  window.onkeyup = mykeyup;

  let maze = document.getElementById("maze"); // 迷路への参照を取得して各種イベントハンドラ登録
  maze.onmousedown = mymousedown;
  maze.onmouseup = mykeyup;
  maze.oncontextmenu = function (e) {
    e.preventDefault(); // コンテキストメニューを非表示に（タッチ対応）
  };
  maze.addEventListener("touchstart", mymousedown);
  maze.addEventListener("touchend", mykeyup);

  timer = setInterval(tick, 45);
  document.getElementById("START").style.display = "none";
  // document.getElementById("bgm").play();
}

// メインルーチン
function tick() {
  player.update();
  aliens.forEach((a) => a.update());
  repaint();
}

// 棒倒し法：幅:w、高さ:hの迷路生成
function createMaze(w, h) {
  for (let y = 0; y < h; y++) {
    maze[y] = [];
    for (let x = 0; x < w; x++) {
      // 周囲は壁(1)、それ以外は通路(0)で初期化
      maze[y][x] = x == 0 || x == w - 1 || y == 0 || y == h - 1 ? 1 : 0;
    }
  }

  for (let y = 2; y < h - 2; y += 2) {
    for (let x = 2; x < w - 2; x += 2) {
      maze[y][x] = 1; // 柱を立てる

      let dir = random(y == 2 ? 4 : 3); // 最上段(y=2)は上下左右、それ以外は下左右
      let px = x; // 今のx座標
      let py = y; // 今のy座標
      switch (dir) {
        case 0:
          py++; // 下に倒す
          break;
        case 1:
          px--; // 左に倒す
          break;
        case 2:
          px++; // 右に倒す
          break;
        case 3:
          py--; // 上に倒す
          break;
      }
      maze[py][px] = 1; // 倒れた場所も柱にする
    }
  }
}

// x, yの場所に半径rの円を色colorで描画
function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// 描画
function repaint() {
  // 背景クリア
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 900, 600);

  // クリップ領域設定
  ctx.save();
  ctx.beginPath();
  ctx.arc(300, 300, 300, 0, Math.PI * 2);
  ctx.clip();

  // 画面中央の迷路描画
  ctx.fillStyle = "brown";
  ctx.translate(6 * 50, 6 * 50);
  ctx.translate(-1 * player.getScrollX(), -1 * player.getScrollY());
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (maze[y][x] == 1) {
        ctx.fillRect(x * 50, y * 50, 50, 50); // 壁の画像描画
      }
    }
  }
  aliens.forEach((a) => a.paint(ctx, 50, 50));  // 敵を描画
  ctx.restore();

  // 画面右の地図描画
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(650, 0, 250, 600);

  ctx.save();
  ctx.translate(670, 300);
  ctx.fillStyle = "brown";
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (maze[y][x] == 1) {
        ctx.fillRect(x * 7, y * 7, 7, 7);
      }
    }
  }
  drawCircle(player.x * 7 + 3, player.y * 7 + 3, 3, "red"); // 自分を赤で
  aliens.forEach((a) => {
    drawCircle(a.x * 7 + 3, a.y * 7 + 3, 3, "purple");  // 敵を紫で
  });

  ctx.restore();

  // 上下左右移動コントローラで、押下状態の〇を描画
  ctx.drawImage(arrows, 670, 70, 200, 200);
  let ax = -100;
  let ay = -100;
  switch (keyCode) {
    case 39:
      ax = 830;
      ay = 170;
      break;
    case 40:
      ax = 770;
      ay = 230;
      break;
    case 37:
      ax = 710;
      ay = 170;
      break;
    case 38:
      ax = 770;
      ay = 120;
      break;
  }
  drawCircle(ax, ay, 30, "yellow");

  // 主人公描画とメッセージ
  player.paint(ctx, 300, 300, 50, 50);
  ctx.fillStyle = "yellow";
  if (status == GAMEOVER) {
    ctx.fillText("GAME OVER", 150, 200);
  } else if (status == GAMECLEAR) {
    ctx.fillText("GAME CLEAR", 150, 200);
  }
}

// キー＆マウス押下のイベントハンドラ
function mykeydown(e) {
  keyCode = e.keyCode;
}
function mykeyup(e) {
  keyCode = 0;
}
function mymousedown(e) {
  let mouseX = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX;
  let mouseY = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY;
  if (670 < mouseX && mouseX < 870 && 70 < mouseY && mouseY < 270) {
    mouseX -= 770;
    mouseY -= 170;
    if (Math.abs(mouseX) > Math.abs(mouseY)) {
      keyCode = mouseX < 0 ? 37 : 39;
    } else {
      keyCode = mouseY < 0 ? 38 : 40;
    }
  }
}