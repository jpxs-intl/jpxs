import InitRequest from "../types/initRequest";
import JoinRequest from "../types/joinRequest";
import PingRequest from "../types/pingRequest";
import UserDatabaseManager from "./userDatabaseManager";
import { User } from "../../database/entities/user.entity";
import { Avatar } from "../../database/entities/avatar.entity";
import ServerDatabaseManager from "./serverDatabaseManager";
import PlayerStatus from "../../database/entities/playerStatus.entity";
import { db } from "../..";
import { Key } from "../../database/entities/key.entity";
import { KeyPerms } from "../types/keyPerms";
import Logger from "../../utils/logger";
import VPNCheck from "../data/vpnCheck";

export default class IncomingDataManager {
  public static async handleInitRequest(data: InitRequest, serverId: string, key: Key): Promise<void> {
    const server = await ServerDatabaseManager.instance.getServer(serverId);
    // server is a temp server, ignore, either a local server or one that isn't on the server list.
    // either way, we don't want to do anything with it.
    if (!server) return;

    if (key.hasPermission(KeyPerms.SET_SERVER_DESCRIPTION)) server.description = data.description;
    if (key.hasPermission(KeyPerms.SET_SERVER_ICON)) server.icon = data.icon;
    if (key.hasPermission(KeyPerms.SET_SERVER_LINK)) server.link = data.link;
    if (key.hasPermission(KeyPerms.PROVIDE_BAN_LIST)) server.bans = data.bans;

    await ServerDatabaseManager.instance.updateServer(server);
  }

  public static async handleJoinRequest(data: JoinRequest, key: Key): Promise<{
    isVpn: boolean;
    country: string;
    countryCode: string;
    nameHistory: string[];
    alts: {
      name: string;
      phone: number;
    }[]
  } | undefined> {
    Logger.log("Join request", data);
    Logger.log("Key", key.key);
    Logger.log("Key perms", key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST));

    if (!key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST)) return;
    let user = await UserDatabaseManager.instance.getUserBySteamId(data.steamId.toString());
    if (!user) {
      user = await UserDatabaseManager.instance.createUser(
        new User({
          gameId: data.gameId,
          steamId: key.hasPermission(KeyPerms.PROVIDE_STEAM_IDS) ? data.steamId.toString() : undefined,
          phoneNumer: data.phoneNumber,
          name: data.name,
          hashedIp: key.hasPermission(KeyPerms.PROVIDE_PLAYER_IPS) ? data.hashedIp : undefined,
          avatar: key.hasPermission(KeyPerms.PROVIDE_PLAYER_AVATARS)
            ? this.convertAvatarFormat(data)
            : undefined,
        })
      );
    } else {
      if (key.hasPermission(KeyPerms.PROVIDE_PLAYER_NAMES)) user.catchName(data.name);
      if (key.hasPermission(KeyPerms.PROVIDE_PLAYER_IPS)) user.catchIp(data.hashedIp);
      if (key.hasPermission(KeyPerms.PROVIDE_PLAYER_AVATARS)) {
        const avatar = new Avatar(this.convertAvatarFormat(data));

        await db.getEntityManager().persistAndFlush(avatar).catch((err) => {
          // avatar already exists, so we can just ignore this error
          //Logger.error(err);
        });

        user.catchAvatar(avatar);
      }
      await UserDatabaseManager.instance.updateUser(user);
    }

    const ipData = await VPNCheck.check(data.hashedIp);
    const nameHistory = user.nameHistory.map((name) => name.name);
    const alts = await UserDatabaseManager.instance.getAlts(user.phoneNumber);

    return {
      isVpn: ipData.security.vpn || ipData.security.proxy,
      country: ipData.location.country,
      countryCode: ipData.location.country_code,
      nameHistory: nameHistory,
      alts: alts.map((alt) => {
        return {
          name: alt.name,
          phone: alt.phoneNumber,
        };
      }),
    };
  }

  public static async handlePingRequest(data: PingRequest, key: Key): Promise<void> {
    if (
      !key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST) ||
      !key.hasPermission(KeyPerms.PROVIDE_PLAYER_STATUS)
    )
      return;
    const server = await ServerDatabaseManager.instance.getServer(data.serverId);
    if (!server) return; // see above

    let promises: Promise<User | undefined>[] = [];

    data.players.forEach((player) => {
      promises.push(
        (async () => {
          const user = await UserDatabaseManager.instance.getUserByGameId(player.subRosaId);
          if (!user) return undefined;

          const status = new PlayerStatus({
            server: server,
            user: user,
            corp: player.corp,
            money: player.money,
            team: player.team,
          });

          db.getEntityManager().persist(status);
          return user;
        })()
      );
    });

    await Promise.all(promises);
    db.getEntityManager().flush();
  }

  public static convertAvatarFormat(data: {
    eyeColor: number;
    hair: number;
    hairColor: number;
    head: number;
    gender: number;
    skinColor: number;
  }): Avatar {
    return new Avatar({
      eyes: data.eyeColor,
      hair: data.hair,
      hairColor: data.hairColor,
      head: data.head,
      sex: data.gender,
      skin: data.skinColor,
    });
  }
}
