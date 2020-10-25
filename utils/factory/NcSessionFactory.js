const {spawn} = require("child_process");
const NcSession = require("../../model/session/NcSession");
const Events = require('../../model/enum/Events');

class NcSessionFactory {


  constructor(io, debug) {
    this._command = "nc";
    this._args = "-lnvp";
    this._io = io;
    this._debug = debug;
  }

  createAndOpenNcSession(port) {
    let process = spawn(this._command, [this._args, port]);

    process.on('error', (e) => {
      if (this._debug) {
        console.log(e);
      }

      this._io.emit(Events.NC_SESSION_TECHNICAL_ERROR, "NC technical error.");
    });

    process.stdout.on("data", data => {
      if (this._debug) {
        console.log(`stdout: ${data}`);
      }
      this._io.emit(Events.NC_SESSION_STDOUT, data.toString());
    });

    process.stderr.on('data', (data) => {
      if (this._debug) {
        console.error(`stderr: ${data}`);
      }
      this._io.emit(Events.NC_SESSION_STDERR, data.toString());
    });

    process.on('close', (code) => {
      if (this._debug) {
        console.log(`child process exited with code ${code}`);
      }
      this._io.emit(Events.NC_SESSION_CLOSE, code);
    });

    return new NcSession(process);
  }
}

module.exports = (io, debug = false) => new NcSessionFactory(io, debug);
