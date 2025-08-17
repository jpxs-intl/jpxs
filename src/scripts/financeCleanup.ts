// this is all rats world's fault


import "dotenv/config.js";
import loadCsvFile from "./util/csvUtil.js";
import Core from "../server/core.js";
import { Player } from "../database/entities/player.entity.js";
import { Finance } from "../database/entities/finance.entity.js";
import { readFileSync, writeFileSync } from "fs";


// (async () => {

//     await Core.start({
//         dry: true
//     })

//     const finances = await Core.services.finance.findAll({
//         populate: ["player.gameId", "server"]
//     })

//     const playerFinances: Record<number, Finance[]> = finances.reduce((acc, finance) => {
//         const playerId = finance.player.gameId
//         if (!acc[playerId]) {
//             acc[playerId] = []
//         }
//         acc[playerId].push(finance)
//         return acc
//     }, {} as Record<number, Finance[]>)


//     console.log(`loaded ${Object.keys(playerFinances).length} players with finances`)

//     const players = (await Core.services.player.find({
//         gameId: {
//             // @ts-ignore
//             $in: Object.keys(playerFinances) as number[]
//         }
//     })).reduce((acc, player) => {
//         acc[player.gameId] = player
//         return acc
//     }, {} as Record<number, Player>)

//     const realFinances: Finance[] = []

//     for (const gameId in playerFinances) {
//         let lastValues: Record<string, {
//             money: number
//             corporateRating: number
//         }> = {}

//         console.log(`processing finances for player ${gameId}`)

//         for (const finance of playerFinances[gameId]) {
//             const lastServerValue = lastValues[finance.server.id] || {
//                 money: 0,
//                 corporateRating: 0,
//             };
//             if (finance.money !== lastServerValue.money || finance.corporateRating !== lastServerValue.corporateRating) {
//                 lastValues[finance.server.id] = {
//                     money: finance.money,
//                     corporateRating: finance.corporateRating,
//                 };

//                 const newFinance = Core.services.finance.create({
//                     player: players[parseInt(gameId)],
//                     server: finance.server,
//                     money: finance.money,
//                     corporateRating: finance.corporateRating,
//                     timestamp: finance.timestamp,
//                 });

//                 realFinances.push(newFinance);
//             }
//         }

//     }

//     // drop all current finance data
//     writeFileSync("./finances.json", JSON.stringify(realFinances, null, 2))

//     console.log(`processed ${realFinances.length} unique finance entries`)
// })()

(async () => {

    await Core.start({
        dry: true
    })

    console.log("Loading finances from file...")

    const finances = JSON.parse(readFileSync("./finances.json", "utf-8")).map((finance: Finance) => Core.services.finance.create(finance));

    console.log(`loaded ${finances.length} finances from file`)

    // split into groups of 500
    const financeGroups = [];
    for (let i = 0; i < finances.length; i += 500) {
        financeGroups.push(finances.slice(i, i + 500));
    }

    for (const group of financeGroups) {
        await Core.services.em.persistAndFlush(group)
    }

})()