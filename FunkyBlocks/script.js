"use strict";

let ctx;
let tiles = []; // タイル用配列
let moves = []; // 移動中タイルの配列
let mIndex = 0; // 連鎖メッセージのインデックス
let mCount = 0; // 連鎖メッセージの透明度用カウンタ
let times = []; // 残り時間画像の配列
let timer = NaN; // タイマー
let startTime = NaN; //　開始時刻
let elapsed = 0; // 経過時間
let score = 0; // スコア
let bgimage; // 背景画像
let sound; // 連鎖効果音
let mouseX = null; // マウス押下時x座標
let mouseY = null; // マウス押下時y座標
let mouseUpX = null; // マウスリリース時x座標
let mouseUpY = null; // マウスリリース時y座標
let message = [
  "",
  "good",
  "very good",
  "super",
  "wonderful!",
  "great!!",
  "amazing",
  "brilliant!",
  "excellent!!",
]; // 連鎖メッセージ

function rand(v) {
  return Math.floor(Math.random() * v); // 0～vまでの乱数（整数）を返す
}

// すべてのタイルに関数fを適用
function iterate(f) {
  for (let x = 0; x < 12; x++) {
    for (let y = 0; y < 12; y++) {
      f(x, y, tiles[x][y]); // (x,y)の座標とタイルを引数に関数f()を実行
    }
  }
}

// タイルオブジェクト
function Tile(x, y) {
  this.x = x; // 今のx座標
  this.y = y; // 今のy座標
  this.px = x; // 移動先のx座標
  this.py = y; // 移動先のy座標
  this.count = 0; // 移動量計算用カウンタ
  this.getX = function () {
    return this.x + ((this.px - this.x) * this.count) / 20; // 移動中も考慮したx座標
  };
  this.getY = function () {
    return this.y + ((this.py - this.y) * this.count) / 20; // 移動中も考慮したy座標
  };
  this.move = function (px, py, color) {
    this.px = px; // 移動先のx座標
    this.py = py; // 移動先のy座標
    this.color = color; // 移動先の色
    this.count = 20; // 座標計算用カウンタ（20カウントかけて移動）
    this.moving = true; // 移動中フラグ
    moves.push(this); // 移動中の配列に自身を追加
  };
  this.update = function () {
    if (--this.count <= 0) {
      this.moving = false; // カウンタが0になったら移動中フラグをクリア
    }
  };
}

// ゲーム初期化
function init() {
  // タイルオブジェクトの生成
  for (let x = 0; x < 12; x++) {
    tiles[x] = [];
    for (let y = 0; y < 12; y++) {
      tiles[x][y] = new Tile(x, y);
    }
  }

  // 3つ連続しないよう初期色の配置
  iterate(function (x, y, t) {
    while (true) {
      let r = rand(5);
      if (setColor(x, y, r)) {
        t.color = r;
        break;
      }
    }
  });

  // 残り時間の画像を初期化
  for (let i = 0; i <= 15; i++) {
    let t = document.createElement("img");
    t.src = "time" + i + ".png";
    times.push(t);
  }

  // Canvas初期化
  bgimage = document.getElementById("bgimage");
  let canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.textAlign = "center";

  sound = document.getElementById("sound");
  repaint();
}

// ゲーム実行開始
function go() {
  let canvas = document.getElementById("canvas");
  // イベントハンドラ登録
  canvas.onmousedown = mymousedown;
  canvas.onmouseup = mymouseup;
  canvas.addEventListener("touchstart", mymousedown);
  canvas.addEventListener("touchmove", mymousemove);
  canvas.addEventListener("touchend", mymouseup);

  startTime = new Date();
  timer = setInterval(tick, 25);

  document.body.addEventListener(
    "touchmove",
    function (event) {
      event.preventDefault(); // コンテキストメニュー非表示に
    },
    false
  );
  document.getElementById("START").style.display = "none";
  document.getElementById("bgm").play();
}

