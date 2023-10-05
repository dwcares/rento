var express = require('express')
var app = express()
app.use(express.static('public'))
var http = require('http').Server(app)
const io = require("socket.io")(http)
let latestTemp = 0;
let latestVol = 0;
let latestSongInfo = {};
let latestPlaybackStatus = '';

var port = process.env.PORT || 3000

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

var Particle = require('particle-api-js')
var particle = new Particle()
var token

particle.login({ username: process.env.PARTICLE_USER, password: process.env.PARTICLE_PASSWORD }).then(
  function (data) {
    token = data.body.access_token

    particle.getEventStream({ deviceId: 'mine', auth: token }).then(function (stream) {
      stream.on('songInfo', function (msg) {
        latestSongInfo = JSON.parse(msg.data)
        io.emit('songInfo', latestSongInfo)
      })

      stream.on('volume', function (msg) {
        latestVol = msg.data
        io.emit('volume', latestVol)
      })

      stream.on('playbackStatus', function (msg) {
        latestPlaybackStatus = msg.data
        io.emit('playbackStatus', latestPlaybackStatus)

      })

      stream.on('probeTempF', function (msg) {
        latestTemp = msg.data
        io.emit('probeTempF', latestTemp)
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

io.on('connection', async (socket) => {
  console.log('new connection: ' + io.engine.clientsCount);
  io.emit('probeTempF', latestTemp)

  if (token && process.env.PARTICLE_DEVICE_ID) {
    particle.callFunction({ deviceId: process.env.PARTICLE_DEVICE_ID, name: 'getPlaybackStatus', argument: '', auth: token })
    particle.callFunction({ deviceId: process.env.PARTICLE_DEVICE_ID, name: 'getVolume', argument: '', auth: token })
    particle.callFunction({ deviceId: process.env.PARTICLE_DEVICE_ID, name: 'getSongInfo', argument: '', auth: token })
  }
    
  socket.on('disconnect', function(msg) {
    console.log('user disconnected: ' + io.engine.clientsCount);
  });      
})


http.listen(port, function () {
  console.log('listening on *: ' + port)
})
