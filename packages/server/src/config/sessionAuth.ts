import sessionManager, { sessionDetails } from "../util/sessionManager.js";
import { Response, Request, NextFunction } from "express";


export interface ISessionAuthRequest extends Request {
    sessionDetails: sessionDetails
}

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    //retrieve possible tokens
    const sessionId = req.headers['session-id'] as string
    try {
        //check if a token exists
        if (sessionId && sessionManager.sessionsExists(sessionId)) {
            const sessionDetails = sessionManager.getSessionDetails(sessionId);
            req.sessionDetails = sessionDetails;
            next();
        } else {
            throw new Error("no valid tokens present")
        }
    } catch (err) {
        res.status(401).send("Authentication Failed")
    }
}