// メインループ
function tick() {
  mCount = Math.max(0, mCount - 1); // メッセージフェードアウト用にmCountを1減らす(0以上の範囲で)
  if (mCount == 0) {
    mIndex = 0; // mCountが0のとき、連鎖メッセージのインデックスを0にリセット
  }

  if (moves.length > 0) {
    // 移動中のタイル(moves)がある場合に、それらタイルを移動
    for (let i = 0; i < moves.length; i++) {
      moves[i].update();
    }
    // 移動が完了していないオブジェクトのみ抽出
    moves = moves.filter(function (t) {
      return t.count != 0;
    });
    if (moves.length == 0) {
      // 移動完了
      let s = removeTile(); // タイル消去（戻り値sは消去したタイルの個数）
      if (s > 0) {
        mIndex = Math.min(message.length - 1, mIndex + 1); // 次の連鎖メッセージへ
        mCount = 50; // メッセージ透明度カウンタを初期化
        score += s * 10 + mIndex * s * 100; // 連鎖に応じてスコア加算
        sound.pause();
        sound.currentTime = 0;
        sound.play(); // 連鎖用効果音再生
      }
      fall(); // ブロック落下
    }
  }

  elapsed = (new Date().getTime() - startTime) / 1000; // 経過時間
  if (elapsed > 69) {
    clearInterval(timer); // 70秒でゲーム終了
    timer = NaN;
  }
  repaint();
}

function setColor(x, y, c) {
  // 仮に(x,y)の座標に色cを設定した時、3つ同じ色が並んでいるか否かを返す
  let flag = true;
  if (1 < x) {
    // 左方向に3つ連鎖していないか
    let c0 = tiles[x - 2][y].color;
    let c1 = tiles[x - 1][y].color;
    flag &= !(c0 == c1 && c1 == c);
  }
  if (x < 8) {
    // 右方向に3つ連鎖していないか
    let c0 = tiles[x + 2][y].color;
    let c1 = tiles[x + 1][y].color;
    flag &= !(c0 == c1 && c1 == c);
  }
  if (1 < y) {
    // 上方向に3つ連鎖していないか
    let c0 = tiles[x][y - 2].color;
    let c1 = tiles[x][y - 1].color;
    flag &= !(c0 == c1 && c1 == c);
  }
  if (y < 8) {
    // 下方向に3つ連鎖していないか
    let c0 = tiles[x][y + 2].color;
    let c1 = tiles[x][y + 1].color;
    flag &= !(c0 == c1 && c1 == c);
  }
  return flag;
}

function mymousedown(e) {
  mouseX = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX; // マウス押下x座標
  mouseY = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY; // マウス押下y座標
}

function mymousemove(e) {
  mouseUpX = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX; // マウスリリースx座標
  mouseUpY = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY; // マウスリリースy座標
}

function mymouseup(e) {
  let sx = Math.floor((mouseX - 34) / 44); // 移動元タイルのx番号
  let sy = Math.floor((mouseY - 36) / 44); // 移動元タイルのy番号
  let nx = sx; // 移動先タイルのx番号
  let ny = sy; // 移動先タイルのy番号
  let mx = !isNaN(e.offsetX) ? e.offsetX : mouseUpX;
  let my = !isNaN(e.offsetY) ? e.offsetY : mouseUpY;
  // 押下時からリリース時のxとy方向の移動量で大きいほうに移動
  if (Math.abs(mx - mouseX) > Math.abs(my - mouseY)) {
    nx += mx - mouseX > 0 ? 1 : -1; // x方向に移動
  } else {
    ny += my - mouseY > 0 ? 1 : -1; // y方向に移動
  }

  if (nx > 11 || ny > 11 || nx < 0 || ny < 0) {
    return; // 移動先が範囲外のときは何もしない
  }
  if (tiles[sx][sy].moving || tiles[nx][ny].moving) {
    return; // 対象となるタイルが移動中のときは何もしない
  }

  // (sx,sy)と(nx,ny)のタイルの色を入れ替え
  let c = tiles[sx][sy].color;
  tiles[sx][sy].move(nx, ny, tiles[nx][ny].color);
  tiles[nx][ny].move(sx, sy, c);
  repaint();
}

