export type SSEMessage = string | Record<string | number | symbol, SSEMessageProperty>;

type SSEMessageProperty = number | boolean | string | undefined;

class SSEManager {
    // Replace simple serverList with richer server entries
    // each server has listeners, an optional timer, and lastSent timestamp
    static serverList: Record<string, {
        listeners: Record<string, (message: SSEMessage) => void>;
        timer?: ReturnType<typeof setInterval>;
        lastSent: number;
    }> = {};

    static addListener = (serverId: string, userId: string, callback: (message: SSEMessage) => void): void => {
        if (SSEManager.serverList[serverId] === undefined) {
            SSEManager.serverList[serverId] = { listeners: {}, timer: undefined, lastSent: Date.now() };
        }
        SSEManager.serverList[serverId].listeners[userId] = callback;

        // ensure heartbeat timer is running for this server
        SSEManager.startHeartbeat(serverId);
    };

    static removeListener = (serverId: string, userId: string): void => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        const entry = SSEManager.serverList[serverId];
        if (!entry) return;
        delete entry.listeners[userId];

        // if no listeners remain, stop the timer and remove the entry
        if (Object.keys(entry.listeners).length === 0) {
            SSEManager.stopHeartbeat(serverId);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete SSEManager.serverList[serverId];
        }
    };

    static publish = (serverId: string, message: SSEMessage): void => {
        if (SSEManager.serverList[serverId] === undefined) {
            SSEManager.serverList[serverId] = { listeners: {}, timer: undefined, lastSent: Date.now() };
        }
        const entry = SSEManager.serverList[serverId];
        // mark that we just sent something (resets heartbeat window)
        entry.lastSent = Date.now();

        Object.values(entry.listeners).forEach(callback => {
            try {
                callback(message);
            } catch {
                // swallow callback errors to avoid breaking others
            }
        });

        // ensure heartbeat timer is running (in case listeners were added and timer wasn't started)
        SSEManager.startHeartbeat(serverId);
    };

    // start a heartbeat interval for a server if not already running
    private static startHeartbeat(serverId: string): void {
        const entry = SSEManager.serverList[serverId];
        if (!entry) return;
        if (entry.timer) return;

        const INTERVAL_MS = 30_000;
        entry.timer = setInterval(() => {
            const now = Date.now();
            if (now - entry.lastSent >= INTERVAL_MS) {
                // send empty object heartbeats
                Object.values(entry.listeners).forEach(cb => {
                    try {
                        // empty object as requested
                        cb({});
                    } catch {
                        // ignore listener errors
                    }
                });
                // update lastSent so we won't immediately send again
                entry.lastSent = Date.now();
            }
        }, INTERVAL_MS);
    }

    // stop and clear the heartbeat timer for a server
    private static stopHeartbeat(serverId: string): void {
        const entry = SSEManager.serverList[serverId];
        if (!entry || !entry.timer) return;
        clearInterval(entry.timer);
        entry.timer = undefined;
    }
}

export default SSEManager;
