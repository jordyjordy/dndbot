

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SSEMessage = string | { [k:string]: SSEMessage | number | Array<SSEMessage> | boolean | undefined };

class SSEManager {
    static serverList: Record<string, Record<string, (message: SSEMessage) => void>> = {};

    static addListener = (serverId: string, userId: string, callback: (message: SSEMessage) => void): void => {
        if(!SSEManager.serverList[serverId]) {
            SSEManager.serverList[serverId] = {};
        }
            SSEManager.serverList[serverId][userId] = callback; 
    };

    static removeListener = (serverId: string, userId: string): void => {
        delete SSEManager.serverList[serverId][userId]; 
    };

    static publish = (serverId: string, message: SSEMessage): void => {
        if (!SSEManager.serverList[serverId]) {
            SSEManager.serverList[serverId] = {};
        }
        Object.values(this.serverList[serverId]).forEach(callback => callback(message));
    };
}

export default SSEManager;