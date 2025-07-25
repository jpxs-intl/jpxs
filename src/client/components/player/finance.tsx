import { Finance } from "../../../database/entities/finance.entity.js";
import { Server } from "../../../database/entities/server.entity.js";

export default async function PlayerServerFinance(props: { server: Server; finances: Finance[] }) {
	const latestFinance = props.finances[0];

	return (
		<div class="tab-pane fade" id={props.server.id} role="tabpanel">
			<h3>{await props.server.getName()}</h3>
			<h4>${latestFinance.money.toLocaleString()}</h4>
			<h4>{latestFinance.corporateRating} corp</h4>
		</div>
	);
}
