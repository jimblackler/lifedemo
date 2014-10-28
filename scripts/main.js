"use strict";

window.random = Math.random;

var width = 0 | gup("width", 230);
var height = 0 | gup("height", 120);
var size = 0 | gup("size", 6);
var colors = gup("colors", 1) == 1;
var auto = gup("auto", 1) == 1;

var game =
    new Game(document.getElementById("mainDiv"), document.getElementById("fps"),
        width, height, size, colors);

var stopLink = document.getElementById("stop");

if (auto) {
  game.randomize();
  game.play(1);
} else {
  stopLink.className = "hidden";
}

function setShapeName() {
  document.getElementById("shapeName").textContent = game.getShapeName();
  game.setPreviewPic(document.getElementById("previewPic"));
}

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


var switchMode = document.getElementById("switchMode");
if (colors)
  switchMode.textContent = "Black/White";
else
  switchMode.textContent = "Color mode";
switchMode.href = window.location.pathname + "?width=" + width +
    "&height=" + height + "&size=" + size + "&colors=" + (colors ? 0 : 1) +
    "&auto=" + auto;

setShapeName();
