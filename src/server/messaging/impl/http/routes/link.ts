import { Router } from 'express';
import OAuthManager from '../auth/manager/oAuthManager.js';
import SessionManager from '../auth/manager/sessionManager.js';
import Core from '../../../../core.js';
import { AuthType } from '../../../../../database/entities/userAuth.entity.js';
const linkRouter = Router();

linkRouter.get("/", (req, res) => {
    const identifier = OAuthManager.addRedirectHandler("/link/next")
    res.redirect(`/auth/discord?i=${identifier}`)
})

linkRouter.get("/next", async (req, res) => {

    const session = await SessionManager.checkSession(req.cookies.session);

    if (!session) {
        res.send("We had an issue logging you in. Please try again.");
        return;
    }

    const identifier = OAuthManager.addRedirectHandler("/link/complete");
    res.redirect(`/auth/steam?i=${identifier}`);
})

linkRouter.get("/complete", async (req, res) => {
    const session = await SessionManager.checkSession(req.cookies.session);

    if (!session) {
        res.send("We had an issue logging you in. Please try again.");
        return;
    }

    await session.user.auth.init()
    const userAuth = session.user.auth.getItems()

    const playerEntity = await Core.services.player.findOne({
        steamId: userAuth.find(a => a.type === AuthType.Steam)?.platformId
    });

    if (!playerEntity) {
        res.send("We had an issue linking your accounts. Please ping @gart in the discord, mention this error: [code 7]");
        return;
    }

    const discordId = userAuth.find(a => a.type === AuthType.Discord)?.platformId;

    if (!discordId) {
        res.send("We had an issue linking your accounts. Please ping @gart in the discord, mention this error: [code 8]");
        return;
    }

    playerEntity.discordId = discordId;
    await Core.services.em.persistAndFlush(playerEntity);

    const guild = Core.botCore.Client.guilds.cache.get(process.env.GUILD_ID!) || await Core.botCore.Client.guilds.fetch(process.env.GUILD_ID!);
    const member = await guild?.members.fetch(playerEntity.discordId);

    if (!member) {
        res.send("We had an issue linking your accounts. Please ping @gart in the discord, mention this error: [code 9]");
        return;
    }

    const role = guild.roles.cache.get(process.env.VERIFIED_ROLE_ID!) || await guild.roles.fetch(process.env.VERIFIED_ROLE_ID!);

    await member.roles.add(role!);

    res.send("Your accounts have been linked successfully! You can now close this tab.");

})


export default linkRouter;