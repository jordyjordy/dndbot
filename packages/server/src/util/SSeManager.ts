class SSEManager {
    static serverList: Record<string, Record<string, (message: any) => void>> = {};

    static addListener = (serverId: string, userId: string, callback: (message: any) => void): void => {
        if(!SSEManager.serverList[serverId]) {
            SSEManager.serverList[serverId] = {};
        }
            SSEManager.serverList[serverId][userId] = callback; 
    };

    static removeListener = (serverId: string, userId: string): void => {
        delete SSEManager.serverList[serverId][userId]; 
    };

    static publish = (serverId: string, message: any): void => {
        Object.values(this.serverList[serverId]).forEach(callback => callback(message));
    };
}

export default SSEManager;