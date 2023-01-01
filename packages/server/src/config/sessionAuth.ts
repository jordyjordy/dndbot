import { sessionDetails } from "../util/sessionManager.js";
import { Response, Request, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface ISessionAuthRequest extends Request {
    sessionDetails: sessionDetails
}

export default async (req: ISessionAuthRequest , res: Response, next: NextFunction): Promise<void> => {
    //retrieve possible tokens
    const sessionId = req.cookies['access_token'] as string;
    try {
        //check if a token exists
        if (sessionId) {
            const test = jwt.verify(sessionId, process.env.TOKEN_SECRET);
            if(!test) {
                throw new Error("no valid tokens present");
            }
            req.sessionDetails = test;
            next();
        } else {
            throw new Error("no valid tokens present");
        }
    } catch (err) {
        res.clearCookie('access_token');
        res.status(401).send("Authentication Failed")
    }
}
