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

export default class IncomingDataManager {
  public static async handleInitRequest(data: InitRequest, serverId: string): Promise<void> {
    const server = await ServerDatabaseManager.instance.getServer(serverId);
    // server is a temp server, ignore, either a local server or one that isn't on the server list.
    // either way, we don't want to do anything with it.
    if (!server) return;

    server.description = data.description;
    server.icon = data.icon;
    server.link = data.link;
    data.bans;
  }

  public static async handleJoinRequest(data: JoinRequest): Promise<void> {
    let user = await UserDatabaseManager.instance.getUserBySteamId(data.steamId.toString());
    if (!user) {
      user = await UserDatabaseManager.instance.createUser(
        new User({
          gameId: data.gameId,
          steamId: data.steamId.toString(),
          phoneNumer: data.phoneNumber,
          name: data.name,
          hashedIp: data.hashedIp,
          avatar: this.convertAvatarFormat(data),
        })
      );
    } else {
      user.catchName(data.name);
      user.catchIp(data.hashedIp);
      user.catchAvatar(this.convertAvatarFormat(data));
      await UserDatabaseManager.instance.updateUser(user);
    }
  }

  public static async handlePingRequest(data: PingRequest): Promise<void> {
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
