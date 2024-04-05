export default class Util {
    public static randomString(length: number): string {
        const strings = Math.ceil(length / 16);
        let str = "";
        for (let i = 0; i < strings; i++) {
            str += Math.random().toString(36).substring(2, 15);
        }

        return str.substring(0, length);
    }
}
