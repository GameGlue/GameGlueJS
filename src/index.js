import { GameGlueAuth } from './auth';
import { io } from "socket.io-client";
import { Listener} from "./listener";

const GAME_IDS = {
  'msfs': true
};

class GameGlue extends GameGlueAuth  {
  constructor(cfg) {
    super(cfg);
    this._socket = false;
    this._eventListeners = [];
  }
  
  async auth() {
    await this.authenticate();
    if (await this.isAuthenticated()) {
      await this.initialize();
    }
  }
  
  async initialize() {
    return new Promise((resolve) => {
      const token = this.getAccessToken();
      this._socket = io('https://socks.gameglue.gg', {
        transports: ['websocket'],
        auth: {
          token
        }
      });
      this._socket.on('connect', () => {
        resolve();
      });
      this.onTokenRefreshed(this.updateSocketAuth);
    });
  }
  
  updateSocketAuth(authToken) {
    this._socket.auth.token = authToken;
  }
  
  async createListener(config) {
    if (!config) throw new Error('Not a valid listener config');
    if (!config.gameId || !GAME_IDS[config.gameId]) throw new Error('Not a valid Game ID');
    if (!config.userId) throw new Error('User ID not supplied');
    
    const listener = new Listener(this._socket, config);
    const establishConnectionResponse = await listener.establishConnection();
    this._socket.io.on('reconnect_attempt', (d) => {
      console.log('Refresh Attempt');
      this.updateSocketAuth(this.getAccessToken());
    });
    this._socket.io.on('reconnect', () => {
      listener.establishConnection();
    });
    
    if (establishConnectionResponse.status !== 'success') {
      throw new Error(`There was a problem setting up the listener. Reason: ${establishConnectionResponse.reason}`);
    }
    
    return listener.setupEventListener();
  }
}

if (window) {
  window.GameGlue = GameGlue;
}