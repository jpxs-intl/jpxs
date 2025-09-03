import { Request, Response } from "express";
import oAuthProvider, { UserData } from "./oAuthProvider.js";
import fetch from "node-fetch";
import Core from "../../../../../core.js";
import { UserAuth, AuthType } from "../../../../../../database/entities/userAuth.entity.js";
import SessionManager from "../manager/sessionManager.js";
import OAuthManager from "../manager/oAuthManager.js";
import SteamAuth from "node-steam-openid";
import { User } from "../../../../../../database/entities/user.entity.js";
import { ms } from "../../../../../../utils/time.js";

export default class SteamOAuthProvider extends oAuthProvider {
    public static readonly authCLient = new SteamAuth({
        realm: "https://beta.jpxs.io",
        apiKey: process.env.STEAM_TOKEN!,
        returnUrl: process.env.STEAM_REDIRECT_URI!,
    })

    constructor() {
        super()

    }

    public async generateOauthUrl(identifier?: string): Promise<string> {
        return await SteamOAuthProvider.authCLient.getRedirectUrl()
    }

    public async handleCallback(req: Request, res: Response): Promise<void> {
        const user = await SteamOAuthProvider.authCLient.authenticate(req).catch(() => {
            return undefined
        })

        if (!user) {
            res.status(400).send("Invalid Steam response")
            return
        }

        const name = user.name || user.username

        const identifier = req.cookies.identifier

        const currentSession = await SessionManager.checkSession(req.cookies.session)

        let userEntity: User | undefined
        let userAuth: UserAuth | undefined

        if (currentSession) {
            // user is already logged in, merge this new account with the existing one

            userEntity = currentSession.user
            userEntity.displayName = name

            const existingAuth = await Core.services.userAuth.findOne({
                authId: `steam:${user.steamid}`
            })

            if (!existingAuth) {
                userAuth = new UserAuth(`steam:${user.steamid}`, name, AuthType.Steam, userEntity, "")
                await Core.services.em.persistAndFlush(userAuth)
            }

            // force expire the current session (new session will be generated below)
            await SessionManager.deleteSession(req.cookies.session)

        } else {

            userEntity = (await Core.services.user.findOne({
                auth: {
                    authId: `steam:${user.steamid}`
                }
            })) || undefined

            if (!userEntity) {
                userEntity = new User(name)
                await Core.services.em.persistAndFlush(userEntity)
            }

            userAuth = (await Core.services.userAuth.findOne({
                authId: `steam:${user.steamid}`
            })) || undefined


            if (!userAuth) {
                console.log(user)
                userAuth = new UserAuth(`steam:${user.steamid}`, name, AuthType.Steam, userEntity, "")
                await Core.services.em.persistAndFlush(userAuth)
            }

        }

        const playerEntity = await Core.services.player.findOne({
            steamId: user.steamid
        })

        if (playerEntity) {
            // check for discord auth
            const discordAuth = await Core.services.userAuth.findOne({
                user: userEntity,
                type: AuthType.Discord
            })

            if (discordAuth) {
                playerEntity.discordId = discordAuth.platformId;
            }

            const alreadyLinkedUser = await Core.services.user.findOne({
                linkedTo: playerEntity
            })

            if (alreadyLinkedUser) {
                alreadyLinkedUser.linkedTo = undefined
            }

            if (!userEntity.linkedTo) {
                userEntity.linkedTo = playerEntity
            }

            await Core.services.em.persistAndFlush([userEntity, playerEntity])
        }

        const session = await SessionManager.genSession(userEntity)
        res.cookie("session", session.id, { maxAge: ms("7 days"), httpOnly: true, path: "/" })

        if (identifier && typeof identifier === "string") {

            const handler = OAuthManager.getHandler(identifier)
            if (!handler) {
                res
                    .cookie("identifier", "", { maxAge: 0, path: "/auth" })
                    .redirect("/")
                return
            }

            const redirectUrl = new URL(handler.url.startsWith("/") ? `${Core.BASE_URL}${handler.url}` : handler.url)

            // remove identifier cookie and redirect
            res
                .cookie("identifier", "", { maxAge: 0, path: "/auth" })
                .redirect(
                    redirectUrl.toString()
                )
            return
        }

        res.redirect("/")
    }

    // im lazy and im using a library to do this
    public async getUser(accessToken: string) {
    }

    public async refreshAccessToken(userId: string) {
    }

    public async getUserData(userId: string): Promise<UserData> {
        return undefined as unknown as UserData
    }
}