import Main from ".";

export class AreaHandlerManager {
  private static _instance: AreaHandlerManager;
  public areas: Record<string, AreaHandler> = {};

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  public registerArea(area: AreaHandler) {
    this.areas[area.name] = area;
  }

  public getArea(name: string) {
    return this.areas.hasOwnProperty(name) ? this.areas[name] : null;
  }

  public onMouseMove() {
    for (const area of Object.values(this.areas)) {
      area.handleMouseMove(Main.mouse.x, Main.mouse.y);
    }
  }

  public onMouseClick() {
    for (const area of Object.values(this.areas)) {
      area.handleMouseClick(Main.mouse.x, Main.mouse.y);
    }
  }

  public unregisterAll() {
    this.areas = {};
  }
}

export default class AreaHandler {
  public name: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public onEnter: () => void = () => {};
  public onExit: () => void = () => {};
  public onClick: () => void = () => {};

  public whileIn: () => void = () => {};

  public constructor(name: string, x: number, y: number, width: number, height: number) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    AreaHandlerManager.instance.registerArea(this);
  }

  public handleMouseMove(x: number, y: number) {
    if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height) {
      this.whileIn();
    }
  }

  public handleMouseClick(x: number, y: number) {
    if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height) {
      this.onClick();
    }
  }

  public get isHovered() {
    return (
      Main.mouse.x >= this.x &&
      Main.mouse.x <= this.x + this.width &&
      Main.mouse.y >= this.y &&
      Main.mouse.y <= this.y + this.height
    );
  }

  public get isClicked() {
    return Main.mouse.down && this.isHovered;
  }
}
