import BaseComponent from "./base.component";

export default class Container<Parent> extends BaseComponent {

    constructor(public name: string, public parent: Parent) {
        super(name, parent);
        this.element = document.createElement("div");
        this.element.classList.add("container");
    }

}