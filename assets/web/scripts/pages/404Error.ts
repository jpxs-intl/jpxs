import Main from "..";
import Button from "../components/button";
import { Params } from "../pathParser";

export default function ErrorPageNotFound(params: Params, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = Main.colors.primary;
  ctx.font = `bold 100px ${Main.font}`;
  ctx.textAlign = "center";
  ctx.fillText("404", Main.canvas.width / 2, Main.canvas.height / 2);

  ctx.font = `bold 50px ${Main.font}`;
  ctx.fillText("Page not found", Main.canvas.width / 2, Main.canvas.height / 2 + 100);

  Button(
    {
      x: Main.canvas.width / 2 - 100,
      y: Main.canvas.height / 2 + 150,
      width: 200,
      height: 50,
    },
    "Go back",
    "goBack",
    () => {
      Main.goBack();
    }
  );
}
