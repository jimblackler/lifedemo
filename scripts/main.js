"use strict";

window.random = Math.random;

var game =
    new Game(document.getElementById("mainDiv"),
            parseInt(gup("d")) || 200, parseInt(gup("w")) || 100,
            parseInt(gup("h")) || 100, parseInt(gup("s")) || 10);

document.getElementById("pause").addEventListener("click", function (evt) {
  game.pause();
  evt.preventDefault()
});
document.getElementById("randomize").addEventListener("click", function (evt) {
  game.randomize();
  evt.preventDefault()
});


