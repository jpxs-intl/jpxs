import BaseComponent from "./base.component";

export default class RootComponent extends BaseComponent {

    constructor() {
        super("root", null);
        this.element = document.getElementById("app")!;
    }
    
}