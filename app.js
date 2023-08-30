var express = require('express')
var app = express()
app.use(express.static('public'))
var http = require('http').Server(app)
const io = require("socket.io")(http)
let latestVal = 0;

var port = process.env.PORT || 3000

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

var Particle = require('particle-api-js')
var particle = new Particle()
var token

io.on('connection', (socket) => {
  console.log('new connection: ' + io.engine.clientsCount);
  io.emit('probeTempF', latestVal)
    
  socket.on('disconnect', function(msg) {
    console.log('user disconnected: ' + io.engine.clientsCount);
  });      
})

particle.login({ username: process.env.PARTICLE_USER, password: process.env.PARTICLE_PASSWORD }).then(
  function (data) {
    token = data.body.access_token

    particle.getEventStream({ deviceId: 'mine', auth: token }).then(function (stream) {
      stream.on('probeTempF', function (msg) {
        latestVal = msg.data
        io.emit('probeTempF', msg.data)
      })
    }, function () {
      console.log('error getting event stream')
    })
  },
  function (err) {
    console.log('Could not log in.', err)
  }
).catch((er) => {
  console.log('particle login error')
})

http.listen(port, function () {
  console.log('listening on *: ' + port)
})
