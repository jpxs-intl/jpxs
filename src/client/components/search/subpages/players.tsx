import { AuthSession } from "../../../../database/entities/authSession.entity.js";

export default async function SearchPlayers(props: { session: AuthSession; path: string; query?: string }) {
	const { session, path, query } = props;

	return (
		<div class="search-players">
			<h4>Player Search</h4>

			<div class="search-input">
				<input
					type="text"
					name="query"
					placeholder="Search by Name, Phone Number, Steam ID, or Discord ID"
					value={query || ""}
					hx-get={`/component/search.playerResults?path=${path}`}
					hx-trigger="keyup changed delay:300ms"
					hx-target=".player-search-results"
					hx-swap="outerHTML"
					autocomplete="off"
				/>
			</div>
			<div class="player-search-results"></div>
		</div>
	);
}
