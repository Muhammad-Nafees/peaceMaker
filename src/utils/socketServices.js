import io from 'socket.io-client';

// const SOCKET_URL = 'http://192.168.43.168:8000'
// const SOCKET_URL = 'http://yameenyousuf.com';
const SOCKET_URL = 'http://3.136.70.129' // <- prod

class WSService {
  initializeSocket = async (userid) => {

    try {
      this.socket = io(SOCKET_URL, { extraHeaders: { userid } });

      this.socket.on('connect', data => {
        console.log('=== socket connected ====');
      });

      this.socket.on('disconnect', data => {
        console.log('=== socket disconnected ====');
      });

      this.socket.on('error', data => {
        console.log('socekt error', data);
      });
    } catch (error) {
      console.log('scoket is not inialized', error);
    }
  };

  emit(event, data = {}) {
    this.socket.emit(event, data);
  }

  on(event, cb) {
    this.socket.on(event, cb);
  }

  removeListener(listenerName, listener) {
    this.socket.off(listenerName, listener);
  }

  removeAllListener(listenerName) {
    if (listenerName) {
      this.socket.removeAllListeners(listenerName);
    } else {
      this.socket.removeAllListeners();
    }
  }

  disconnect() {
    this.socket.disconnect();
  }
}

const socketServcies = new WSService();

export default socketServcies;
