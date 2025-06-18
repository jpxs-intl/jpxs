import io from "socket.io-client";

const output = document.getElementById("output") as HTMLDivElement;

const channel = document.getElementById("channel") as HTMLInputElement;
const event = document.getElementById("event") as HTMLInputElement;
const data = document.getElementById("data") as HTMLInputElement;
const sendButton = document.getElementById("send") as HTMLButtonElement;

const subscribeChannel = document.getElementById("subscribechannel") as HTMLInputElement;
const subscribeButton = document.getElementById("subscribe") as HTMLButtonElement;

const socket = io({
    path: "/socket",
})

function log(message: string) {
    const logEntry = document.createElement("div");
    logEntry.textContent = message;
    output.appendChild(logEntry);

    // Scroll to the bottom of the output
    window.scrollTo(0, document.body.scrollHeight);
}

function send(channel: string, event: string, data: any) {
    socket.emit(channel, {
        event,
        data
    });
    if (channel !== "ping") log(`<- ${channel}: ${event} ${JSON.stringify(data)}`);
}

socket.onAny((channel: string, message: {
    event: string;
    data: any;
}) => {
    const event = message.event;
    const data = message.data;

    if (channel !== "ping") log(`-> ${channel}: ${event} ${JSON.stringify(data)}`);

    switch (event) {
        case "auth:init": {
            send("auth", "auth:login", {
                type: "auxiliary",
                name: "debug client",
            });

            break;
        }
        case "auth:success": {
            log(`Authenticated as ${data.clientId}`);
            break;
        }
        case "auth:fail": {
            log(`Authentication failed: ${data.error}`);
            break;
        }
        case "auth:invalidate": {
            log(`Authentication invalidated: ${data.clientId}`);
            break;
        }
    }
})

socket.on("connect", () => {
    log("Connected to server");
});

socket.on("disconnect", () => {
    log("Disconnected from server");
});

sendButton.addEventListener("click", () => {
    const channelValue = channel.value;
    const eventValue = event.value;
    const dataValue = data.value;

    if (!channelValue || !eventValue) {
        log("Channel and event are required");
        return;
    }

    let parsedData: any = null;

    try {
        parsedData = JSON.parse(dataValue);
    } catch (e) {
        log(`Invalid JSON: ${e}`);
        return;
    }

    send(channelValue, eventValue, parsedData);
});

subscribeButton.addEventListener("click", () => {
    const channelValue = subscribeChannel.value;

    if (!channelValue) {
        log("Channel is required");
        return;
    }

    send("subscriber", "channel:subscribe", {
        channel: channelValue,
    })

    log(`Subscribed to channel ${channelValue}`);

});

[channel, event, data].forEach(i => i.addEventListener("keydown", e => e.key === "Enter" && sendButton.click()));
subscribeChannel.addEventListener("keydown", e => e.key === "Enter" && subscribeButton.click());