const SocketSession = require('../model/session/SocketSession');

class SessionManager {


  constructor(io) {
    this._pool = {};
    this._ncFactory = require('../utils/factory/NcSessionFactory')(io);
    this._lastId = 1;
  }

  openSession(socket, port) {
    let session = new SocketSession(this._generateUniqueSessionId(socket),socket, this._ncFactory.createAndOpenNcSession(port), port);
    this._pool[socket.id] = session;

    return session;
  }

  getSocketSession(socket) {
    return this._pool[socket.id];
  }

  _generateUniqueSessionId(socket){
    return socket.id+"-"+(this._lastId++);
  }
}


module.exports = (io) => new SessionManager(io);
