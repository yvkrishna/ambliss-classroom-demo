const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.use(express.static("tfjs_model"));
app.use(express.static("tfjs_model_v5/content/tfjs_model_v5"));
app.use(express.static("tfjs_model_v4"));
app.use(express.static("tfjs_model_v3"));
app.use(express.static("tfjs_model_v2"));
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

app.get('/load_model.json',function(req,res){
	res.sendFile("/tfjs_model_v5/content/tfjs_model_v5/model.json");
})

app.get('/model.json',function(req,res){
	res.sendFile("/tfjs_model_v5/content/tfjs_model_v5/model.json");
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||4080)
