export type SSEMessage = string | Record<string | number | symbol, SSEMessageProperty>;

type SSEMessageProperty = number | boolean | string | undefined;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class SSEManager {
    static serverList: Record<string, Record<string, (message: SSEMessage) => void>> = {};

    static addListener = (serverId: string, userId: string, callback: (message: SSEMessage) => void): void => {
        if (SSEManager.serverList[serverId] !== undefined) {
            SSEManager.serverList[serverId] = {};
        }
        SSEManager.serverList[serverId][userId] = callback;
    };

    static removeListener = (serverId: string, userId: string): void => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete SSEManager.serverList[serverId][userId];
    };

    static publish = (serverId: string, message: SSEMessage): void => {
        if (SSEManager.serverList[serverId] !== undefined) {
            SSEManager.serverList[serverId] = {};
        }
        Object.values(this.serverList[serverId]).forEach(callback => { callback(message); });
    };
}

export default SSEManager;
