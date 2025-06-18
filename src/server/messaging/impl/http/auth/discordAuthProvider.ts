import { Request, Response } from "express"
import oAuthProvider from "./oauthProvider.js"
import SessionManager from "./sessionManager.js"
import Core from "../../../../core.js"
import { AuthUser } from "../../../../../database/entities/authUser.entity.js"

export default class DiscordOauthProvider extends oAuthProvider {

    constructor() {
        super()
    }

    public generateOauthUrl() {
        const url = new URL("https://discord.com/api/oauth2/authorize")
        url.searchParams.append("client_id", process.env.DISCORD_CLIENT_ID!)
        url.searchParams.append("redirect_uri", process.env.DISCORD_REDIRECT_URI!)
        url.searchParams.append("response_type", "code")
        url.searchParams.append("state", this.generateState())
        url.searchParams.append("scope", "identify")
        return url.toString()
    }

    public async handleCallback(req: Request, res: Response) {
        const code = req.query.code as string
        const state = req.query.state as string

        if (!code || !state) {
            res.status(400).send("Missing code or state")
            return
        }

        if (!this.isValidState(state)) {
            res.status(400).send("Invalid state")
            return
        }

        const token = await this.exchangeCode(code)


        if (!token.access_token) {
            res.status(400).send("Invalid code")
            return
        }

        const user = await this.getUser(token.access_token)

        if (!user.id) {
            res.status(400).send("Invalid token")
            return
        }

        let userEntity = await Core.services.authUser.findOne({ id: `discord:${user.id}` })

        if (!userEntity) {
            userEntity = AuthUser.fromDiscord(user.id, user.username, token.access_token, token.refresh_token, ["identify"], new Date(Date.now() + token.expires_in * 1000))
            await Core.services.em.persistAndFlush(userEntity)
        } else {
            userEntity.token = token.access_token
            userEntity.refreshToken = token.refresh_token
            userEntity.expiresAt = new Date(Date.now() + token.expires_in * 1000)
            await Core.services.em.persistAndFlush(userEntity)
        }

        const session = await this.genSession(userEntity!)
        res.cookie("session", session.id, { httpOnly: true, maxAge: 604800000 })

        res.redirect("/")
    }

    public async exchangeCode(code: string) {
        const url = new URL("https://discord.com/api/oauth2/token")
        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI!,
            })
        })
        const json = await response.json()
        return json as {
            access_token: string
            expires_in: number
            refresh_token: string
            scope: string
            token_type: string
        }
    }

    public async getUser(token: string) {
        const url = new URL("https://discord.com/api/users/@me")
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const json = await response.json()
        return json as {
            id: string
            username: string
            discriminator: string
            avatar: string
        }
    }

    public async genSession(user: AuthUser) {
        const session = await SessionManager.genSession(user)
        return session
    }

}