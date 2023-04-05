import cuid from "cuid";
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

  public static async handleJoinRequest(data: JoinRequest, key: Key): Promise<void> {
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
      if (key.hasPermission(KeyPerms.PROVIDE_PLAYER_AVATARS))
        user.catchAvatar(this.convertAvatarFormat(data));
      await UserDatabaseManager.instance.updateUser(user);
    }
  }

  public static async handlePingRequest(data: PingRequest, key: Key): Promise<void> {
    if (!key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST) || !key.hasPermission(KeyPerms.PROVIDE_PLAYER_STATUS)) return;
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
