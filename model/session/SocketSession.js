class SocketSession {


  constructor(id, socket, ncSession, port) {
    this._socket = socket;
    this._ncSession = ncSession;
    this._port = port;
    this._id = id;
  }


  get socket() {
    return this._socket;
  }

  get ncSession() {
    return this._ncSession;
  }

  get port() {
    return this._port;
  }


  get id() {
    return this._id;
  }
}

module.exports = SocketSession;
