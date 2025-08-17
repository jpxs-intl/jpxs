import { Avatar } from "../../../database/entities/avatar.entity.js";

export default async function AvatarDisplay(props: { avatar?: Avatar }) {
	return props.avatar ? (
		<iframe
			src={props.avatar.url({ body: false, embed: true, antiAliasing: true })}
			class="player-avatar"
			// @ts-ignore
			allowTransparency="true"
			background="transparent"
			loading="lazy"
		/>
	) : (
		<div class="no-avatar">No Avatar</div>
	);
}
