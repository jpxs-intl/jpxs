import Main from "..";
import AreaHandler from "../areaHandler";

export default function Button(position: {
    x: number,
    y: number,
    width: number,
    height: number
}, text: string, id: string, onClick: () => void) {

    const area = new AreaHandler(id, position.x, position.y, position.width, position.height);
    area.onClick = onClick;

    Main.ctx.save()

    Main.ctx.fillStyle = area.isHovered ? Main.colors.muted : Main.colors.background2;
    Main.ctx.fillRect(position.x, position.y, position.width, position.height);

    Main.ctx.fillStyle = Main.colors.primary;
    Main.ctx.font = `20px ${Main.font}`;
    Main.ctx.textAlign = "center";
    Main.ctx.fillText(text, position.x + position.width / 2, position.y + position.height / 2 + 5);

    Main.ctx.restore()

   
}