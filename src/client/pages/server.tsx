import { ChartData } from "chart.js";
import { AuthSession } from "../../database/entities/authSession.entity.js";
import { Finance } from "../../database/entities/finance.entity.js";
import { Player } from "../../database/entities/player.entity.js";
import Core from "../../server/core.js";
import DataStorage from "../../server/data/dataStorage.js";
import GlobalLogger from "../../utils/logger.js";
import { time } from "../../utils/time.js";
import Breadcrumbs from "../components/global/breadcrumbs.js";
import Logo from "../components/global/logo.js";
import ServerMeta from "../components/global/meta/serverMeta.js";
import { Redirect } from "../components/global/redirect.js";
import ServerPlayerList from "../components/server/playerList.js";
import RoundTimer from "../components/server/roundTimer.js";

export default async function ServerPage(props: { session: AuthSession; path: string; id?: string }) {
	const id = props.id || props.path.split("/")[2];

	if (!id) {
		return <Redirect path="/live/servers" component="live.subpages.liveServer" text="Back to Server List" />;
	}

	const server = DataStorage.serverInfo[id];

	if (!server) {
		return <div>Server not found</div>;
	}

	const finances = await Core.services.finance.find(
		{
			server: {
				id,
			},
			timestamp: {
				$gt: new Date(time("1 d").ago().getTime()),
			},
		},
		{
			orderBy: {
				timestamp: "ASC",
			},
		}
	);

	const playerFinances = finances.reduce((acc, curr) => {
		if (!acc[curr.player.gameId]) {
			acc[curr.player.gameId] = {
				player: curr.player,
				finances: [],
			};
		}

		acc[curr.player.gameId].finances.push(curr);
		return acc;
	}, {} as Record<string, { player: Player; finances: Finance[] }>);

	const labels = Array.from(new Set<Date>(finances.map((f) => f.timestamp)))
		.sort((a, b) => a.getTime() - b.getTime())
		.map((date) => date.getTime());

	const tableData: ChartData<
		"line",
		{
			x: string;
			y: number;
		}[]
	> = {
		datasets: await Promise.all(
			Object.values(playerFinances).map(({ player, finances }) => ({
				name: player.getName(),
				data: finances
					.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
					.map((finance) => ({
						x: finance.timestamp.toISOString(),
						y: finance.money,
					})),
			}))
		),
		labels: labels.map((label) => new Date(label).toISOString()),
	};

	const dataSerial = Buffer.from(JSON.stringify(tableData)).toString("base64");

	return (
		<div class="server-page container">
			<ServerMeta path={props.path} />

			<div class="server-page-header">
				<div class="icon">
					<img
						src={
							(server.icon?.length || 0) > 0 && server.icon !== "<default>"
								? server.icon
								: "https://assets.jpxs.io/img/default/subrosa.png"
						}
						alt="Server Icon"
						class="server-icon"
					/>
				</div>
				<h2 safe>{server.name}</h2>
			</div>
			<div class="info">
				<p safe>
					{(server.description?.length || 0) > 0 && server.description !== "<default>"
						? server.description
						: server.mode?.description || ""}
				</p>
				<div class="tags">
					{server.tags != undefined &&
						server.tags
							.filter((tag) => tag !== "<default>" && tag !== "")
							.map((tag) => {
								return (
									<span class="tag" style={`background-color: ${GlobalLogger.getColor(tag)};`} safe>
										{tag}
									</span>
								);
							})}
				</div>
				<div class="time"></div>
			</div>
			<div class="container">
				<ul class="nav nav-tabs" role="tablist">
					<li class="nav-item" role="presentation">
						<a class="nav-link active" id="players-tab" data-bs-toggle="tab" href="#players" role="tab">
							Player List
						</a>
					</li>
					<li class="nav-item" role="presentation">
						<a class="nav-link" id="info-tab" data-bs-toggle="tab" href="#info" role="tab">
							Server Info
						</a>
					</li>
					<li class="nav-item" role="presentation">
						<a class="nav-link" id="finance-tab" data-bs-toggle="tab" href="#finance" role="tab">
							Finance
						</a>
					</li>
					<li class="nav-item" role="presentation">
						<a class="nav-link" id="boards-tab" data-bs-toggle="tab" href="#boards" role="tab">
							Boards
						</a>
					</li>
					{server.host && (
						<li class="nav-item" role="presentation">
							<a class="nav-link" id="host-tab" data-bs-toggle="tab" href="#host" role="tab">
								Host Info
							</a>
						</li>
					)}
				</ul>
			</div>
			<div id="serverTabContent" class="tab-content">
				<div class="tab-pane fade show active" id="players" role="tabpanel">
					<ServerPlayerList session={props.session} path={props.path} id={id} />
				</div>
				<div class="tab-pane fade" id="info" role="tabpanel">
					<div class="server-info">
						<h3>Server Information</h3>
						{server.networkIdentifier || ""}
					</div>
				</div>
				<div class="tab-pane fade" id="finance" role="tabpanel">
					<div class="server-finance">
						<canvas id={`finance-chart-${id}`} width="400" height="200"></canvas>
						<script>
							{`		
								new Chart(document.getElementById('finance-chart-${id}') , {
									type: "line",
									data: JSON.parse(atob("${dataSerial}")),
								});`}
						</script>
					</div>
				</div>
				<div class="tab-pane fade" id="boards" role="tabpanel">
					<div class="server-boards">
						<h3>Server Boards</h3>
						<p>Coming Soon</p>
					</div>
				</div>
				{server.host && (
					<div class="tab-pane fade" id="host" role="tabpanel">
						<div class="server-host">
							{server.host && (
								<>
									<h4>Host</h4>
									Hosted by {server.host.name}
									<br />
									<span class="text-dark">Located in {server.host.location}</span>
									<br />
									<span class="subtext">{server.host.description}</span>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
