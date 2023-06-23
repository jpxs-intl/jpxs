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
import VPNCheck from "../data/vpnCheck";
import { Ip } from "../../database/entities/ip.entity";
import { RequiredIpData } from "../types/vpn";

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

  public static async handleJoinRequest(
    data: JoinRequest,
    key: Key
  ): Promise<
    | {
        isVpn: boolean;
        country: string;
        countryCode: string;
        nameHistory: string[];
        timeZone: string;
        alts: {
          name: string;
          phone: number;
        }[];
      }
    | undefined
  > {
    if (!key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST)) return;
    let user = await UserDatabaseManager.instance.getUserBySteamId(data.steamId.toString());

    // check if user already has ip in history
    if (user) {
    }

    let ipData: RequiredIpData;

    if (!user) {
      ipData = await VPNCheck.check(data.hashedIp);
      user = await UserDatabaseManager.instance.createUser(
        new User({
          gameId: data.gameId,
          steamId: key.hasPermission(KeyPerms.PROVIDE_STEAM_IDS) ? data.steamId.toString() : undefined,
          phoneNumer: data.phoneNumber,
          description: "",
        }),
        {
          name: key.hasPermission(KeyPerms.PROVIDE_PLAYER_NAMES) ? data.name : undefined,
          ip: key.hasPermission(KeyPerms.PROVIDE_PLAYER_IPS)
            ? {
                ip: data.hashedIp,
                ...ipData,
              }
            : undefined,
          avatar: key.hasPermission(KeyPerms.PROVIDE_PLAYER_AVATARS)
            ? this.convertAvatarFormat(data)
            : undefined,
        }
      );
    } else {
      const dbIp = await db.getEntityManager().findOne(Ip, {
        ip: data.hashedIp,
        users: {
          phoneNumber: user.phoneNumber,
        },
      });

      if (!dbIp) {
        ipData = await VPNCheck.check(data.hashedIp);
      } else {
        ipData = {
          security: {
            vpn: dbIp.isVpn,
            proxy: dbIp.isProxy,
          },
          location: {
            latitude: dbIp.latitude.toString(),
            longitude: dbIp.longitude.toString(),
            country: dbIp.country,
            country_code: dbIp.countryCode,
            time_zone: dbIp.timeZone,
          },
        };
      }

      if (key.hasPermission(KeyPerms.PROVIDE_PLAYER_NAMES))
        await UserDatabaseManager.instance.catchName(user, data.name);
      if (key.hasPermission(KeyPerms.PROVIDE_PLAYER_IPS))
        await UserDatabaseManager.instance.catchIp(user, {
          ip: data.hashedIp,
          ...ipData,
        });
      if (key.hasPermission(KeyPerms.PROVIDE_PLAYER_AVATARS)) {
        const avatar = db.getEntityManager().findOne(Avatar, {
          id: Avatar.getId(this.convertAvatarFormat(data)),
        });

        if (!avatar) {
          await db.getEntityManager().persistAndFlush(new Avatar(this.convertAvatarFormat(data)));
        }
      }

      user.lastSeen = new Date();
      await UserDatabaseManager.instance.updateUser(user);
    }

    const nameHistory = user.nameHistory.isInitialized()
      ? user.nameHistory.getItems().map((item) => item.name)
      : await user.nameHistory.init().then((items) => items.getItems().map((item) => item.name));
    const alts = await UserDatabaseManager.instance.getAlts(user.phoneNumber);

    return {
      isVpn: ipData.security.vpn || ipData.security.proxy,
      country: ipData.location.country,
      countryCode: ipData.location.country_code,
      timeZone: ipData.location.time_zone,
      nameHistory: nameHistory,
      alts: alts.map((alt) => {
        return {
          name: alt.nameHistory.getItems()[0].name,
          phone: alt.phoneNumber,
        };
      }),
    };
  }

  public static async handlePingRequest(data: PingRequest, key: Key, ip: string): Promise<void> {
    if (
      !key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST) ||
      !key.hasPermission(KeyPerms.PROVIDE_PLAYER_STATUS)
    )
      return;

    const server = await ServerDatabaseManager.instance.getServer(data.serverId);
    if (!server) return; // see above

    if (!ServerDatabaseManager.instance.validateServer(data.serverId, ip, server.port)) return;

    let promises: Promise<User | undefined>[] = [];

    const statusRepo = db.getEntityManager().getRepository(PlayerStatus);

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

          statusRepo.persist(status);
          return user;
        })()
      );
    });

    await Promise.all(promises);
    statusRepo.flush();
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
