import { ChartData } from "chart.js";
import { Finance } from "../../../database/entities/finance.entity.js";
import { Server } from "../../../database/entities/server.entity.js";
import Core from "../../../server/core.js";

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
				// limit: props.count || 100,
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
			{
				label: "Corporate Rating",
				data: finances.map((f) => [f.timestamp.getTime(), f.corporateRating]),
			},
		],
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
