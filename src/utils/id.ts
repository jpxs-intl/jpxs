import cuid2 from "@paralleldrive/cuid2";

export default class Id {
    public static get = cuid2.init({
        fingerprint: "absurd",
        length: 10,
    })
}
