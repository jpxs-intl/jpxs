export default class BaseComponent {
  children: BaseComponent[] = [];
  element: HTMLElement | null = null;

  constructor(public name: string, public parent: any = null) {
    if (parent) {
      parent.addChild(this);
    }
  }

  public addChild(child: BaseComponent): void {
    this.children.push(child);
  }

  public removeChild(child: BaseComponent): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  public update(): void {
    this.children.forEach((child) => {
      child.update();
    });
  }

  public render(): void {
    this.children.forEach((child) => {
      child.render();
    });

    if (this.parent && this.element) {
      this.parent.element?.appendChild(this.element);
    }
  }

  public destroy(): void {
    this.children.forEach((child) => {
      child.destroy();
    });
  }
}
