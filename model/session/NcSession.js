class NcSession {


  constructor(process) {
    this._process = process;
    this.sendToNc("dir\n");
  }

  sendToNc(data) {
    this._process.stdin.write(data);
  }

  disconnect() {
    this._process.disconnect();
  }
}


module.exports = NcSession;
