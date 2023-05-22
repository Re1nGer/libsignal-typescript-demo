import { useObservable } from '@app/hooks'
import ComposeMessage from '@app/messages/ui/compose-message'
import MessageList from '@app/messages/ui/message-list'
import { currentSessionSubject } from '../state'
import { usernameSubject } from '@app/identity/state'
import React from 'react'
import { processRegularMessage } from '@app/messages/functions'

export default function SessionDetails(): JSX.Element {
    const session = useObservable(currentSessionSubject, null)
    const username = useObservable(usernameSubject, '')
    const [messages, setMessages] = React.useState<any>()

    //const cipher = new SessionCipher(signalStore, new SignalProtocolAddress("test1", 1))
    console.log({ session })

    const clearCurrentSession = () => {
        currentSessionSubject.next(null)
    }

    //const cipher = React.useMemo(() => new SessionCipher(signalStore, new SignalProtocolAddress("test1", 1)), [session?.remoteUsername])

    const decryptAndLog = async (message: any): Promise<void> => {
        try {
            await processRegularMessage('test1', JSON.parse(message.message))
        } catch (error) {
            console.log(error)
        }
    }

    const fetchOldMessages = async () => {
        try {
            const res = await fetch(`http://localhost:5259/messageswith`)

            const messages = await res.json()

            for (const item of messages) {
                console.log(JSON.parse(item.message))
                await decryptAndLog(JSON.parse(item.message))
            }
            //setMessages(res.json());
        } catch (error) {
            console.log(error)
        }
    }

    const decryptMessages = () => {
        for (let item in messages) {
            decryptAndLog(item)
        }
    }

    React.useEffect(() => {
        fetchOldMessages()
    }, [])

    React.useEffect(() => {
        if (messages) decryptMessages()
    }, [messages])

    return (
        (session && (
            <div className="container">
                <h2>
                    Chat: {username} - {session.remoteUsername}
                </h2>
                <button onClick={clearCurrentSession} color="inherit" aria-label="add" className="buttonitem">
                    (Back)
                </button>
                <MessageList messages={session.messages} remoteUserName={session.remoteUsername} />
                <div>
                    <ComposeMessage toUser={session.remoteUsername} />
                </div>
            </div>
        )) || (
            <div>
                <h1>No active session</h1>
                <button onClick={clearCurrentSession} color="inherit" aria-label="add" className="buttonitem">
                    (Back)
                </button>
            </div>
        )
    )
}
