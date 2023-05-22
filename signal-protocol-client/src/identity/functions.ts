import { initializeSignalRWebsocket } from '@app/messages/api'
import { networkInfoSubject } from '@app/network/state'
import { KeyHelper, PreKeyType, SignedPublicPreKeyType } from '@privacyresearch/libsignal-protocol-typescript'
import { SignalDirectory } from '../signal/signal-directory'
import { directorySubject, signalStore, usernameSubject } from './state'

export async function createIdentity(username: string, url: string, wss: string): Promise<void> {
    const directory = new SignalDirectory(url)
    directorySubject.next(directory)
    usernameSubject.next(username)
    networkInfoSubject.next({ apiURL: url, wssURI: wss })

    //initializeSignalWebsocket(wss)
    initializeSignalRWebsocket();
    //subscribeWebsocket("test");
    

    const registrationId = KeyHelper.generateRegistrationId()
    // Store registrationId somewhere durable and safe... Or do this.
    signalStore.put(`registrationID`, registrationId)
    //console.log(signalStore.get("registrationID", "")?.toString());

    const identityKeyPair = await KeyHelper.generateIdentityKeyPair()
    // Store identityKeyPair somewhere durable and safe... Or do this.
    signalStore.put('identityKey', identityKeyPair)
    console.log('Generated identity key', { identityKeyPair })

    const baseKeyId = Math.floor(10000 * Math.random())
    const preKey = await KeyHelper.generatePreKey(baseKeyId)
    signalStore.storePreKey(`${baseKeyId}`, preKey.keyPair)
    console.log('Generated pre key', { preKey })

    const signedPreKeyId = Math.floor(10000 * Math.random())
    const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId)
    signalStore.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair)
    const publicSignedPreKey: SignedPublicPreKeyType = {
        keyId: signedPreKeyId,
        publicKey: signedPreKey.keyPair.pubKey,
        signature: signedPreKey.signature,
    }

    // Now we register this with the server so all users can see them
    const publicPreKey: PreKeyType = {
        keyId: preKey.keyId,
        publicKey: preKey.keyPair.pubKey,
    }
    directory.storeKeyBundle(username, {
        registrationId,
        identityKey: identityKeyPair.pubKey,
        signedPreKey: publicSignedPreKey,
        oneTimePreKeys: [publicPreKey],
    })
}
