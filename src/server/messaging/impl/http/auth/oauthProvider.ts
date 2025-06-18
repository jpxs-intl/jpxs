export default class oAuthProvider {

    private _validStates: Set<string> = new Set()

    public generateState() {
        const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this._validStates.add(state)
        return state
    }

    public isValidState(state: string) {
        if (this._validStates.has(state)) {
            this._validStates.delete(state)
            return true
        }
        return false
    }
}
