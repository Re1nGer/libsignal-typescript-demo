import { SignalProtocolStore } from '@app/signal/signal-store'
//import { SignalStore }
import { BehaviorSubject } from 'rxjs'
import { SignalDirectory } from '../signal/signal-directory'

export const directorySubject = new BehaviorSubject<SignalDirectory | null>(null)
export const signalStore = new SignalProtocolStore(); //new SignalProtocolStore()
export const usernameSubject = new BehaviorSubject<string>('')
export const peerId = new BehaviorSubject<string>('');
