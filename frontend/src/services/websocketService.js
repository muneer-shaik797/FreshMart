import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnectedCallback) {
    if (this.client && this.connected) {
      if (onConnectedCallback) onConnectedCallback();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str) => {
        // debug logging can be enabled when needed
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      console.log('STOMP WebSocket Connected successfully');
      if (onConnectedCallback) onConnectedCallback();
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error: ' + frame.headers['message']);
    };

    this.client.onWebSocketClose = () => {
      this.connected = false;
    };

    this.client.activate();
  }

  subscribeToOrder(orderId, callback) {
    const topic = `/topic/orders/${orderId}`;
    return this.subscribe(topic, callback);
  }

  subscribeToAdminOrders(callback) {
    const topic = '/topic/admin/orders';
    return this.subscribe(topic, callback);
  }

  subscribe(topic, callback) {
    if (!this.client || !this.connected) {
      this.connect(() => {
        this.performSubscribe(topic, callback);
      });
      return {
        unsubscribe: () => {
          this.performUnsubscribe(topic);
        },
      };
    }

    return this.performSubscribe(topic, callback);
  }

  performSubscribe(topic, callback) {
    try {
      const sub = this.client.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message', err);
        }
      });
      this.subscriptions.set(topic, sub);
      return {
        unsubscribe: () => {
          this.performUnsubscribe(topic);
        },
      };
    } catch (err) {
      console.error('Subscription error for topic ' + topic, err);
      return { unsubscribe: () => {} };
    }
  }

  performUnsubscribe(topic) {
    const sub = this.subscriptions.get(topic);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
