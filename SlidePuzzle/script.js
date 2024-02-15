"use strict";

const tiles = [];

// タイルの作成
function init(){
  let table = document.getElementById("table");
  for (let i = 0; i < 4; i++){
    let tr = document.createElement("tr");
    for (let j = 0; j < 4; j++){
      let td = document.createElement(("td"));
      let index = i * 4 + j;
      td.className = "tile";
      // indexはカスタム属性。標準属性ではない。
      td.index = index;
      td.value = index;
      td.textContent = index == 0 ? "" : index;
      // td要素がクリックされた時にclick関数を呼び出すようにする。
      td.onclick = click;
      tr.appendChild(td);
      tiles.push(td);
    }
    table.appendChild(tr);
  }
  
  /* 1000回クリックすることで、タイルをランダムに並べる。
  iを使用していないため、単に1000回繰り返すだけになっている。
  let i = e.target.index;と同じことをしている？
  */
  for (let i = 0; i < 1000; i++){
    click({ target: { index: Math.floor(Math.random() * 16) }});
  }
  
}

function click(e){
  let i = e.target.index;
  // 上にタイルがあるか
  if (i - 4 >= 0 && tiles[i -4].value == 0){
    swap(i, i -4);
    // 下にタイルがあるか
  } else if (i + 4 < 16 && tiles[i + 4].value == 0){
    swap(i, i + 4);
    // 左にタイルがあるか。左端のタイルのindexはすべて4の倍数なので、4で割り切れる場合は左にタイルがないということ。
  } else if (i % 4 != 0 && tiles[i -1].value == 0){
    swap(i, i - 1);
    // 右にタイルがあるか
  } else if (i % 4 != 3 && tiles[i + 1].value == 0){
    swap(i, i + 1);
  }
}

function swap(i, j){
  let tmp = tiles[i].value;
  tiles[i].textContent = tiles[j].textContent;
  tiles[i].value = tiles[j].value;
  tiles[j].textContent = tmp;
  tiles[j].value = tmp;
}