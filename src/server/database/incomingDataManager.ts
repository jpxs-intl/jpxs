import InitRequest from "../types/initRequest";
import JoinRequest from "../types/joinRequest";
import PingRequest from "../types/pingRequest";
import UserDatabaseManager from "./userDatabaseManager";
import { User } from "../../database/entities/user.entity";
import { Avatar } from "../../database/entities/avatar.entity";
import ServerDatabaseManager from "./serverDatabaseManager";
import PlayerStatus from "../../database/entities/playerStatus.entity";
import { db } from "../../index";
import { Key } from "../../database/entities/key.entity";
import { KeyPerms, KeyPermsNames } from "../types/keyPerms";
import VPNCheck from "../data/vpnCheck";
import { Ip } from "../../database/entities/ip.entity";
import { RequiredIpData } from "../types/vpn";
import Logger from "../../utils/logger";
import BanRequest from "../types/banRequest";
import CacheStorage from "./cacheStorage";
import PunishmentManager from "./punishmentManager";
import { PunishmentType } from "../types/punishmentType";
import Time from "../discord/core/utils/time";
import DataStorage from "../data/dataStorage";
import InstructionRequest from "../types/instructionRequest";
import InstructionManager from "../data/instruction/instructionManager";
import { AvatarHistory } from "../../database/entities/avatarHistory.entity";

export default class IncomingDataManager {
  public static async handleInitRequest(data: InitRequest, serverId: string, key: Key) {
    const server = await ServerDatabaseManager.instance.getServer(serverId);
    // server is a temp server, ignore, either a local server or one that isn't on the server list.
    // either way, we don't want to do anything with it.
    if (!server) return;

    if (key.hasPermission(KeyPerms.SET_SERVER_DESCRIPTION)) server.description = data.description;
    if (key.hasPermission(KeyPerms.SET_SERVER_ICON)) server.icon = data.icon;
    if (key.hasPermission(KeyPerms.SET_SERVER_LINK)) server.link = data.link;
    if (key.hasPermission(KeyPerms.PROVIDE_BAN_LIST)) server.bans = data.bans;

    await ServerDatabaseManager.instance.updateServer(server);

    if (!DataStorage.serverData[serverId]) {
      DataStorage.serverData[serverId] = {
        tps: 0,
        mode: data.mode,
        map: "",
        uptime: 0,
        players: [],
        serverId,
        sentPatch: false,
      };
    }

    DataStorage.serverData[serverId].mode = data.mode;

    return {
      bans: await CacheStorage.bans.getServerBans(serverId),
    };
  }

