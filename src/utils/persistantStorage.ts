import fs from "fs";
import path from "path";

export default class PersistantStorage {
  public static data: any = {};

  public static isLoaded = false;

  public static load() {
    if (this.isLoaded) return;
    const data = fs.readFileSync(path.resolve("perstance.json"), "utf-8");
    this.data = JSON.parse(data);
    this.isLoaded = true;
  }

  public static save() {
    fs.writeFileSync(path.resolve("perstance.json"), JSON.stringify(this.data));
  }

  public static get<T>(key: string): T {
    const keys = key.split(".");
    let current: any = this.data;
    for (const key of keys) {
      current = current[key];
    }

    return current;
  }

  public static set<T>(key: string, value: T) {
    const keys = key.split(".");
    let current: any = this.data;
    for (const key of keys.slice(0, -1)) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;

    this.save();
  }

  public static has(key: string): boolean {
    const keys = key.split(".");
    let current: any = this.data;
    for (const key of keys) {
      if (!current[key]) return false;
      current = current[key];
    }

    return true;
  }

  public static delete(key: string) {
    const keys = key.split(".");
    let current: any = this.data;
    for (const key of keys.slice(0, -1)) {
      current = current[key];
    }

    delete current[keys[keys.length - 1]];

    this.save();
  }
}
