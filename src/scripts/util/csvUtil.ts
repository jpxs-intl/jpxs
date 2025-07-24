import fs from "fs";
import path from "path";

/**
 * Split a string by commas, handling quoted strings correctly.
 * if the string has a non even number of quotes, include the last part as is.
 */
function smartSplit(str: string): string[] {
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    return str.split(regex).map(s => s.trim().replace(/^"|"$/g, ""));
}


export default function loadCsvFile<T extends string[]>(filePath: string): {
    [K in T[number]]: string;
}[] {
    const csv = fs.readFileSync(path.resolve(filePath), "utf-8");

    if (!csv) {
        throw new Error(`CSV file at ${filePath} is empty or does not exist`);
    }

    const lines = csv.split("\n").filter(line => line.trim() !== "");
    const result: Record<string, string>[] = [];

    if (lines.length === 0) {
        return result as any;
    }

    const headers = smartSplit(lines[0]) as T;
    for (let i = 1; i < lines.length; i++) {
        const values = smartSplit(lines[i]);
        if (values.length !== headers.length) {
            throw new Error(`Row ${i + 1} does not match header length`);
        }
        const row: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j];
        }
        result.push(row);
    }

    return result as any;
}
