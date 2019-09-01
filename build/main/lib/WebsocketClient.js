"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const pako_1 = __importDefault(require("pako"));
const crypto_1 = __importDefault(require("crypto"));
const crc_32_1 = __importDefault(require("crc-32"));
class V3WebsocketClient extends events_1.EventEmitter {
    constructor(websocketURI = 'wss://real.okex.com:8443/ws/v3') {
        super();
        this.websocketUri = websocketURI;
    }
    connect(options = {}) {
        if (this.socket) {
            this.socket.close();
        }
        this.socket = new ws_1.default(this.websocketUri, options);
        console.log(`Connecting to ${this.websocketUri}`);
        this.socket.on('open', () => this.onOpen());
        this.socket.on('close', (code, reason) => this.onClose(code, reason));
        this.socket.on('message', data => this.onMessage(data));
    }
    login(apiKey, apiSecret, passphrase) {
        const timestamp = Date.now() / 1000;
        const str = timestamp + 'GET/users/self/verify';
        const hmac = crypto_1.default.createHmac('sha256', apiSecret);
        const request = JSON.stringify({
            op: 'login',
            args: [
                apiKey,
                passphrase,
                timestamp.toString(),
                hmac.update(str).digest('base64')
            ]
        });
        this.socket.send(request);
    }
    subscribe(...args) {
        this.send({ op: 'subscribe', args });
    }
    unsubscribe(...args) {
        this.send({ op: 'unsubscribe', args });
    }
    checksum(data) {
        if (data == null || data == undefined) {
            return false;
        }
        let result = data;
        if (typeof data === 'string') {
            result = JSON.parse(data);
        }
        if (result.data && result.data.length > 0) {
            const item = result.data[0];
            const buff = [];
            for (let i = 0; i < 25; i++) {
                if (item.bids[i]) {
                    const bid = item.bids[i];
                    buff.push(bid[0]);
                    buff.push(bid[1]);
                }
                if (item.asks[i]) {
                    const ask = item.asks[i];
                    buff.push(ask[0]);
                    buff.push(ask[1]);
                }
            }
            const checksum = crc_32_1.default.str(buff.join(':'));
            if (checksum === item.checksum) {
                return true;
            }
        }
        return false;
    }
    send(messageObject) {
        if (!this.socket)
            throw Error('socket is not open');
        this.socket.send(JSON.stringify(messageObject));
    }
    onOpen() {
        console.log(`Connected to ${this.websocketUri}`);
        this.initTimer();
        this.emit('open');
    }
    initTimer() {
        this.interval = setInterval(() => {
            if (this.socket) {
                this.socket.send('ping');
            }
        }, 5000);
    }
    resetTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.initTimer();
        }
    }
    onMessage(data) {
        this.resetTimer();
        if (!(typeof data === 'string')) {
            data = pako_1.default.inflateRaw(data, { to: 'string' });
        }
        if (data === 'pong') {
            return;
        }
        this.emit('message', data);
    }
    onClose(code, reason) {
        console.log(`Websocket connection is closed.code=${code},reason=${reason}`);
        this.socket = undefined;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.emit('close');
    }
    close() {
        if (this.socket) {
            console.log(`Closing websocket connection...`);
            this.socket.close();
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
            this.socket = undefined;
        }
    }
}
exports.V3WebsocketClient = V3WebsocketClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2Vic29ja2V0Q2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9XZWJzb2NrZXRDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpQkFBaUI7QUFDakIsbUNBQXNDO0FBQ3RDLDRDQUEyQjtBQUMzQixnREFBd0I7QUFDeEIsb0RBQTRCO0FBQzVCLG9EQUEyQjtBQUUzQixNQUFhLGlCQUFrQixTQUFRLHFCQUFZO0lBS2pELFlBQVksWUFBWSxHQUFHLGdDQUFnQztRQUN6RCxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ25DLENBQUM7SUFFRCxPQUFPLENBQUMsT0FBTyxHQUFHLEVBQUU7UUFDbEIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxZQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxD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