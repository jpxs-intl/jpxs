import Main from "..";
import RoundedRect from "./roundedRect";

export default function Tooltip(position: {
    x: number;
    y: number;
    width: number;
    height: number;
}, render: (position: {
    x: number;
    y: number;
}) => void) {
    // draw tooltip
    Main.ctx.fillStyle = Main.colors.background2;
    
    RoundedRect(position.x, position.y, position.width, position.height, 10);

    // draw tooltip content
    Main.ctx.fillStyle = Main.colors.primary;
    Main.ctx.font = `10px ${Main.font}`;
    Main.ctx.textAlign = "left";

    render({
        x: position.x + 10,
        y: position.y + 10,
    });

    // draw tooltip arrow
    Main.ctx.fillStyle = Main.colors.background2;

    Main.ctx.beginPath();
    Main.ctx.moveTo(position.x + position.width / 2 - 5, position.y + position.height);
    Main.ctx.lineTo(position.x + position.width / 2 + 5, position.y + position.height);
    Main.ctx.lineTo(position.x + position.width / 2, position.y + position.height + 10);
    Main.ctx.closePath();
    Main.ctx.fill();

    // draw tooltip border
    Main.ctx.strokeStyle = Main.colors.primary;
    Main.ctx.lineWidth = 2;

    Main.ctx.beginPath();
    Main.ctx.moveTo(position.x, position.y);
    Main.ctx.lineTo(position.x + position.width, position.y);
    Main.ctx.lineTo(position.x + position.width, position.y + position.height);
    Main.ctx.lineTo(position.x, position.y + position.height);
    Main.ctx.closePath();
    Main.ctx.stroke();

}