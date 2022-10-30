import { Response, Request, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';
import Token from '../model/token.js';

interface IAuthHeaders extends IncomingHttpHeaders {
    token: string,
}

export interface IAuthRequest extends Request {
    headers: IAuthHeaders,
    user: string,
    server: string,
}

export default async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    //retrieve possible tokens
    const token = req.headers.token
    try {
        //check if a token exists
        if (!token) {
            throw new Error("no valid tokens present")
        } else {
            //decode the token
            const info = await Token.findByToken(token);
            req.user = info.discord_id
            req.server = info.server_id
            next()
        }
    } catch (err) {
        res.status(401).json("Authentication Failed")
    }
    return;
}