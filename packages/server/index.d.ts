import { sessionDetails } from "./src/util/sessionManager";

declare namespace Express {
    interface Request {
       server?: string
       user?: string,
       headers: { 'session-id': string},
       sessionDetails: sessionDetails,
       query: { name:string, server: string },
       cookies: Record<string, any>,
    }
 }