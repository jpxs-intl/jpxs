export interface PlayerJoinData {
    phoneNumber: number;
    subRosaID: number;
    name: string;
    gender: number;
    skinColor: number
    hairColor: number
    hair: number
    eyeColor: number
    head: number
    steamID: string
}

export interface PlayerListData {
    subRosaID: number
    money: number
    team: number
    budget: number
    corp: number
    crim: number
}
