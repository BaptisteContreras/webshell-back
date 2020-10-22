const {spawn} = require("child_process");
const NcSession = require("../../model/session/NcSession");

class NcSessionFactory {


  constructor(io) {
    this._command = "nc";
    this._args = "–lvp";
    this._io = io;
  }

  createAndOpenNcSession(port) {
    let process = spawn(this._command, [this._args, port]);

    process.on('error', (e) => {
      console.log(e);

      this._io.emit("NcSessionTechnicalError", "NC technical error.");
    });

    process.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      this._io.emit("NcSessionStdout", data);
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      this._io.emit("NcSessionStderr", JSON.stringify(data));
    });

    process.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      this._io.emit("NcSessionClose", code);
    });

    return new NcSession(process);
  }
}

module.exports = (io) => new NcSessionFactory(io);
