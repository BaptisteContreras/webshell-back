class Authenticator {


    constructor(keys, headerName) {
      this._keys = keys.split(',');
      this._headerName = headerName;
    }


    authenticate(request) {
      let key = request.headers[this._headerName.toLowerCase()];

      return undefined !== key && this._keys.includes(key)
    }
}


module.exports = (keys, headerName) => new Authenticator(keys, headerName);
