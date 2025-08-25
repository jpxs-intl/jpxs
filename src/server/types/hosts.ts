export const Hosts: Record<string, Host> = {
    // jpxs
    "5.161.203.188": {
        name: "JPXS (Core)",
        location: "US East 1 (Ashburn)",
        description: "Managed by the JPXS team."
    },
    "103.60.13.101": {
        name: "JPXS (Node 1)",
        location: "US East 1 (New York)",
        description: "Managed by the JPXS team."
    },
    // ham
    "135.148.53.131": {
        name: "Hambugler",
        location: "US East 2 (Toronto)",
        description: "Managed by the HBWR team."
    },
    // outlaw
    "54.39.131.119": {
        name: "Mr. Outlaw",
        location: "US East 2 (Toronto)",
        description: "Managed by the High Noon team."
    },
    // patrake
    "80.93.60.185": {
        name: "Patrake",
        location: "Russia (Saint Petersburg)",
        description: "Managed by the JPXS team, but not a JPXS owned server."
    },
    // kiki
    "203.29.240.197": {
        name: "Kiki",
        location: "Australia (Perth)",
        description: "Managed by the JPXS team, but not a JPXS owned server."
    },
    // HelloCzech
    // "128.140.70.210": {
    //     name: "HelloCzech",
    //     location: "Germany (Nuremberg)",
    //     description: "Managed by the JPXS team, but not a JPXS owned server."
    // }
}

export interface Host {
    name: string;
    location?: string;
    description: string;
}
