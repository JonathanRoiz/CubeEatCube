const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var path = require('path');
var scripts = path.join(__dirname, 'Scripts');
app.use(express.static(scripts));

function Person(id,x,y,name,color,size) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.name = name;
  this.color = color;
  this.size = size;
}

function Point(x,y,size) {
  this.x = x;
  this.y = y;
  this.size = size;
}

function Wall(x,y,width,height,name) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.name = name;
}

players = [];

points = [];

walls = [];

walls[0] = new Wall(-2050,-2050,4110,50,"wall"+0);
walls[1] = new Wall(-2050,2050,4110,50,"wall"+1);
walls[2] = new Wall(-2050,-2050,50,4150,"wall"+2);
walls[3] = new Wall(2050,-2050,50,4150,"wall"+3);

let movespeed = 4;

function isCollide(a, b) {
  if ((a) || (b)) {
  return !(
    ((a.y + (a.size)) < (b.y)) ||
    (a.y > (b.y + b.size)) ||
    ((a.x + (a.size)) < b.x) ||
    (a.x > (b.x + b.size))
  );
  };
}

function isCollideWall(a, b) {
  if ((a) && (b)) {
  return !(
    ((a.y + (a.size)) < (b.y)) ||
    (a.y > (b.y + (b.height))) ||
    ((a.x + (a.size)) < b.x) ||
    (a.x > (b.x + b.width))
  );
  };
}

for (var i = 0; i < 200; i++) {
  points[i] = new Point(Math.floor((Math.random()*3950)-1975),Math.floor((Math.random()*3950)-1975),25);
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('initiate', (name) => {
    console.log(socket.id);
    socket.emit('setId',socket.id,name);
    players[players.length] = new Person(socket.id,0,0);
  });

  socket.on('updatepos', (id,name,color,movement) => {
    for (var i = 0; i < players.length; i++) {
      for (var v = 0; v < players.length; v++) {
        if (players[i].id !== players[v].id) {
        if (isCollide(players[i],players[v])) {
          if (players[i].size > players[v].size) {
            players[i].size += (players[v].size/2);
            players[i].x -= players[v].size/2;
            players[i].y -= players[v].size/2
            io.emit("died",players[v]);
            players.splice(v,1);
            break;
          } else if (players[v].size > players[i].size) {
            players[v].size += (players[i].size/2);
            players[v].x -= players[i].size/2;
            players[v].y -= players[i].size/2
            io.emit("died",players[i]);
            players.splice(i,1);
            break;
          }
        }
        }
      }

      for (var v = 0; v < points.length; v++) {
        if (players[i]) {
        if (players[i].size) {
        if (isCollide(players[i],points[v])) {
          players[i].size += 1;
          players[i].x -= .5;
          players[i].y -= .5;
          points[v] = new Point(Math.floor((Math.random()*4000)-2000),Math.floor((Math.random()*4000)-2000),25);
        }
        }
        }
      }

      for (var v = 0; v < walls.length; v++) {
        if (isCollideWall(players[i],walls[v])) {
          if (walls[v].name == "wall0") {
            if (movement[0]) {
              players[i].y += movespeed;
            }
          }
          if (walls[v].name == "wall1") {
            if (movement[2]) {
              players[i].y -= movespeed;
            }
          }
          if (walls[v].name == "wall2") {
            if (movement[1]) {
              players[i].x += movespeed;
            }
          }
          if (walls[v].name == "wall3") {
            if (movement[3]) {
              players[i].x -= movespeed;
            }
          }
        }
      }

      if (players[i]) {
        if (players[i].id == id) {
          if (movement[0]) {
            players[i].y -= movespeed;
          }
          if (movement[1]) {
            players[i].x -= movespeed;
          }
          if (movement[2]) {
            players[i].y += movespeed;
          }
          if (movement[3]) {
            players[i].x += movespeed;
          }
          if (players[i].size) {
            players[i] = new Person(id,players[i].x,players[i].y,name,color,players[i].size);
          } else {
            players[i] = new Person(id,(Math.random() * 3500)-1750,(Math.random() * 3500)-1750,name,color,40);
          }
        }
      }
    }
  });
  socket.on('disconnect', function() {
    for (var i = 0; i < players.length; i++) {
      if (players[i]) {
      if (socket.id == players[i].id) {
        players.splice(i,1);
        console.log("player left")
      }
      }
    }
  });
});

setInterval(function() {
  players.sort( function( a , b) {
    return a.size - b.size
  });
  io.emit('updatepos',players,points,walls);
},7);

http.listen(3003, () => {
  console.log('listening on *:3003');
});