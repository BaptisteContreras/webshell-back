var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
require('dotenv').config();
const port = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG || false;
const authenticator = require('./services/Authenticator')(process.env.AUTH_KEYS, process.env.AUTH_HEADER_NAME);
const sessionManager = require('./services/SessionManager')(io, DEBUG);
const Events = require('./model/enum/Events');

const portRegex = "^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$"; // https://www.regextester.com/104146

io.on('connection', (socket) => {
  socket.on('startSession', (data) => {
    try {
      data = JSON.parse(data);
      if (!data.port) {
        socket.emit(Events.START_SESSION_RESPONSE_VALIDATION_ERROR, "Missing argument 'port'.");

        return;
      }

      if (("" + data.port).match(portRegex)) {
        let session = sessionManager.openSession(socket, data.port);
        if (DEBUG) {
          console.log(session);
        }
        if (session) {
          socket.emit(Events.START_SESSION_SUCCESS, {sessionId: session.id, port : data.port});
        }

      } else {
        socket.emit(Events.START_SESSION_RESPONSE_VALIDATION_ERROR, "This is not a correct port number.");
      }
    } catch (e) {
      if (DEBUG) {
        console.log(e);
      }
      socket.emit(Events.START_SESSION_RESPONSE_TECHNICAL_ERROR, "The server encountered a technical error while initializing the connexion.");
    }
  });


  socket.on('sendCommand', (data) => {
    try {
      data = JSON.parse(data);

      if (!data.command) {
        socket.emit(Events.SEND_COMMAND_VALIDATION_ERROR, "You must specify a command.");
      }

      if (!data.sessionId) {
        socket.emit(Events.SEND_COMMAND_VALIDATION_ERROR, "You must specify a sessionId.");
      }

      let session = sessionManager.getSocketSession(data.sessionId, socket);

      if (session) {
        session.sendCommand(data.command);

        socket.emit(Events.SEND_COMMAND_OK, data)
      }

    } catch (e) {
      if (DEBUG) {
        console.log(e);
      }

      socket.emit(Events.SEND_COMMAND_TECHNICAL_ERROR, "The server encountered a technical. The command has not been sent");
    }
  });

  socket.on('deleteSession', (data) => {
    try {
      data = JSON.parse(data);

      if (!data.sessionId) {
        socket.emit(Events.DELETE_SESSION_VALIDATION_ERROR, "You must specify a sessionId.");
      }

      let deleted = sessionManager.deleteSession(data.sessionId, socket);

      if (deleted) {
        socket.emit(Events.DELETE_SESSION_SUCCESS, data)
      }else{
        socket.emit(Events.DELETE_SESSION_ERROR, data)
      }

    } catch (e) {
      if (DEBUG) {
        console.log(e);
      }

      socket.emit(Events.DELETE_SESSION_TECHNICAL_ERROR, "The server encountered a technical. The session has not been deleted.");
    }
  });

  socket.on('disconnect', (data) => {
    console.log("DECO")
    sessionManager.deleteAllSession(socket)
  })


});

http.listen(port, () => {
  console.log('listening on *: '+port);
});
