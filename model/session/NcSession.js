const kill  = require('tree-kill');

class NcSession {


  constructor(process) {
    this._process = process;
  }

  sendToNc(data) {
    this._process.stdin.write(data);
  }

  disconnect() {
    kill(this._process.pid, 'SIGKILL')
  }
}


module.exports = NcSession;
