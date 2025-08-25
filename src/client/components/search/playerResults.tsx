import { AuthSession } from "../../../database/entities/authSession.entity.js";
import PlayerManager from "../../../server/data/players/playerManager.js";
import PlayerListItem from "../shared/playerListItem.js";

export default async function PlayerSearchResults(props: { session: AuthSession; query?: string }) {
	const { session, query } = props;

	const results = await PlayerManager.findPlayers(query || "", { limit: 50 });

	return (
		<div class="player-search-results">
			<h4>Search Results</h4>
			{results && results.length > 0 ? (
				<ul>
					{await Promise.all(
						results.map(async (player) => (
							<PlayerListItem
								gameId={player.gameId}
								phoneNumber={player.phoneNumber}
								name={await player.getName()}
							/>
						))
					)}
				</ul>
			) : (
				<p>No players found.</p>
			)}
		</div>
	);
}
