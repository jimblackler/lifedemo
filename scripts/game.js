"use strict";

var Game = function (mainDiv, width, height, gridSize) {
  this.width = width;
  this.height = height;
  this.gridSize = gridSize;
  this.canvas = document.createElement("canvas");
  this.canvas.width = width * gridSize;
  this.canvas.height = height * gridSize;
  var context = this.canvas.getContext('2d');
  context.fillStyle = "White";
  context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  this.canvas.addEventListener("mousedown", function (evt) {
    this.mouseDown = true;
    var baseX = 0 | evt.layerX / gridSize;
    var baseY = 0 | evt.layerY / gridSize;
    var shapeName = "glider";
    var shape = shapes[shapeName];
    for (var idx = 0; idx != shape.length; idx++) {
      this.setSquare(baseX + shape[idx][0], baseY + shape[idx][1], true);
    }
    evt.preventDefault();
  }.bind(this));
  this.canvas.addEventListener("mouseup", function (evt) {
    this.mouseDown = false;
    evt.preventDefault();
  }.bind(this));
  this.canvas.addEventListener("mousemove", function (evt) {
    if (!this.mouseDown)
      return;
    this.setSquare(0 | evt.layerX / gridSize, 0 | evt.layerY / gridSize, false);
    evt.preventDefault();
  }.bind(this));

  mainDiv.appendChild(this.canvas);
  this.grid = new Int8Array(width * height);
  this.neighbours = new Int8Array(width * height);
  this.nextToConsider = new Int32Array(width * height);
  for (var idx = 0; idx !== this.nextToConsider.length; idx++)
    this.nextToConsider[idx] = -2;
  this.firstToConsider = -1;
};

Game.prototype.adjustNeighbours = function (x, y, delta) {
  var adjust = function (x, y, delta) {
    if (x < 0)
      x += this.width;
    else if (x >= this.width)
      x -= this.width;
    if (y < 0)
      y += this.height;
    else if (y >= this.height)
      y -= this.height;
    var key = y * this.width + x;
    this.neighbours[key] += delta;
    if (this.nextToConsider[key] == -2) {
      this.nextToConsider[key] = this.firstToConsider;
      this.firstToConsider = key;
    }
  }.bind(this);

  adjust(x - 1, y - 1, delta);
  adjust(x, y - 1, delta);
  adjust(x + 1, y - 1, delta);
  adjust(x - 1, y, delta);
  adjust(x + 1, y, delta);
  adjust(x - 1, y + 1, delta);
  adjust(x, y + 1, delta);
  adjust(x + 1, y + 1, delta);
};


Game.prototype.process = function () {
  this.timeoutId = null;

  // Record original details.
  var toSet = [];
  var toClear = [];
  var key = this.firstToConsider;
  while (key !== -1) {
    var neighbours = this.neighbours[key];
    if (this.grid[key]) {
      // Any live cell with fewer than two live neighbours dies, as if caused
      // by under-population.
      // Any live cell with more than three live neighbours dies, as if by
      // overcrowding.
      if (neighbours < 2 || neighbours > 3)
        toClear.push(key);
    } else {
      // Any dead cell with exactly three live neighbours becomes a live cell,
      // as if by reproduction.
      if (neighbours === 3)
        toSet.push(key);
    }
    var nextKey = this.nextToConsider[key];
    this.nextToConsider[key] = -2;
    key = nextKey;
  }
  this.firstToConsider = -1;

  var context = this.canvas.getContext('2d');
  context.save();

  context.scale(this.gridSize, this.gridSize);

  for (var idx = 0; idx !== toClear.length; idx++) {
    var key = toClear[idx];
    var x = key % this.width;
    var y = 0 | key / this.width;
    this.grid[key] = false;
    context.fillStyle = "White";
    context.fillRect(x, y, 1, 1);
    this.adjustNeighbours(x, y, -1);
  }
  for (var idx = 0; idx !== toSet.length; idx++) {
    var key = toSet[idx];
    var x = key % this.width;
    var y = 0 | key / this.width;
    this.grid[key] = true;
    context.fillStyle = "Black";
    context.fillRect(x, y, 1, 1);
    this.adjustNeighbours(x, y, +1);
  }

  context.restore();

  this.timeoutId = window.setTimeout(this.process.bind(this), this.delay);
};

Game.prototype.play = function (delay) {

  if (this.timeoutId) {
    window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
  this.delay = delay;
  if (this.delay)
    this.process();
};

Game.prototype.clear = function () {
  for (var y = 0; y !== this.height; y++) {
    for (var x = 0; x !== this.width; x++) {
      var key = y * this.width + x;
      if (this.grid[key]) {
        this.setSquare(x, y, true);
      }
    }
  }
};

Game.prototype.randomize = function () {
  for (var y = 0; y !== this.height; y++) {
    for (var x = 0; x !== this.width; x++) {
      if (Math.random() < .5) {
        this.setSquare(x, y, true);
      }
    }
  }
};

Game.prototype.setSquare = function (x, y, toggle) {

  var context = this.canvas.getContext('2d');
  context.save();
  context.scale(this.gridSize, this.gridSize);
  var key = y * this.width + x;
  if (this.grid[key]) {
    if (toggle) {
      this.grid[key] = false;
      context.fillStyle = "White";
      context.fillRect(x, y, 1, 1);
      this.adjustNeighbours(x, y, -1);
    }
  } else {
    this.grid[key] = true;
    context.fillStyle = "Blue";
    context.fillRect(x, y, 1, 1);
    this.adjustNeighbours(x, y, 1);
  }
  if (this.nextToConsider[key] === -2) {
    this.nextToConsider[key] = this.firstToConsider;
    this.firstToConsider = key;
  }
  context.restore();
};
