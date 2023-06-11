export default class Util {
    public static capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    public static bound(val: number, min: number, max: number) {
        return Math.max(Math.min(val, max), min)
    }
}