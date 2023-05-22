import { useState } from 'react'

import { createIdentity } from '../functions'

export default function CreateIdentity(): JSX.Element {
    const [username, setUsername] = useState('')
    const [url, setUrl] = useState('http://localhost:5259/temp')
    const [wss, setWss] = useState('ws://localhost:5259/chat')

    const createID = async () => {
        await createIdentity(username, url, wss)
    }

    return (
        <div className="inputset">
            <div className="inputitem">
                <label htmlFor="username" className="label">
                    Username:
                </label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    value={username}
                    onChange={(event) => {
                        setUsername(event.target.value)
                    }}
                />
            </div>
            <div className="inputitem">
                <label htmlFor="url" className="label">
                    REST API URL:
                </label>
                <input
                    type="text"
                    name="url"
                    id="url"
                    value={url}
                    onChange={(event) => {
                        setUrl(event.target.value)
                    }}
                />
            </div>
            <div className="inputitem">
                <label htmlFor="wss" className="label">
                    Websocket URI:
                </label>
                <input
                    type="text"
                    name="wss"
                    id="wss"
                    value={wss}
                    onChange={(event) => {
                        setWss(event.target.value)
                    }}
                />
            </div>
            <div>
                <button onClick={createID} className="buttonitem">
                    Create Identity
                </button>
            </div>
        </div>
    )
}
