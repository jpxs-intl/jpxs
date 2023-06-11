import Main from "..";

let fpsAverages: number[] = [];

export function updateFps() {
    fpsAverages.push(Main.fps);
    if (fpsAverages.length > 100) {
        fpsAverages.shift();
    }
}

export function getFps() {
    return fpsAverages.reduce((a, b) => a + b, 0) / fpsAverages.length;
}

export default function Taskbar() {

    // don't show taskbar on mobile
    if (Main.isMobile) return;

    Main.ctx.fillStyle = Main.colors.muted;

    const height = 30;

    Main.ctx.fillRect(0, 0, Main.canvas.width, height);

    Main.ctx.fillStyle = Main.colors.primary;

    Main.ctx.font = `20px ${Main.font}`;
    Main.ctx.textAlign = "left";

    Main.ctx.fillText("JPXS", 5, height / 2 + 5);

    // draw clock, fps, and ping to the right

    Main.ctx.textAlign = "right";

    let rightTaskbarItems: string[] = [];

    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    updateFps()

    rightTaskbarItems.push(Math.round(getFps()).toString())
    rightTaskbarItems.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)

    Main.ctx.fillText(rightTaskbarItems.join(` | `), Main.canvas.width - 5, height / 2 + 5);



}