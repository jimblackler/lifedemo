"use strict";

var SATURATION = 0.92;
var VALUE = 0.88;

var Game = function (mainDiv, width, height, gridSize, colors) {
  this.width = width;
  this.height = height;
  this.gridSize = gridSize;
  this.colors = colors;
  var totalMargin = 0 | gridSize * 0.20;
  this.gridMarginTL = 0 | totalMargin / 2;
  this.drawGridSize = gridSize - totalMargin;
  this.canvas = document.createElement("canvas");
  this.canvas.width = width * gridSize;
  this.canvas.height = height * gridSize;
  this.canvas.id = "playArea";
  this.shapeNumber = 0;


  this.canvas.addEventListener("mousedown", function (evt) {
    this.mouseDown = true;
    var x = evt.pageX - this.canvas.offsetLeft;
    var y = evt.pageY - this.canvas.offsetTop;

    this.placedHue = Math.random();
    this.placedShapeX = 0 | x / gridSize;
    this.placedShapeY = 0 | y / gridSize;
    this.placeShape();
    evt.preventDefault();
  }.bind(this));
  this.canvas.addEventListener("mouseup", function (evt) {
    this.mouseDown = false;
    evt.preventDefault();
  }.bind(this));
  this.canvas.addEventListener("mousemove", function (evt) {
    if (!this.mouseDown)
      return;
    var x = evt.pageX - this.canvas.offsetLeft;
    var y = evt.pageY - this.canvas.offsetTop;
    this.setSquare(0 | x / gridSize, 0 | y / gridSize, false, this.placedHue);
    evt.preventDefault();
  }.bind(this));

  mainDiv.appendChild(this.canvas);
  this.grid = new Int8Array(width * height);
  if (this.colors)
    this.hues = new Float32Array(width * height);
  this.neighbours = new Int8Array(width * height);
  this.nextToConsider = new Int32Array(width * height);
  for (var idx = 0; idx !== this.nextToConsider.length; idx++)
    this.nextToConsider[idx] = -2;
  this.firstToConsider = -1;
  this.clear();
};

Game.prototype.placeShape = function() {
  var shape = shapes[this.shapeNumber].squares;

  for (var idx = 0; idx != shape.length; idx++) {
    this.setSquare(this.placedShapeX + shape[idx][0],
            this.placedShapeY + shape[idx][1], true, this.placedHue);
  }
};

Game.prototype.getNewHue = function(key) {
  var hueX = 0;
  var hueY = 0;
  var processHue = function (x, y) {
    if (x < 0)
      x += this.width;
    else if (x >= this.width)
      x -= this.width;
    if (y < 0)
      y += this.height;
    else if (y >= this.height)
      y -= this.height;
    var key = y * this.width + x;
    if (!this.grid[key])
      return;
    var hue = this.hues[key] * Math.PI * 2;
    hueX += Math.cos(hue);
    hueY += Math.sin(hue);
  }.bind(this);
  var x = key % this.width;
  var y = 0 | key / this.width;

  processHue(x - 1, y - 1);
  processHue(x, y - 1);
  processHue(x + 1, y - 1);
  processHue(x - 1, y);
  processHue(x + 1, y);
  processHue(x - 1, y + 1);
  processHue(x, y + 1);
  processHue(x + 1, y + 1);

  if (hueX == 0 && hueY == 0)
    return Math.random();

  var hue = Math.atan2(hueY, hueX) / (Math.PI * 2);
  if (hue < 0)
   return hue + 1;
  return hue;
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
  delete this.placedShapeX;
  // Record original details.
  var toSet = [];
  var toClear = [];
  var newHues = [];
  var key = this.firstToConsider;
  while (key !== -1) {
    var nextKey = this.nextToConsider[key];
    this.nextToConsider[key] = -2;
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
      if (neighbours === 3) {
        toSet.push(key);
        if (this.colors)
          newHues.push(this.getNewHue(key));
      }
    }
    key = nextKey;
  }
  this.firstToConsider = -1;

  var context = this.canvas.getContext('2d');

  context.fillStyle = "White";
  for (var idx = 0; idx !== toClear.length; idx++) {
    var key = toClear[idx];
    if (this.colors) {
      var oldHue = this.hues[key];
      context.fillStyle = hsvToRgbString(oldHue, 0.06, 1);
    }
    var x = key % this.width;
    var y = 0 | key / this.width;
    this.grid[key] = false;
    context.fillRect(x * this.gridSize, y * this.gridSize,
        this.gridSize, this.gridSize);
    this.adjustNeighbours(x, y, -1);
  }

  context.fillStyle = "Black";
  for (var idx = 0; idx !== toSet.length; idx++) {
    var key = toSet[idx];
    var x = key % this.width;
    var y = 0 | key / this.width;

    if (this.colors) {
      var hue = newHues[idx];
      context.fillStyle = hsvToRgbString(hue, SATURATION, VALUE);
      this.hues[key] = hue;
    }
    this.grid[key] = true;
    context.fillRect(x * this.gridSize + this.gridMarginTL,
            y * this.gridSize + this.gridMarginTL,
            this.drawGridSize, this.drawGridSize);
    this.adjustNeighbours(x, y, +1);
  }

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
        this.setSquare(x, y, true, 0);
      }
    }
  }
  var context = this.canvas.getContext('2d');
  context.fillStyle = "White";
  context.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

Game.prototype.randomize = function () {
  for (var y = 0; y !== this.height; y++) {
    for (var x = 0; x !== this.width; x++) {
      if (Math.random() < 0.5) {
        var hue = Math.random();
        this.setSquare(x, y, true, hue);
      }
    }
  }
};

Game.prototype.setSquare = function (x, y, toggle, hue) {
  var context = this.canvas.getContext('2d');
  var key = y * this.width + x;
  if (this.grid[key]) {
    if (toggle) {
      this.grid[key] = false;
      context.fillStyle = "White";
      context.fillRect(x * this.gridSize, y * this.gridSize,
          this.gridSize, this.gridSize);
      this.adjustNeighbours(x, y, -1);
    }
  } else {

    this.grid[key] = true;
    if (this.colors) {
      this.hues[key] = hue;
      context.fillStyle = hsvToRgbString(hue, SATURATION, VALUE);
    } else {
      context.fillStyle = "Black";
    }
    context.fillRect(x * this.gridSize + this.gridMarginTL,
            y * this.gridSize + this.gridMarginTL,
        this.drawGridSize, this.drawGridSize);
    this.adjustNeighbours(x, y, 1);
  }
  if (this.nextToConsider[key] === -2) {
    this.nextToConsider[key] = this.firstToConsider;
    this.firstToConsider = key;
  }

};

Game.prototype.adjustShape = function(delta) {
  if (typeof this.placedShapeX !== "undefined")
    this.placeShape();
  this.shapeNumber += delta;
  while (this.shapeNumber >= shapes.length)
    this.shapeNumber -= shapes.length;
  while (this.shapeNumber < 0)
    this.shapeNumber += shapes.length;
  if (typeof this.placedShapeX !== "undefined")
    this.placeShape();
};

Game.prototype.getShapeName = function() {
  return shapes[this.shapeNumber].name;
};

Game.prototype.setPreviewPic = function(canvas) {
  var context = canvas.getContext('2d');
  context.fillStyle = "White";
  context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  context.fillStyle = "Black";
  var shape = shapes[this.shapeNumber].squares;
  var baseX = 0 | canvas.width / 2;
  var baseY = 0 | canvas.height / 2;
  for (var idx = 0; idx != shape.length; idx++) {
    context.fillRect(baseX + shape[idx][0], baseY + shape[idx][1], 1, 1);
  }

};
