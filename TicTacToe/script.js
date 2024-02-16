// "use strict";

// function init(){
//   parent = document.getElementById("board");
//   for(let i = 0; i < 3; i++){
//     let tr = document.createElement("tr");
//     for(let j = 0; j < 3; j++){
//       let td = document.createElement("td");
//       td.className = "cell";
//       td.onclick = click;
//       tr.appendChild(td);
//     }
//     parent.appendChild(tr);
//   }
// }

// let total = 1;
// function click(e){
//   if (++total % 2 == 0){
//     e.target.textContent = "〇";
//   } else {
//     e.target.textContent = "×";
//   }

// }↑自分で書いた。↓お手本
// 後置インクリメントにすることで、countの初期値が0に。

let count = 0;
function init() {
  let b = document.getElementById("board");
  for (let i = 0; i < 3; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < 3; j++) {
      let td = document.createElement("td");
      td.className = "cell";
      // id必要か？
      td.id = "cell" + i + j;
      td.onclick = clicked;
      tr.appendChild(td);
    }
    b.appendChild(tr);
  }
}
function clicked(e) {
  if (count++ % 2 == 0) {
    e.target.textContent = "〇";
  } else {
    e.target.textContent = "×";
  }
}