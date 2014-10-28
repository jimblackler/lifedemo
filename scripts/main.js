"use strict";

window.random = Math.random;

var game =
    new Game(document.getElementById("mainDiv"),
            0 | gup("w", 100), 0 | gup("h", 100), 0 | gup("s", 10),
            0 | gup("m", 1));

function setShapeName() {
  document.getElementById("shapeName").textContent = game.getShapeName();
  game.setPreviewPic(document.getElementById("previewPic"));
}

var stopLink = document.getElementById("stop");
stopLink.className = "hidden";

document.getElementById("fast").addEventListener("click", function (evt) {
  stopLink.className = "visible";
  game.play(1);
  evt.preventDefault()
});

document.getElementById("medium").addEventListener("click", function (evt) {
  stopLink.className = "visible";
  game.play(250);
  evt.preventDefault()
});

document.getElementById("slow").addEventListener("click", function (evt) {
  stopLink.className = "visible";
  game.play(1000);
  evt.preventDefault()
});

stopLink.addEventListener("click", function (evt) {
  stopLink.className = "hidden";
  game.play(0);
  evt.preventDefault()
});

document.getElementById("clear").addEventListener("click", function (evt) {
  game.play(0);
  stopLink.className = "hidden";
  game.clear();
  evt.preventDefault()
});

document.getElementById("randomize").addEventListener("click", function (evt) {
  game.randomize();
  evt.preventDefault()
});

document.getElementById("previous").addEventListener("click", function (evt) {
  game.adjustShape(-1);
  setShapeName();
  evt.preventDefault()
});

document.getElementById("next").addEventListener("click", function (evt) {
  game.adjustShape(+1);
  setShapeName();
  evt.preventDefault()
});

setShapeName();
