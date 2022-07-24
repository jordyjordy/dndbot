import {v4} from 'uuid';

class sessionManager {
    static sessions = new Map();

    static getSessionDetails(sessionId) {
        return sessionManager.sessions.get(sessionId);
    }

    static storeSession(sessionData) {
        const sessionId = v4();
        sessionManager.sessions.set(sessionId, sessionData);
        return sessionId;
    }

    static sessionsExists(sessionId) {
        return sessionManager.sessions.has(sessionId);
    }
}

export default sessionManager;


