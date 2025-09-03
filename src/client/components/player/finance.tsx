import { ChartData } from "chart.js";
import { Finance } from "../../../database/entities/finance.entity.js";
import { Server } from "../../../database/entities/server.entity.js";
import Core from "../../../server/core.js";
import DataStorage from "../../../server/data/dataStorage.js";
import { GameType } from "../../shared/gameData.js";

export default async function PlayerServerFinance(props: {
	gameId: string;
	serverId: string;
	count?: number;
	after?: number;
}) {
	let lastValues = {
		money: 0,
		corporateRating: 0,
	};

	const finances = (
		await Core.services.finance.find(
			{
				player: {
					gameId: parseInt(props.gameId),
				},
				server: {
					id: props.serverId,
				},
				timestamp: {
					$gt: new Date(props.after || 0),
				},
			},
			{
				orderBy: {
					timestamp: "ASC",
				},
			}
		)
	).filter((f) => {
		if (f.money !== lastValues.money || f.corporateRating !== lastValues.corporateRating) {
			lastValues = {
				money: f.money,
				corporateRating: f.corporateRating,
			};
			return true;
		}
		return false;
	});

	const tableData: ChartData<"line", [number, number][]> = {
		datasets: [
			{
				label: "Money",
				data: finances.map((f) => [f.timestamp.getTime(), f.money]),
			},
			DataStorage.serverInfo[props.serverId]?.gameType == GameType.Round && {
				label: "Corporate Rating",
				data: finances.map((f) => [f.timestamp.getTime(), f.corporateRating]),
			},
		].filter(Boolean) as {
			label: string;
			data: [number, number][];
		}[],
		labels: finances.map((f) => f.timestamp.toISOString()),
	};

	const dataSerial = Buffer.from(JSON.stringify(tableData)).toString("base64");

	return (
		<>
			<canvas id={`finance-chart-${props.serverId}`} width="400" height="200"></canvas>
			<script>
				{`		
				new Chart(document.getElementById('finance-chart-${props.serverId}') , {
					type: "line",
					data: JSON.parse(atob("${dataSerial}")),
				});`}
			</script>
		</>
	);
}
