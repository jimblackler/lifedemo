"use strict";

window.random = Math.random;

var game =
    new Game(document.getElementById("mainDiv"),
            parseInt(gup("w")) || 100,
            parseInt(gup("h")) || 100, parseInt(gup("s")) || 10);


document.getElementById("fast").addEventListener("click", function (evt) {
  game.play(1);
  evt.preventDefault()
});

document.getElementById("medium").addEventListener("click", function (evt) {
  game.play(250);
  evt.preventDefault()
});

document.getElementById("slow").addEventListener("click", function (evt) {
  game.play(1000);
  evt.preventDefault()
});

document.getElementById("stop").addEventListener("click", function (evt) {
  game.play(0);
  evt.preventDefault()
});
document.getElementById("clear").addEventListener("click", function (evt) {
  game.clear();
  evt.preventDefault()
});

document.getElementById("randomize").addEventListener("click", function (evt) {
  game.randomize();
  evt.preventDefault()
});


