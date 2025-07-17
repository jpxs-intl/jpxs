import { Router } from 'express';
import PlayerManager from '../../../../../data/players/playerManager.js';
import { OrderDefinition, Populate } from '@mikro-orm/core';
import { Player } from '../../../../../../database/entities/player.entity.js';
import Core from '../../../../../core.js';
const playerApiRouter = Router();

export interface PlayerResponse {

}

playerApiRouter.get("/:id", async (req, res) => {

    const { id } = req.params
    const { limit, searchBy } = Object.assign({
        limit: 5,
        searchBy: "auto"
    }, req.query)

    const options:
        {
            populate?: any | Populate<Player>,
            orderBy?: OrderDefinition<Player>,
            limit: number
        } = {
        populate: [
            "nameHistory",
            "sessions",
            "avatarHistory",
            "avatarHistory.avatar"
        ],
        orderBy: {
            lastSeen: "DESC",
            sessions: {
                startedAt: "DESC"
            }
        },
        limit: limit || 5
    }

    let players: Player[]

    if (searchBy == "phone" || (searchBy == "auto" && PlayerManager.regex.isPhone.test(id))) {
        players = await Core.services.player.find({
            phoneNumber: parseInt(id.replace(/-/g, ""))
        }, options)
    } else if (searchBy == "steam" || (searchBy == "auto" && PlayerManager.regex.isSteamId.test(id))) {
        players = await Core.services.player.find({
            steamId: id
        }, options)
    } else if (searchBy == "discord" || (searchBy == "auto" && PlayerManager.regex.isDiscordId.test(id))) {
        players = await Core.services.player.find({
            discordId: id
        }, options)
    } else if (searchBy == "gameid" || (searchBy == "auto" && PlayerManager.regex.isDigits.test(id))) {
        players = await Core.services.player.find({
            gameId: parseInt(id)
        }, options)

        if (players.length == 0) {
            // try phone number as digits in case of abnormal phone number input...
            players = await Core.services.player.find({
                phoneNumber: parseInt(id)
            }, options)
        }
    } else if (searchBy == "name" || searchBy == "auto") {
        players = await Core.services.player.find({
            nameHistory: {
                name: {
                    $ilike: `%${id}%`
                }
            }
        }, options)
    } else {
        return res.json({
            error: "invalid findBy type"
        })
    }

    res.json(
        await Promise.all(
            players.map(async (player) => {

                const lastSession = player.sessions[0]

                return {
                    name: await player.getName(),
                    phoneNumber: player.phoneNumber,
                    gameId: player.gameId,
                    steamId: player.steamId,
                    discordId: player.discordId,
                    firstSeen: player.firstSeen,
                    lastSeen: player.lastSeen,
                    avatar: player.avatarHistory[0]?.avatar,
                    status: {
                        online: !lastSession.end,
                        ...lastSession,
                        id: undefined,
                        player: undefined
                    }
                }
            })
        )
    )
})

export default playerApiRouter;