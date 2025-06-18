import { Router } from 'express';
import DiscordOauthProvider from '../auth/discordAuthProvider.js';
const router = Router();

const discordOauth = new DiscordOauthProvider()

router.get("/discord", (req, res) => {
    res.redirect(discordOauth.generateOauthUrl())
})

router.get("/discord/callback", (req, res) => {
    discordOauth.handleCallback(req, res)
})

router.get("/logout", (req, res) => {
    res.clearCookie("session")
    res.redirect("/")
})

export default router;