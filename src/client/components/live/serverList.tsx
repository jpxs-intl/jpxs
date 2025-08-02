import DataStorage from "../../../server/data/dataStorage.js";
import Server from "./server.js";

export default async function ServerList() {
	const servers = DataStorage.visible;

	return (
		<div
			class="server-list"
			hx-get="/component/live.serverList?excludePackaged=true"
			hx-trigger="every 15s"
			hx-target=".server-list"
			hx-swap="outerHTML"
		>
			{Object.entries(servers)
				.sort((a, b) => a[1].name.localeCompare(b[1].name))
				.sort((a, b) => b[1].version - a[1].version)
				.sort((a, b) => Number(b[1].jpxs) - Number(a[1].jpxs))
				.sort((a, b) => b[1].playerCount - a[1].playerCount)
				.map(([key, value]) => {
					return <Server data={value} id={key} />;
				})}
		</div>
	);
}
