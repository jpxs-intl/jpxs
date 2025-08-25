import CallbackChannel from "../callbackChannel.js";

export const StorageChannel = new CallbackChannel<{
    'get': {
        request: {
            key: string,
        },
        response: ({
            success: true,
            value: string,
        } | {
            success: false,
            error: StorageError.NotFound
        })
    },
    'set': {
        request: {
            key: string,
            value: string,
            token?: string
        },
        response: ({
            success: true
        } | {
            success: false,
            error: StorageError.InvalidToken
        })
    },
    'delete': {
        request: {
            key: string,
            token?: string
        },
        response: ({
            success: true
        } | {
            success: false,
            error: StorageError
        })
    }
}>("storage", {
    destroyOnEmpty: false,
    recieveOnly: [
        "jpxs.storageManager"
    ]
})

export enum StorageError {
    NotFound,
    InvalidToken
}