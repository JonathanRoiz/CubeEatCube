// work on the scale of the players names next
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let entered = document.getElementById("entered");
let button = document.getElementById("button");
let nameEnter = document.getElementById("nameEnter");
let div = document.getElementById("divId");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let socket = io();

function play() {
  if (entered.value) {
    if (entered.value !== '') {
      socket.emit('initiate', entered.value);
      div.style.display = 'none';
    }
  }
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

dPressed = false;
aPressed = false;
wPressed = false;
sPressed = false;

function keyDownHandler(e) {
  if (e.keyCode == 68) {
    dPressed = true;
  }
  if (e.keyCode == 65) {
    aPressed = true;
  }
  if (e.keyCode == 87) {
    wPressed = true;
  }
  if (e.keyCode == 83) {
    sPressed = true;
  }
}
function keyUpHandler(e) {
  if (e.keyCode == 68) {
    dPressed = false;
  }
  if (e.keyCode == 65) {
    aPressed = false;
  }
  if (e.keyCode == 87) {
    wPressed = false;
  }
  if (e.keyCode == 83) {
    sPressed = false;
  }
}

plrId = "null";
name = "null";

socket.on('setId', function(id, plrName) {
  plrId = id;
  name = plrName;
});

socket.on('died', function(player) {
  if (player.id == plrId) {
    aPressed = false;
    wPressed = false;
    sPressed = false;
    dPressed = false;
    div.style.display = 'block';
    name = "null";
    plrId = "null";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});
m = 0
let colors = ['black', 'blue', 'grey', 'red', 'pink'];
let color = colors[Math.floor(Math.random() * colors.length)]
let scale = 1;
socket.on('updatepos', function(players, points, walls) {
  if (name !== "null") {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.scale(scale, scale);
    for (var i = 0; i < players.length; i++) {
      if (players[i].id == plrId) {
        ctx.translate(-players[i].x + (canvas.width / 2) / scale - players[i].size / 2, -players[i].y + (canvas.height / 2) / scale - players[i].size / 2);
        scale = 1 - (players[i].size / 1000);
        if (scale < .25) {
          scale = .25;
        }
      }
    }
    for (var i = 0; i < points.length; i++) {
      ctx.fillRect(points[i].x, points[i].y, points[i].size, points[i].size);
    }

    for (var i = 0; i < players.length; i++) {
      ctx.fillStyle = players[i].color;
      ctx.fillRect(players[i].x, players[i].y, players[i].size, players[i].size);
      ctx.fillStyle = "white";
      ctx.font = players[i].size / 2 + "px Arial";
      ctx.fillText(players[i].name, players[i].x + (players[i].size / 2), players[i].y + (players[i].size / 2));
      if (players[i].id == plrId) {
        ctx.fillStyle = "black";
        for (var v = 0; v < walls.length; v++) {
          ctx.fillRect(walls[v].x, walls[v].y, walls[v].width, walls[v].height);
        }
        ctx.font = 30 / scale + "px Arial";
        ctx.translate(players[i].x - (canvas.width / 2) / scale + players[i].size / 2, players[i].y - (canvas.height / 2) / scale + players[i].size / 2);
        ctx.fillText("Size: " + Math.floor(players[i].size), (canvas.width / 2) / scale, (canvas.height / 15) / scale);
        ctx.translate(-players[i].x + (canvas.width / 2) / scale - players[i].size / 2, -players[i].y + (canvas.height / 2) / scale - players[i].size / 2);
      }
    }

    ctx.restore();
  }
});

movement = [];

setInterval(function() {
  if (name !== "null") {
    movement[0] = wPressed;
    movement[1] = aPressed;
    movement[2] = sPressed;
    movement[3] = dPressed;
    socket.emit('updatepos', plrId, name, color, movement);
  }
}, 16.66);