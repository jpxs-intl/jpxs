import { AuthSession } from "../../../../../../database/entities/authSession.entity.js";
import { User } from "../../../../../../database/entities/user.entity.js";
import { ms } from "../../../../../../utils/time.js";
import Core from "../../../../../core.js";

const sessionExpire = ms("1 week")
const sessionTouch = ms("5 minutes")

export default class SessionManager {

    public static cache: Map<string, AuthSession> = new Map();
    public static ignoreCache: Set<string> = new Set();
    public static touchCache: Map<string, NodeJS.Timeout> = new Map();

    public static async genSession(user: User): Promise<AuthSession> {
        const session = new AuthSession();
        session.user = user;

        await Core.services.em.persistAndFlush(session);
        this.cache.set(session.id, session);

        return session;
    }

    public static async checkSession(session: string): Promise<AuthSession | undefined> {

        if (this.ignoreCache.has(session)) {
            return undefined;
        }

        // check if session is in cache
        if (this.cache.has(session)) {
            const cachedSession = this.cache.get(session)!;

            this.touchSession(cachedSession);
            return cachedSession;
        }

        // check if session exists
        const validSession = await Core.services.em.findOne(AuthSession, {
            id: session,
        }, {
            populate: ["user", "user"],
        });

        if (validSession) {

            // Add to cache
            this.cache.set(validSession.id, validSession);

            // Update the session
            validSession.lastUsed = new Date();

            // no need to await
            Core.services.em.persistAndFlush(validSession);
            return validSession;
        }

        this.ignoreCache.add(session);
        return undefined;
    }

    public static async deleteSession(session: string): Promise<void> {
        await Core.services.em.nativeDelete(AuthSession, {
            id: session,
        });

        this.cache.delete(session);
    }

    public static async touchSession(session: AuthSession): Promise<void> {
        session.lastUsed = new Date();
        this.cache.set(session.id, session);

        if (this.touchCache.has(session.id)) {
            clearTimeout(this.touchCache.get(session.id)!);
        }

        this.touchCache.set(session.id, setTimeout(async () => {
            this.touchCache.delete(session.id);
            await Core.services.em.persistAndFlush(session);
        }, sessionTouch));
    }

    public static async checkSessionExpire(): Promise<void> {
        if (!Core.services.em) return;
        const sessions = await Core.services.em.find(AuthSession, {
            lastUsed: {
                $lt: new Date(Date.now() - sessionExpire),
            },
        })

        await Core.services.em.removeAndFlush(sessions);
    }
}