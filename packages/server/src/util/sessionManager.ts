import {v4} from 'uuid';

export interface sessionDetails {
    access_token: string,
    expires_in: number,
    refresh_token: string
    scope: string,
    token_type: string,
    userId: string,
    username: string
  }

class sessionManager {
    static sessions = new Map();

    static getSessionDetails(sessionId: string): sessionDetails {
        return sessionManager.sessions.get(sessionId);
    }

    static storeSession(sessionData: sessionDetails): string {
        const sessionId = v4();
        sessionManager.sessions.set(sessionId, sessionData);
        return sessionId;
    }

    static sessionsExists(sessionId: string): boolean {
        return sessionManager.sessions.has(sessionId);
    }
}

export default sessionManager;


