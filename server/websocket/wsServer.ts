import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export interface LiveEventPayload {
  type: 
    | 'SCORE_UPDATE' 
    | 'MATCH_STATUS_CHANGE' 
    | 'REFEREE_STATUS_CHANGE' 
    | 'KYC_STATUS_CHANGE' 
    | 'TOURNAMENT_UPDATE'
    | 'HEARTBEAT';
  data: any;
  timestamp: string;
}

class LiveWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      // Send initial connection ack
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        data: { message: 'Connected to IFI Live Scoring & Telemetry Stream' },
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch {
          // Ignore malformed message
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', () => {
        this.clients.delete(ws);
      });
    });

    // Send heartbeat every 30 seconds
    setInterval(() => {
      this.broadcast({
        type: 'HEARTBEAT',
        data: { activeConnections: this.clients.size },
        timestamp: new Date().toISOString()
      });
    }, 30000);
  }

  public broadcast(event: LiveEventPayload) {
    if (!this.wss) return;
    const message = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}

export const wsBroadcaster = new LiveWebSocketServer();
