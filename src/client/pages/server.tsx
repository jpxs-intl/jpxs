import { AuthSession } from "../../database/entities/authSession.entity.js";
import { Player } from "../../database/entities/player.entity.js";
import Core from "../../server/core.js";
import DataStorage from "../../server/data/dataStorage.js";
import Util from "../../utils/index.js";
import GlobalLogger from "../../utils/logger.js";
import Logo from "../components/global/logo.js";
import ServerPlayerList from "../components/server/playerList.js";

export default async function ServerPage(props: { session: AuthSession; path: string; id?: string }) {
	const id = props.id || props.path.split("/")[2];

	if (!id) {
		return <div>Server ID is required</div>;
	}

	const server = DataStorage.serverInfo[id];

	if (!server) {
		return <div>Server not found</div>;
	}

	return (
		<div class="server-page container">
			<Logo />
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
						<a class="nav-link" id="boards-tab" data-bs-toggle="tab" href="#boards" role="tab">
							Boards
						</a>
					</li>
				</ul>
			</div>
			<div id="serverTabContent" class="tab-content">
				<div class="tab-pane fade show active" id="players" role="tabpanel">
					<ServerPlayerList session={props.session} path={props.path} id={id} />
				</div>
				<div class="tab-pane fade" id="info" role="tabpanel">
					<div class="server-info">
						<h3>Server Information</h3>
					</div>
				</div>
				<div class="tab-pane fade" id="boards" role="tabpanel">
					<div class="server-boards">
						<h3>Server Boards</h3>
						<p>Coming Soon</p>
					</div>
				</div>
			</div>
		</div>
	);
}
