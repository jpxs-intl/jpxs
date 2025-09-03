/*
    goldmen = 0,
    monsota = 1,
    oxs = 2,
    nexaco = 3,
    pentacom = 4,
    prodocon = 5,
    megacorp = 6,
    civilian = 17,
    */

export enum GameType {
    Driving = 1,
    Race = 2,
    Round = 3,
    World = 4,
    Elim = 5,
    Coop = 6,
    Versus = 7
}

export const TeamData = {
    0: { name: "Goldmen", color: "#b97418" },
    1: { name: "Monsota", color: "#126f8e" },
    2: { name: "OXS", color: "#ffffff" },
    3: { name: "Nexaco", color: "#a20a0a" },
    4: { name: "Pentacom", color: "#bcb9b2" },
    5: { name: "Prodocon", color: "#71804c" },
    6: { name: "Megacorp", color: "#ffffff" },
    8: { name: "Brownwater", color: "#126f8e" },
    // 17: { name: "Civilian / Spectator", color: "#a0a0a0" }, // backup is civilian
};

export const SpectatorModes = new Set([
    GameType.Round,
    GameType.Elim,
    GameType.Versus,
]);

export const TimerCountdownModes = new Set([
    GameType.Round,
    GameType.Elim,
    GameType.Versus,
]);