import { Router } from "express";
import fetch from "node-fetch";
import UserDatabaseManager from "../../../database/userDatabaseManager";
import CacheStorage from "../../../database/cacheStorage";
import { db } from "../../../../index";
import { bot } from "../../../discord/core";
import Logger from "../../../../utils/logger";
import Util from "../../../../utils/util";
import { getUserLevel } from "../../../types/patreonLevels";
import fs from "fs";
import path from "path";

const router = Router();

let tempTokens = new Map<string, string>();

function generateState() {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
    res.redirect(
      `/#linksuccess:${Util.formatPhoneNumber(user.phoneNumber)}:${user.nameHistory.getItems()[0].name}:${
        userInfoData.username
      }:${userInfoData.id}`
    );

    const member = await bot.client.guilds.cache
      .get(process.env.GUILD_ID as string)
      ?.members.fetch(userInfoData.id);

    if (member) {
      await member.roles.add("1119272852781285399");
      user.supporterLevel = getUserLevel(member);
    } else {
      Logger.error("Link", "Failed to add role to user");
    }

    // link the user
    user.discordId = userInfoData.id;

    CacheStorage.users.set(user.phoneNumber, user);
    await db.getEntityManager().persistAndFlush(user);
    res.redirect(
      `/#linksuccess:${Util.formatPhoneNumber(user.phoneNumber)}:${user.nameHistory.getItems()[0].name}:${
        userInfoData.username
      }:${userInfoData.id}`
    );

    return;
  }

  // multiple users with the same ip
  // ask the user which one they want to link

  const tempToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  tempTokens.set(tempToken, userInfoData.id);

  const html = fs.readFileSync(path.resolve("./assets/web/link.html"), "utf8");

  const replaced = html
    .replace(/{{name}}/g, userInfoData.username)
    .replace(/{{id}}/g, userInfoData.id)
    .replace(
      /{{list}}/g,
      users
        .map(
          (user) =>
            `<li><a href="/api/auth/select?token=${tempToken}&phone=${
              user.phoneNumber
            }">${Util.formatPhoneNumber(user.phoneNumber)} (${user.nameHistory.getItems()[0].name})</a></li>`
        )
        .join("")
    );
  res.send(replaced);
});

router.get("/select", async (req, res) => {
  const token = req.query.token as string;
  const phone = req.query.phone as string;

  if (!token) {
    return res.status(400).json({
      error: "No token provided",
    });
  }

  if (!phone) {
    return res.status(400).json({
      error: "No phone provided",
    });
  }

  if (!tempTokens.has(token)) {
    return res.status(400).json({
      error: "Invalid token",
    });
  }

  const discordId = tempTokens.get(token);

  if (!discordId) {
    return res.status(400).json({
      error: "Invalid token",
    });
  }

  tempTokens.delete(token);

  const user = await UserDatabaseManager.instance.getUser(parseInt(phone));

  if (!user) {
    return res.status(400).json({
      error: "Invalid phone",
    });
  }

  user.discordId = discordId;
  CacheStorage.users.set(user.phoneNumber, user);
  await db.getEntityManager().persistAndFlush(user);

  if (!user.nameHistory.isInitialized()) await user.nameHistory.init();

  res.redirect(
    `/#linksuccess:${Util.formatPhoneNumber(user.phoneNumber)}:${
      user.nameHistory.getItems()[0].name
    }:${discordId}`
  );

  const member = await bot.client.guilds.cache.get(process.env.GUILD_ID as string)?.members.fetch(discordId);

  if (member) {
    await member.roles.add("1119272852781285399");
  }
});

export default router;