  public static async handleJoinRequest(
    data: JoinRequest,
    key: Key,
    ip: string
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
    | {
        status: string;
        error: string;
      }
    | undefined
  > {
    if (!key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST)) return;

    if (!ServerDatabaseManager.instance.validateServer(data.serverId, ip)) {
      return {
        status: "error",
        error: "Server ID passed to JPXS is invalid. Do not modifiy it. This incident has been logged.",
      };
    }

    Logger.info(
      "IncomingDataManager",
      `Handling join request for ${data.phoneNumber}.\nServer permissions: \n    ${key
        .listPermissions()
        .filter((perm) => perm !== KeyPerms.NONE)
        .map((perm) => KeyPermsNames[perm])
        .join("\n    ")}`
    );

    let user = await UserDatabaseManager.instance.getUser(data.phoneNumber);

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
        Logger.warn("IncomingDataManager", `IP ${data.hashedIp} not found in database, Updating...`);
      } else {
        Logger.info("IncomingDataManager", `IP ${data.hashedIp} found in database, Using...`);
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
        const avatarEntity = this.convertAvatarFormat(data);
        let avatar = await CacheStorage.avatars.get(avatarEntity.id);

        const history = await db.getEntityManager().findOne(AvatarHistory, {
          player: user,
          avatar: {
            id: avatarEntity.id,
          },
        });

        if (!history) {
          if (!avatar) {
            avatar = this.convertAvatarFormat(data);
            await db.em.persistAndFlush(avatar);
          }

          CacheStorage.avatars.set(avatar.id, avatar);

          const avatarHistory = new AvatarHistory(avatar, user);
          await db.em.persistAndFlush(avatarHistory);
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

  public static async handlePingRequest(
    data: PingRequest,
    key: Key,
    ip: string
  ): Promise<{
    status: string;
    error: string;
  } | void> {
    if (
      !key.hasPermission(KeyPerms.PROVIDE_PLAYER_LIST) ||
      !key.hasPermission(KeyPerms.PROVIDE_PLAYER_STATUS)
    )
      return;

    const server = await ServerDatabaseManager.instance.getServer(data.serverId);
    if (!server) return; // see above

    if (!ServerDatabaseManager.instance.validateServer(data.serverId, ip, server.port)) {
      return {
        status: "error",
        error: "Server ID passed to JPXS is invalid. Do not modifiy it. This incident has been logged.",
      };
    }

    // @ts-ignore
    if (!DataStorage.serverData[server.id]) DataStorage.serverData[server.id] = {};

    DataStorage.serverData[server.id].players = data.players;
    DataStorage.serverData[server.id].map = data.map;
    DataStorage.serverData[server.id].tps = data.tps;
    DataStorage.serverData[server.id].uptime = data.uptime;

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

  public static async handlePunishmentRequest(
    data: BanRequest,
    key: Key,
    ip: string
  ): Promise<
    | {
        status: string;
        error: string;
      }
    | {}
  > {
    if (!ServerDatabaseManager.instance.validateServer(data.serverId, ip)) {
      return {
        status: "error",
        error: "Server ID passed to JPXS is invalid. Do not modifiy it. This incident has been logged.",
      };
    }

    const typeMap = {
      ban: PunishmentType.Ban,
      globalBan: PunishmentType.GlobalBan,
      ipBan: PunishmentType.IpBan,
      mute: PunishmentType.Mute,
      globalMute: PunishmentType.GlobalMute,
      kick: PunishmentType.Kick,
      warning: PunishmentType.Warning,
    } as const;

    const user = await CacheStorage.users.identSearch(data.user.toString());

    if (data.type == "unban" || data.type == "unmute") {
    } else if (data.type == "kick" || data.type == "warning") {
      // instnt
      PunishmentManager.createPunishment({
        type: typeMap[data.type],
        createdBy: data.creator,
        reason: data.reason || "No reason provided",
        serverId: data.serverId,
        user: user?.phoneNumber || typeof data.user == "string" ? parseInt(data.user.toString()) : data.user,
      });
    } else if (data.type in typeMap) {
      let time: number = 0;

      if (data.time) {
        if (typeof data.time == "string" || !/^\d+$/g.test(data.time.toString())) {
          time = new Time(data.time).ms();
        } else {
          time = data.time * Time.MINUTE;
        }
      }

      // timed
      PunishmentManager.createPunishment({
        type: typeMap[data.type],
        createdBy: data.creator,
        reason: data.reason || "No reason provided",
        serverId: data.serverId,
        user: user?.phoneNumber || typeof data.user == "string" ? parseInt(data.user.toString()) : data.user,
        expiresAt: new Date(Date.now() + time),
      });
    }

    return {};
  }

  public static async handleInstructionRequest(
    data: InstructionRequest,
    key: Key,
    ip: string
  ): Promise<
    | {
        status: string;
        error: string;
      }
    | {}
  > {
    if (!ServerDatabaseManager.instance.validateServer(data.serverId, ip)) {
      return {
        status: "error",
        error: "Server ID passed to JPXS is invalid. Do not modifiy it. This incident has been logged.",
      };
    }

    InstructionManager.handleInstructionResponse(data);
    return {};
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
