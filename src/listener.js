const EventEmitter = require('event-emitter');

export class Listener  {
  constructor(socket, config) {
    this._config = config;
    this._socket = socket;
    this._callbacks = [];
  }
  
  async establishConnection() {
    if (!this._socket || !this._config.userId || !this._config.gameId) {
      throw new Error('Missing arguments in establishConnection');
    }
    return new Promise((resolve) => {
      let roomId = `${this._config.userId}:${this._config.gameId}`;
      this._socket.timeout(5000).emit('listen', roomId, (error, response) => {
        if (error) {
          return resolve({status: 'failed', reason: 'Listen request timed out.'});
        }
        if (response.status === 'success') {
          return resolve({status: 'success'});
        } else {
          return resolve({status: 'failed', reason: response.reason});
        }
      });
    });
  }
  
  setupEventListener() {
    this._socket.on('update', this.emit.bind(this, 'update'));
    return this;
  }
}

EventEmitter(Listener.prototype);