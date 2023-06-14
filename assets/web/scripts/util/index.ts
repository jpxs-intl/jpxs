export default class Util {

    public static capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    public static bound(val: number, min: number, max: number) {
        return Math.max(Math.min(val, max), min)
    }

    public static months: string[] = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];

    public static formatDate(date: Date): string {

        return `${Util.months[date.getMonth()]} ${Util.formatPlace(date.getDate())} ${date.getFullYear()}`
    }

    public static formatPlace(place: number): string {
        if (place == 1) {
            return "1st"
        } else if (place == 2) {
            return "2nd"
        } else if (place == 3) {
            return "3rd"
        } else {
            return `${place}th`
        }
    }

    public static formatTime(date: Date): string {
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
    }

    public static formatDateAndTime(date: Date): string {
        return `${Util.formatDate(date)}, ${Util.formatTime(date)}`
    }
}