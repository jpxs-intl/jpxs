import { Finance } from "../../database/entities/finance.entity.js";
import { Ip } from "../../database/entities/ip.entity.js";
import { Logger } from "../../utils/logger.js";
import { time } from "../../utils/time.js";
import Core from "../core.js";
import { DataChannel } from "../messaging/channels/data.js";
import { MasterserverChannel } from "../messaging/channels/masterserver.js";
import AuthManager from "../messaging/manager/auth/authManager.js";
import ClientManager from "../messaging/manager/networking/clientManager.js";
import DataStorage from "./dataStorage.js";
import ServerManager from "./serverManager.js";

export default class IncomingDataManager {
    public static readonly clientId = "jpxs.DataManager";
    public static logger = Logger.create("IncomingDataManager");

    public static async init() {

        DataChannel.subscribeToEvent(this.clientId, "server:init", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)
            if (!client) return
            const server = ServerManager.getServer(client.name!)
            if (!server) return IncomingDataManager.logger.error(`Server ${client.name} not found, something is wrong`)

            DataStorage.onInitEvent(server, data)
        })

        DataChannel.subscribeToEvent(this.clientId, "player:join", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)
            if (!client) return
            const server = ServerManager.getServer(client.name!)
            if (!server) return IncomingDataManager.logger.error(`Server ${client.name} not found, something is wrong`)

            const player = data.player

            IncomingDataManager.logger.info(`Player ${player.subRosaID} joined ${client.name}`)

            let dbPlayer = await Core.services.player.findOne({ gameId: player.subRosaID })

            if (!dbPlayer) {
                dbPlayer = Core.services.player.create({
                    phoneNumber: player.phoneNumber,
                    gameId: player.subRosaID,
                    steamId: player.steamID,
                    supporterLevel: 0,
                    firstSeen: new Date(),
                    lastSeen: new Date()
                })
            }

            dbPlayer.lastSeen = new Date()

            const lastName = await dbPlayer.getName()

            if (!lastName || lastName !== player.name) {
                Core.services.nameHistory.create({
                    player: dbPlayer,
                    name: player.name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }

            const currentSession = await Core.services.session.findOne({ player: dbPlayer, server: server, endedAt: null })

            if (!currentSession) {
                Core.services.session.create({
                    player: dbPlayer,
                    server: server,
                    startedAt: new Date(),
                })
            }

            const avatar = await Core.services.avatar.findOne({
                gender: player.gender,
                skinColor: player.skinColor,
                hairColor: player.hairColor,
                hair: player.hair,
                eyeColor: player.eyeColor,
                head: player.head,
            }) || Core.services.avatar.create({
                gender: player.gender,
                skinColor: player.skinColor,
                hairColor: player.hairColor,
                hair: player.hair,
                eyeColor: player.eyeColor,
                head: player.head,
            });

            let avatarHistory = await Core.services.avatarHistory.findOne({
                player: dbPlayer,
                avatar: avatar,
            }) || Core.services.avatarHistory.create({
                player: dbPlayer,
                avatar: avatar,
                createdAt: new Date(),
                updatedAt: new Date(),
            })

            if (avatarHistory.avatar.id !== avatar.id) {
                avatarHistory = Core.services.avatarHistory.create({
                    player: dbPlayer,
                    avatar: avatar,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } else {
                avatarHistory.updatedAt = new Date();
            }

            await Core.services.em.persistAndFlush([dbPlayer, avatar, avatarHistory]);
        })

        DataChannel.subscribeToEvent(this.clientId, "player:leave", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)
            if (!client) return
            const server = ServerManager.getServer(client.name!)

            IncomingDataManager.logger.info(`Player ${data.subRosaID} left ${client.name}`)

            const session = await Core.services.session.findOne({
                player: { gameId: data.subRosaID }, server: {
                    id: server.id
                }, endedAt: null
            }, {
                orderBy: {
                    startedAt: "DESC",
                },
            })

            if (session) {
                session.endedAt = new Date()
                await Core.services.em.flush()
            }
        })

        DataChannel.subscribeToEvent(this.clientId, "player:chat", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)
            if (!client) return
            const server = ServerManager.getServer(client.name!)
            if (!server) return IncomingDataManager.logger.error(`Server ${client.name} not found, something is wrong`)
            const player = await Core.services.player.findOne({ gameId: data.subRosaID })
            if (!player) return

            Core.services.chat.create({
                player: player,
                server: server,
                message: data.message,
                volume: data.volume,
                timestamp: new Date(),
            })

            await Core.services.em.flush()
        })

        DataChannel.subscribeToEvent(this.clientId, "player:list", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)
            if (!client) return
            const server = ServerManager.getServer(client.name!)
            if (!server) return IncomingDataManager.logger.error(`Server ${client.name} not found, something is wrong`)

            const players = data.players
            const timeData = {
                time: data.time,
                sunTime: data.sunTime,
            }

            if (data.players && (data.players.length > 0 || DataStorage.serverInfo[server.id]?.players?.length)) {
                DataStorage.onPlayerListEvent(server, players, timeData)

                // make sure all players have open sessions
                const openSessions = await Core.services.session.find({
                    server: server,
                    endedAt: null,
                    player: {
                        gameId: { $in: players.map(p => p.subRosaID) }
                    }
                }, {
                    populate: ["player"],
                });

                const openPlayerIds = openSessions.map(s => s.player.gameId);
                for (const playerData of players) {
                    if (!openPlayerIds.includes(playerData.subRosaID)) {
                        const dbPlayer = await Core.services.player.findOne({ gameId: playerData.subRosaID });
                        if (dbPlayer) {
                            Core.services.session.create({
                                player: dbPlayer,
                                server: server,
                                startedAt: new Date(),
                            });
                        }
                    }
                }


                const financeData = (await Core.services.finance.find({
                    player: { gameId: { $in: players.map(p => p.subRosaID) } },
                    server: server,
                    timestamp: {
                        $gte: new Date(time("15 m").ago().ms()),
                    }
                })).reduce((acc, finance) => {
                    if (!acc[finance.player.gameId] || acc[finance.player.gameId].timestamp < finance.timestamp) {
                        acc[finance.player.gameId] = finance;
                    }

                    return acc;
                }, {} as Record<number, Finance>);

                await Promise.resolve(data.players.map(async playerData => {
                    const finance = financeData[playerData.subRosaID];
                    if (!finance || finance.money != playerData.money || finance.corporateRating != playerData.corp) {
                        const player = await Core.services.player.findOne({ gameId: playerData.subRosaID });
                        if (!player) return
                        const finance = Core.services.finance.create({
                            player,
                            server,
                            money: playerData.money,
                            corporateRating: playerData.corp,
                            timestamp: new Date(),
                        });

                        Core.services.em.persist(finance);
                    }
                }))

                await Core.services.em.flush();
            }
        })

        DataChannel.subscribeToEvent(this.clientId, "player:finance", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)
            if (!client) return
            const server = ServerManager.getServer(client.name!)
            const player = await Core.services.player.findOne({ gameId: data.subRosaID })
            if (!player) return

            const lastFinance = await Core.services.finance.findOne({
                player,
                server
            }, {
                orderBy: {
                    timestamp: "DESC",
                }
            })

            if (!lastFinance || lastFinance.money !== data.money || lastFinance.corporateRating !== data.corporateRating) {
                const finance = Core.services.finance.create({
                    player: player,
                    server: server,
                    money: data.money,
                    corporateRating: data.corporateRating,
                    timestamp: new Date(),
                })

                await Core.services.em.persistAndFlush(finance);

            }

        })

        MasterserverChannel.subscribeToEvent(this.clientId, "steamauth", async (data) => {
            if (!AuthManager.validateClient(data.sender)) return
            const client = ClientManager.getClient(data.sender)
            if (!client) return

            let dbPlayer = await Core.services.player.findOne({ steamId: data.steamId })

            if (!dbPlayer) {
                dbPlayer = Core.services.player.create({
                    phoneNumber: data.phoneNumber,
                    gameId: data.gameId,
                    steamId: data.steamId,
                    supporterLevel: 0,
                    firstSeen: new Date(),
                    lastSeen: new Date(),
                    ips: []
                });
            }

            dbPlayer.lastSeen = new Date();

            const lastName = await dbPlayer.getName();
            if (!lastName || lastName !== data.name) {
                Core.services.nameHistory.create({
                    player: dbPlayer,
                    name: data.name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            const currentIps = await Core.services.ip.find({
                players: {
                    gameId: dbPlayer.gameId,
                }
            });

            if (!currentIps.map(ip => ip.ip).includes(data.ip)) {
                const ip = await Ip.createFromIpAddress(data.ip, dbPlayer);
                if (ip) {
                    Core.services.em.persist(ip);
                }
            }

            await Core.services.em.persistAndFlush(dbPlayer);
        })
    }
}

