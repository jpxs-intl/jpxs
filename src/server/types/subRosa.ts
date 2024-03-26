/**
 * Data sent from jpxs on join
 */
export interface ISubRosaPlayerJoinData {
    phoneNumber: number;
    subRosaID: number;
    steamID: string;
    money: number;
    teamMoney: number;
    corporateRating: number;
    criminalRating: number;
    team: number;
    gender: number;
    skinColor: number;
    hairColor: number;
    hair: number;
    eyeColor: number;
    head: number;
    name: string;
    address: string;
}

/**
 * Data sent from jpxs on join
 */
export interface ISubRosaPlayerUpdateData {
    subRosaID: number;
    money: number;
    teamMoney: number;
    corporateRating: number;
    criminalRating: number;
    team: number;
}
