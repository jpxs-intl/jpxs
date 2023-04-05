export default class Bitfield {

    constructor(private _bitfield: bigint = 0n) {}

    public has(key: bigint): boolean {
        return (this._bitfield & key) === key;
    }

    public add(key: bigint): void {
        this._bitfield |= key;
    }

    public remove(key: bigint): void {
        this._bitfield &= key;
    }

    public get bitfield(): bigint {
        return this._bitfield;
    }

    public set bitfield(value: bigint) {
        this._bitfield = value;
    }

}
