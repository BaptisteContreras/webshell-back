const SocketSession = require('../model/session/SocketSession');
const Events = require('../model/enum/Events');

class SessionManager {


  constructor(io, debug) {
    this._pool = {};
    this._ncFactory = require('../utils/factory/NcSessionFactory')(io, debug);
    this._lastId = 1;
    this._debug = debug;
    this._io = io;
  }

  openSession(socket, port) {
    if (this.isPortAlreadyInUse(port)) {
      this._io.emit(Events.PORT_ALREADY_IN_USE, port);

      return null;
    }
    let sid =this._generateUniqueSessionId(socket)
    let session = new SocketSession(sid, socket, this._ncFactory.createAndOpenNcSession(port, sid), port);
    this._pool[sid] = session;

    return session;
  }

  getSocketSession(id, socket, bypassSocketOwnerCheck = false) {
    let session = this._pool[id];
    console.log(this._pool)
    if (!session) {
      this._io.emit(Events.SESSION_NOT_FOUND, id);

      return null;
    }

    if (session.socket.id !== socket.id && !bypassSocketOwnerCheck) {
      this._io.emit(Events.SESSION_NOT_OWNED, id);

      return null;
    }

    return session;
  }

  isPortAlreadyInUse(port) {
    return Object.entries(this._pool).filter((el) => el.port === port).length >= 1;
  }


  _generateUniqueSessionId(socket) {
    return socket.id + "-" + (this._lastId++);
  }

  deleteSession(id, socket) {
    let session = this.getSocketSession(id, socket, true);

    if (session) {
      session.disconnect();
      this._pool = Object.entries(this._pool).filter((i, el) => el.id !== id);

      return true;
    }

    return false;

  }


}


module.exports = (io, debug = false) => new SessionManager(io, debug);
