import sessionManager from "../util/sessionManager.js";

export default async (req, res, next) => {
    //retrieve possible tokens
    const sessionId = req.headers['session-id']
    try {
        //check if a token exists
        if (sessionManager.sessionsExists(sessionId)) {
            const sessionDetails = sessionManager.getSessionDetails(sessionId);
            req.sessionDetails = sessionDetails;
            next();
        } else {
            throw new Error("no valid tokens present")
        }
    } catch (err) {
        res.status(401).json("Authentication Failed")
    }
}
