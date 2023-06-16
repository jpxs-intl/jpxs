import { Router } from "express";
import fetch from "node-fetch";
import UserDatabaseManager from "../../../database/userDatabaseManager";
import CacheStorage from "../../../database/cacheStorage";
import { db } from "../../../..";
import { bot } from "../../../discord/core";
import Logger from "../../../../utils/logger";
const router = Router();

let validStates = new Set<string>();

function generateState() {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  validStates.add(state);
  return state;
}

export function generateOauthLink() {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.append("client_id", process.env.CLIENT_ID ?? "");
  url.searchParams.append("redirect_uri", process.env.REDIRECT_URI ?? "");
  url.searchParams.append("state", generateState());
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", "identify role_connections.write");
  url.searchParams.append("prompt", "none");
  return url.toString();
}

router.get("/login", (req, res) => {
  res.redirect(generateOauthLink());
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code) {
    return res.status(400).json({
      error: "No code provided",
    });
  }

  if (!state) {
    return res.status(400).json({
      error: "No state provided",
    });
  }

  if (!validStates.has(state)) {
    return res.status(400).json({
      error: "Invalid state",
      warning: "This may be a CSRF attack.",
    });
  }

  validStates.delete(state);

  // exchange code for token

  const tokenExchangeResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID ?? "",
      client_secret: process.env.CLIENT_SECRET ?? "",
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI ?? "",
    }),
  });

  if (!tokenExchangeResponse.ok) {
    return res.status(500).json({
      error: "Failed to exchange code for token",
    });
  }

  const tokenExchangeData: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  } = await tokenExchangeResponse.json();

  // get user info
  const ip = (req.headers["x-forwarded-for"] as string) ?? req.connection.remoteAddress;
  console.log(ip);

  const users = await UserDatabaseManager.instance.getUsersByLatestIp(ip);

  // initialize user data
  for (let user of users) {
    if (!user.nameHistory.isInitialized()) await user.nameHistory.init();
  }

  const userInfoResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `${tokenExchangeData.token_type} ${tokenExchangeData.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    return res.status(500).json({
      error: "Failed to get user info",
    });
  }

  const userInfoData = await userInfoResponse.json();

  // get all users where their latest ip is the same as the current ip

  if (users.length == 0) {
    res.send(
      "You have not logged into a JPXS enabled server on this device. Please log into a JPXS enabled server."
    );
    return;
  }

  if (users.length == 1) {
    // link the user
    const user = users[0];
    user.discordId = userInfoData.id;
    CacheStorage.users.set(user.phoneNumber, user);
    await db.getEntityManager().persistAndFlush(user);
    res.redirect(`/#linksuccess:${user.phoneNumber}:${user.nameHistory.getItems()[0]}:${userInfoData.username}:${userInfoData.id}`);

    const member = await bot.client.guilds.cache
      .get(process.env.GUILD_ID as string)
      ?.members.fetch(userInfoData.id);


    if (member) {
      await member.roles.add("1119272852781285399");
    } else {
      Logger.error("Link","Failed to add role to user");
    }

    return;
  }

  res.send("You have multiple accounts linked to this device. Please contact gart.");
});

export default router;
