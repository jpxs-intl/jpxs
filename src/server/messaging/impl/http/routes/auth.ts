import { Router } from 'express';
import OAuthManager from '../auth/manager/oAuthManager.js';
import SessionManager from '../auth/manager/sessionManager.js';
import { AuthTypeNames } from '../../../../../database/entities/userAuth.entity.js';
const authRouter = Router();

authRouter.get('/status', async (req, res) => {

    const session = await SessionManager.checkSession(req.cookies?.session)

    if (!session) {
        res.status(401).send("Unauthorized")
        return;
    }

    const providers = session.user.auth.getItems()

    const sessions = session.user.sessions

    if (!sessions.isInitialized()) {
        await sessions.init()
    }

    res.json({
        user: {
            id: session.user.id,
            username: session.user.displayName,
        },
        providers:
            providers.reduce((acc, provider) => {
                acc[AuthTypeNames[provider.type]] = {
                    id: provider.authId,
                    username: provider.username
                }
                return acc
            }, {} as Record<string, { id: string, username: string }>),
        currentSession: session.id,
        sessions: sessions.getItems().map(s => ({
            lastUsed: s.lastUsed,
            current: s.id === session.id
        }))

    })

})

authRouter.get('/logout', async (req, res) => {
    await SessionManager.deleteSession(req.cookies?.session)

    res.clearCookie("session")
    res.redirect("back")
})

authRouter.get('/:provider/me', async (req, res) => {
    const provider = OAuthManager.getProvider(req.params.provider as keyof typeof OAuthManager["authProviders"])

    if (!provider) {
        res.status(404).send("Provider not found")
        return;
    }

    const session = await SessionManager.checkSession(req.cookies?.session)

    if (!session) {
        res.status(401).send("Unauthorized")
        return;
    }

    res.json(await provider.getUserData(session.user.id))
})

authRouter.get('/:provider/callback', (req, res) => {
    const provider = OAuthManager.getProvider(req.params.provider as keyof typeof OAuthManager["authProviders"])

    if (!provider) {
        res.status(404).send("Provider not found")
        return;
    }

    provider.handleCallback(req, res);
})

authRouter.get('/:provider', async (req, res) => {
    const provider = OAuthManager.getProvider(req.params.provider as keyof typeof OAuthManager["authProviders"])

    if (!provider) {
        res.status(404).send("Provider not found")
        return;
    }

    res
        .setHeader("Set-Cookie", `identifier=${req.query?.i as string}; HttpOnly`)
        .redirect(await provider.generateOauthUrl(req.query?.i as string));
})



export default authRouter;