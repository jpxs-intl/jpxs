import { NextFunction, Request, Response } from "express";
import SessionManager from "./sessionManager.js";

export default async function (req: Request, res: Response, next: NextFunction) {

    let token = req.cookies["session"]

    if (!token) {
        return next()
    }

    const session = await SessionManager.checkSession(token)

    if (!session) {
        res.clearCookie("session")
        return next()
    }

    SessionManager.touchSession(session)

    req.body = {
        ...req.body,
        session: {
            id: session.id,
            user: session.user
        }
    }

    next();
}