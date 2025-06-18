import { AuthSession } from "../../../database/entities/authSession.entity.js";

export default async function (props: { session: AuthSession; path: string }) {
	return (
		<head>
			<link rel="stylesheet" href="/static/index.css" />

			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
			<link
				href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
				rel="stylesheet"
			/>

			<link rel="stylesheet" href="/_/global.css" />

			<script src="https://unpkg.com/htmx.org@2.0.4"></script>

			<title>
				{(() => {
					const parts = props.path.split("/");
					switch (parts[1]) {
						case "":
							return "JPXS | home";
						case "live":
							return "jpxs | live";
						default:
							return "jpxs | " + parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
					}
				})()}
			</title>
		</head>
	);
}
