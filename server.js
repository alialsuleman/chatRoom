const express = require('express');
const path = require('path')
const { ExpressPeerServer } = require('peer')
var cors = require('cors')


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


// port which server runnig in 
const port = process.env.PORT || 3000;


const peer = ExpressPeerServer(server, {
  debug: true
});


app.use('/peerjs', peer);
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors())



app
  .get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'))
  })
  .post('/', (req, res) => {
    if (req.body.room_name) {
      console.log(req.body.room_name);
      return res.redirect(`/${req.body.room_name}`)
    } else {

      return res.redirect('/')
    }

  });



app.get('/:room', (req, res) => {
  res.render('index', { RoomId: req.params.room });
});




io.on("connection", (socket) => {
  socket.on('newUser', (id, room) => {

    socket.join(room);
    socket.to(room).emit('userJoined', id);

    socket.on('disconnect', () => {
      socket.to(room).emit('userDisconnect', id);
    })

    socket.on('error', (err) => {
      console.log("handled error");
      console.log(err);
    });

  })
})


app.use((err, req, res, next) => {
  res.json({
    status: 'error',
    text: err.text
  })
})


server.listen(port, () => {
  console.log("Server running on port : " + port);
})
