import { AuthSession } from "../../../../../database/entities/authSession.entity.js";
import { AuthUser } from "../../../../../database/entities/authUser.entity.js";
import Core from "../../../../core.js";

const sessionExpire = 604800000;

export default class SessionManager {
    public static async genSession(user: AuthUser): Promise<AuthSession> {
        const session = new AuthSession();
        session.user = user;

        await Core.services.em.persistAndFlush(session);

        return session;
    }

    public static async checkSession(session: string): Promise<AuthSession | undefined> {
        this.checkSessionExpire();

        // check if session exists
        const validSession = await Core.services.authSession.findOne({
            id: session,
        }, {
            populate: ["user"],
        });

        if (validSession) {
            // Update the session
            validSession.lastUsed = new Date();
            await Core.services.em.persistAndFlush(validSession);
            return validSession;
        }

        return undefined;
    }

    public static async deleteSession(session: string): Promise<void> {
        const validSession = await Core.services.authSession.findOne({
            id: session,
        });
        if (!validSession) return;

        await Core.services.em.removeAndFlush(validSession);
    }

    public static async touchSession(session: AuthSession): Promise<void> {
        session.lastUsed = new Date();
        await Core.services.em.persistAndFlush(session);
    }

    public static async checkSessionExpire(): Promise<void> {
        if (!Core.services.em) return;

        const sessionsToExpire = await Core.services.authSession.find({
            lastUsed: {
                $lt: new Date(Date.now() - sessionExpire),
            },
        });

        Core.services.em.removeAndFlush(sessionsToExpire);

    }
}
