import { SubscribeWebSocketMessage, WebSocketMessage } from '@app/network/types'
import { HubConnection } from '@microsoft/signalr'
import { Subscription } from 'rxjs'
import { WebSocketSubject } from 'rxjs/webSocket'

export let signalWebsocket: WebSocketSubject<WebSocketMessage>
let websocketSub: Subscription

export let socketHub: HubConnection;

export function setSignalRWebsocket(ws: HubConnection): void {
    socketHub = ws;
}

export function setSignalWebsocket(sws: WebSocketSubject<WebSocketMessage>): void {
    signalWebsocket = sws
}

export function setWebsocketSubscription(sub: Subscription): void {
    websocketSub = sub
}
export function subscribeWebsocket(username: string): void {
    const wsm: SubscribeWebSocketMessage = {
        action: 'subscribe',
        channels: [username],
    }
    signalWebsocket.next(wsm)
}

export function closeWebsocket(): void {
    websocketSub.unsubscribe()
}
