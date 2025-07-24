import { AutocompleteInteraction } from "discord.js";
import DataStorage from "../../../../server/data/dataStorage.js";
import Util from "../../../../utils/index.js";
import PlayerManager from "../../../../server/data/players/playerManager.js";

export default class Autocomplete {

    public static async servers(interaction: AutocompleteInteraction) {
        const query = interaction.options.getString("server", false);
        const servers = Object.entries(DataStorage.serverInfo).map(([key, value]) => ({
            name: `${value.name} (${value.address}:${value.port}) - ${value.playerCount} players`,
            value: key
        }));

        if (!query) {
            return servers.slice(0, 25);
        }

        return servers
            .filter(server => server.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25);
    }

    public static async players(interaction: AutocompleteInteraction) {
        const query = interaction.options.getString("query", true);

        if (!query) {
            return [
                {
                    name: "Search by name, phone number, steam ID, discord ID, or game ID",
                    value: "4040000"
                }
            ];
        }

        const res = await PlayerManager.findPlayers(query, {
            populate: ["nameHistory"],
            orderBy: { lastSeen: "DESC" },
            limit: 5,
        });

        if (!res) {
            return [];
        }

        return res.map(player => ({
            name: `${player.nameHistory[0]?.name} (${Util.formatPhone(player.phoneNumber)})`,
            value: player.phoneNumber.toString(),
        }));
    }
}