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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// export class Listener {
//   constructor(socket, config) {
//     this._config = config;
//     this._socket = socket;
//     this._listeners = [];
//   }
//
//   async canListen() {
//     return new Promise((resolve) => {
//       let listenId = `${this._config.userId}:${this._config.gameId}`;
//       this._socket.timeout(5000).emit('listen', listenId, (error, response) => {
//         if (error) {
//           return resolve({status: 'failed', reason: 'Listen request timed out.'});
//         }
//
//         if (response.status === 'success') {
//           this._socket.io.on('reconnect', () => {
//             console.log('reconnected...');
//             this.canListen();
//           });
//           return resolve({status: 'success'});
//         } else {
//           return resolve({status: 'failed', reason: response.reason});
//         }
//       });
//
//     });
//   }
//
//   async initializeListener() {
//     this._socket.on('update', (data) => {
//       for (let i = 0, len = this._listeners.length; i < len; ++i) {
//         this._listeners[i](data);
//       }
//     });
//     return this;
//   }
//
//   on(eventIdOrCallback) {
//     this._listeners.push(eventIdOrCallback);
//   }
// }