function removeTile() {
  // 横方向に3つ以上連続するタイルにremoveフラグをセット
  for (let y = 0; y < 12; y++) {
    let c0 = tiles[0][y].color; // 0列目の色
    let count = 1; // 同色が連続する数
    for (let x = 1; x < 12; x++) {
      let c1 = tiles[x][y].color; // 右方向に移動しながらタイルの色を取得
      if (c0 != c1) {
        // 色が異なる場合はその色から数えなおし
        c0 = c1;
        count = 1;
      } else {
        if (++count >= 3) {
          // 連続する個数が3を超えた場合、そのタイルにremoveフラグをセット
          tiles[x - 2][y].remove = true;
          tiles[x - 1][y].remove = true;
          tiles[x - 0][y].remove = true;
        }
      }
    }
  }

  // 縦方向に3つ以上連続するタイルにremoveフラグをセット
  for (let x = 0; x < 12; x++) {
    let c0 = tiles[x][0].color; // 0行目の色
    let count = 1; // 同色が連続する数
    for (let y = 1; y < 12; y++) {
      let c1 = tiles[x][y].color; // 下方向に移動しながらタイルの色を取得
      if (c0 != c1) {
        // 色が異なる場合はその色から数えなおし
        c0 = c1;
        count = 1;
      } else {
        if (++count >= 3) {
          // 連続する個数が3を超えた場合、そのタイルにremoveフラグをセット
          tiles[x][y - 2].remove = true;
          tiles[x][y - 1].remove = true;
          tiles[x][y - 0].remove = true;
        }
      }
    }
  }
  // 削除したタイルの個数を戻り値として返す（スコア計算用）
  let removed = 0;
  iterate(function (x, y, t) {
    if (t.remove) {
      removed++;
    }
  });
  return removed;
}

// 落下処理
function fall() {
  for (let x = 0; x < 12; x++) {
    // 横方向は左から右へ
    for (let y = 11, sp = 11; y >= 0; y--, sp--) {
      // 縦方向は下から上へ(spは削除したタイルをスキップするカウンタ)
      while (sp >= 0) {
        if (tiles[x][sp].remove) {
          sp--;
        } else {
          break;
        }
      }
      if (y != sp) {
        // yとspが異なる（削除されたタイルがあった） → タイルを移動する
        let c = sp >= 0 ? tiles[x][sp].color : rand(5); // 範囲外のときは乱数で色を設定
        tiles[x][y].move(x, sp, c);
      }
    }
  }
  iterate(function (x, y, t) {
    t.remove = false; // すべてのタイルでremoveフラグをリセット
  });
}

function repaint() {
  ctx.drawImage(bgimage, 0, 0);

  // タイル描画
  let images = [block0, block1, block2, block3, block4];
  iterate(function (x, y, t) {
    if (!t.remove) {
      ctx.drawImage(
        images[t.color],
        t.getX() * 44 + 34,
        t.getY() * 44 + 36,
        42,
        42
      );
    }
  });

  // 連鎖メッセージ描画
  ctx.font = "bold 80px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, " + mCount / 50 + ")";
  ctx.fillText(message[mIndex], 300, 300);
  ctx.fillStyle = "white";

  if (isNaN(timer)) {
    ctx.fillText("FINISH", 350, 300);
  }

  // スコア
  ctx.fillStyle = "rgba(220, 133, 30, 50)";
  ctx.font = "bold 50px sans-serif";
  ctx.fillText(("0000000" + score).slice(-7), 680, 170);

  // 残り時間
  let index = Math.min(15, Math.floor(elapsed / (69 / 15)));
  ctx.drawImage(times[index], 615, 327);
}
