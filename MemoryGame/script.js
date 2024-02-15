"use strict";

Array.prototype.shuffle = function(){
  let i = this.length;
  while (i){
    let j = Math.floor(Math.random() * i);
    let t = this[--i];
    this[i] = this[j];
    this[j] = t;
  }
  return this;
};

let timer = NaN;
let flipTimer = NaN;
let score = 0;
let prevCard = null;
let startTime = null;

function init(){
  let table = document.getElementById("table");
  
  let cards = [];
  for (let i = 1; i <= 10; i++){
    cards.push(i);
    cards.push(i);
  }
  cards.shuffle();
  
  for (let i = 0; i < 4; i++){
    let tr = document.createElement("tr");
    for (let j = 0; j < 5; j++){
      let td = document.createElement("td");
      td.className = "card back";
      td.number = cards[i * 5 + j];
      td.onclick = flip;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  startTime = new Date();
  // tick関数を1秒ごとに呼び出す。
  timer = setInterval(tick, 1000);
}

function tick() {
  let now = new Date();
  // now.getTime() - starTime.getTime()の結果はミリ秒単位となるので、1000で割る。
  let elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  document.getElementById("time").textContent = elapsed;
}

function flip(e){
  // すでに2枚反転済みまたは、反転済みのカードクリック時には何もしない。
  let src = e.target;
  if (flipTimer || src.textContent != ""){
    return;
  }
  
  // 表にした時の動作
  let num = src.number;
  src.className = "card";
  src.textContent = num;
  
  // 1枚目の時は、それを記録して関数を抜ける。
  if (prevCard == null){
    // 1枚目に数字を代入。
    prevCard = src;
    return;
  }
  
  // 2枚目。カード一致判定
  if (prevCard.number == num) {
    /* scoreが10になると、全部表になっていることが分かる。
    ifの論理式内でscoreを増やしているのになぜ加算されたscoreが継続するのか？
    => 論理式内での変数の変更はその後も維持されるから。変更は一時的なものと勘違いしていた。*/ 
    if (++score == 10) {
      clearInterval(timer);
    }
    prevCard = null;
    // 参考書には"裏返すタイマーを止める。"という説明があるが、setTimeoutはelseブロックで呼び出されているため必要ないのではないか？
    // clearTimeout(flipTimer);
    
    // 一致していない場合、1秒後に裏になる。
  } else {
    flipTimer = setTimeout(function(){
      src.className = "card back";
      src.textContent = "";
      prevCard.className = "card back";
      prevCard.textContent = "";
      prevCard = null;
      flipTimer = NaN;
    }, 1000);
  }
}