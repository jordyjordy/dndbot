declare namespace Express {
    export interface Request {
       server?: string
       user?: string,
       headers: { 'session-id': string},
       query: { name:string, server: string }
    }
 }