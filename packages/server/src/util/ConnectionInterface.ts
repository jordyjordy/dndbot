import client, { getConnection } from '../bot';
import { ConnectionManager } from '../bot/connectionManager';

class ConnectionInterface {
    serverId: string;
    connectionManager: ConnectionManager;
    constructor(serverId: string) {
        this.serverId = serverId;

    }

    async getConnectionManager():Promise<ConnectionManager> {
        if(!this.connectionManager) {
            const { connectionManager } = await getConnection(this.serverId);
            this.connectionManager = connectionManager;
        }
        return this.connectionManager;
    }

    async joinVoiceChannel(userId: string): Promise<void> {
        const server = await client.guilds.fetch(this.serverId);
        const member = await server.members?.fetch(userId);

        if(member.voice.channelId) {
            const connectionManager = await this.getConnectionManager();
            await connectionManager.connectToChannel(member.voice.channelId, this.serverId);
        }
    }
    
}

export default ConnectionInterface;
