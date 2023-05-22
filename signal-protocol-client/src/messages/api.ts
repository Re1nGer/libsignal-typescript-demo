import { MessageType } from '@privacyresearch/libsignal-protocol-typescript'
import { Subscription } from 'rxjs'
import { webSocket } from 'rxjs/webSocket'
import { setSignalRWebsocket, setSignalWebsocket, setWebsocketSubscription, signalWebsocket, socketHub } from '@app/network/websocket'
import { processPreKeyMessage, processRegularMessage } from '@app/messages/functions'
import { isSendWebSocketMessage, SendWebSocketMessage, WebSocketMessage } from '@app/network/types'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

export function sendSignalProtocolMessage(to: string, from: string, message: MessageType): void {
    const wsm: SendWebSocketMessage = {
        action: 'sendMessage',
        address: to,
        from,
        message: JSON.stringify(message),
    }
    console.log('sending message to websocket', {wsm})
    signalWebsocket.next(wsm)
}

export async function sendSignalProtocolMessageHub(to: string, from: string, message: MessageType) {
    const wsm: SendWebSocketMessage = {
        action: 'sendMessage',
        address: to,
        from,
        message: JSON.stringify(message),
    }
    console.log('sending message to signal hub', { wsm });
    await socketHub.send("sendMessage", JSON.stringify(wsm), from);
}

export function initializeSignalRWebsocket(): HubConnection {
    console.log('initializing signalR');
    let connection = new HubConnectionBuilder()
    .withUrl("http://localhost:5259/chat")
    .withAutomaticReconnect()
    .build();

    connection.start().then(() => {
        setSignalRWebsocket(connection);

        connection.on("ReceiveMessage", msg => {
            const message = JSON.parse(msg);
            console.log('received message from hub', { message, msg });
            if (isSendWebSocketMessage(message)) {
                processWebsocketMessage(message).catch((e) => {
                    console.warn(`error accepting signal message`, { e })
                })
            } else {
                console.error('Message on wss is not recognized', {msg})
            }

        });
    })

    return connection;
}

export function initializeSignalWebsocket(uri: string): Subscription {
    console.log('initializing websocket', {uri})
    setSignalWebsocket(webSocket<WebSocketMessage>(uri))

    const sub = signalWebsocket.subscribe({
        next: (msg) => {
            console.log(`received message on signal wss`)
            if (isSendWebSocketMessage(msg)) {
                processWebsocketMessage(msg).catch((e) => {
                    console.warn(`error accepting signal message`, { e })
                })
            } else {
                console.error('Message on wss is not recognized', {msg})
            }
        },
        error: (err) => {
            console.error(err)
        },
        complete: () => {
            console.log(`signal websocket complete`)
        },
    })

    setWebsocketSubscription(sub)
    return sub
}

export async function processWebsocketMessage(wsm: SendWebSocketMessage): Promise<void> {
    const signalMessage = JSON.parse(wsm.message) as MessageType
    console.log(`processing signal message`, {signalMessage})
    if (signalMessage.type === 1) {
        await processRegularMessage(wsm.from, signalMessage)
    } else if (signalMessage.type === 3) {
        await processPreKeyMessage(wsm.from, signalMessage)
    }
}
