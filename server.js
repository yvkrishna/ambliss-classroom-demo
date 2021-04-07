const express = require('express')
const app = express()
const bodyParser = require("body-parser");
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
app.set('view engine', 'ejs')
app.use(express.static("tfjs_model"));
app.use(express.static("tfjs_model_v5/content/tfjs_model_v5"));
app.use(express.static("tfjs_model_v4"));
app.use(express.static("tfjs_model_v3"));
app.use(express.static("tfjs_model_v2"));
app.use(express.static('public/images'));
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.render('home');
  // res.redirect(`/meeting/${uuidV4()}`)
})

app.get('/meeting/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

app.get('/create_meet', (req, res) => {
  res.redirect(`/meeting/${uuidV4()}`)
})

app.get('/get_meet_link', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
   res.send({m_l:uuidV4()});
})

app.post('/join_meeting', (req, res) => {
  var meet_link = req.body.meeting_link;
  res.redirect(`/meeting/${meet_link}`)
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

server.listen(process.env.PORT||4080, function(){
  console.log("server started")
})
