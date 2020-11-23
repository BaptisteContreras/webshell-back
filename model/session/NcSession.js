const kill  = require('tree-kill');
const os = require('os');

class NcSession {


  constructor(process) {
    this._process = process;
  }

  sendToNc(data) {
    this._process.stdin.write(data+os.EOL);
  }

  disconnect() {
    kill(this._process.pid, 'SIGKILL')
  }
}


module.exports = NcSession;
