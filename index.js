var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
require('dotenv').config();
const port = process.env.PORT || 3000;
const authenticator = require('./services/Authenticator')(process.env.AUTH_KEYS, process.env.AUTH_HEADER_NAME);
const sessionManager = require('./services/SessionManager')(io);

const portRegex = "^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$"; // https://www.regextester.com/104146

io.on('connection', (socket) => {
  socket.on('startSession', (data) => {
    try{
      data = JSON.parse(data)
      if (!data.port){
        socket.emit("startSessionResponseValidationError", "Missing argument 'port'.")

        return;
      }

      if ((""+data.port).match(portRegex)){
        let session = sessionManager.openSession(socket, data.port);
        console.log(session);
        socket.emit("startSessionSuccess", session.id())
      }else{
        socket.emit("startSessionResponseValidationError", "This is not a correct port number.")
      }
    }catch (e) {
      console.log(e)
      socket.emit("startSessionResponseTechnicalError", "The server encountered a technical error while initializing the connexion.")
    }
  })


  socket.on('sendCommand', (socket) => {

  })

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
