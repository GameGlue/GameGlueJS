

class GameGlueListener {
  constructor(socket) {
    this._socket = socket;
  }
  
  listen(gameId, eventId) {
    this._socket.emit('listen', )
  }
  
}