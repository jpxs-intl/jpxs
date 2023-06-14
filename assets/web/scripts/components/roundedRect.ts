import Main from "..";

export default function RoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    Main.ctx.beginPath();
    Main.ctx.moveTo(x + radius, y);
    Main.ctx.lineTo(x + width - radius, y);
    Main.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    Main.ctx.lineTo(x + width, y + height - radius);
    Main.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    Main.ctx.lineTo(x + radius, y + height);
    Main.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    Main.ctx.lineTo(x, y + radius);
    Main.ctx.quadraticCurveTo(x, y, x + radius, y);
    Main.ctx.closePath();
    Main.ctx.fill();
}   