class NcSession {


  constructor(process) {
    this._process = process;
  }

  sendToNc(data) {
    this._process.write(data)
  }
}


module.exports = NcSession;
