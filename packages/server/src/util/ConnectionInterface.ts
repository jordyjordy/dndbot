import client, { getConnection } from '../bot';
import { ConnectionManager } from '../bot/connectionManager';
import QueueManager, { QueueStatus } from '../bot/queueManager';

class ConnectionInterface {
    serverId: string;
    connectionManager: ConnectionManager;
    queueManager: QueueManager;
    constructor(serverId: string) {
        this.serverId = serverId;

    }

    async getConnectionManager():Promise<ConnectionManager> {
        if(!this.connectionManager) {
            const { connectionManager, queueManager } = await getConnection(this.serverId);
            this.connectionManager = connectionManager;
            this.queueManager = queueManager;
        }
        return this.connectionManager;
    }

    async getQueueManager():Promise<QueueManager> {
        if(!this.queueManager) {
            const { connectionManager, queueManager } = await getConnection(this.serverId);
            this.connectionManager = connectionManager;
            this.queueManager = queueManager;
        }
        return this.queueManager;
    }

    async joinVoiceChannel(userId: string): Promise<void> {
        const server = await client.guilds.fetch(this.serverId);
        const member = await server.members?.fetch(userId);

        if(member.voice.channelId) {
            const connectionManager = await this.getConnectionManager();
            await connectionManager.connectToChannel(member.voice.channelId, this.serverId);
        }
    }

    async getPlayStatus(): Promise<QueueStatus & { playing: boolean }> {
        const connectionManager = await this.getConnectionManager();
        const queueManager = await this.getQueueManager();
        const playing = connectionManager.playing;
        const playStatus = queueManager.getPlayStatus();
        return { playing, ...playStatus };
    }

    
    
}

export default ConnectionInterface;
