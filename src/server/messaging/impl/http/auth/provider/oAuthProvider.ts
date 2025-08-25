export default abstract class oAuthProvider {

    private _validStates: Map<string, string | undefined> = new Map()

    public generateState(identifier?: string, key?: string) {
        const state = key || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this._validStates.set(state, identifier)
        return state
    }

    public isValidState(state: string) {
        if (this._validStates.has(state)) {
            const identifier = this._validStates.get(state)
            this._validStates.delete(state)
            return identifier || true
        }
        return false
    }

    public abstract generateOauthUrl(identifier?: string): string | Promise<string>
    public abstract handleCallback(req: any, res: any): void
    public abstract refreshAccessToken(userId: string): void
    public abstract getUserData(userId: string): Promise<UserData>
}

export interface UserData {
    id: string
    displayName: string
    avatarUrl: string
}