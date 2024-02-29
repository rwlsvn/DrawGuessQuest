import {makeAutoObservable} from "mobx";
import {HubConnection} from "@microsoft/signalr";

class ConnectionStore{
    isConnected: boolean;
    connectionId: string | null;

    constructor() {
        makeAutoObservable(this)
        this.isConnected = false;
        this.connectionId = null;
    }

    setIsConnected(isConnected: boolean){
        this.isConnected = isConnected;
    }

    setConnectionId(connectionId: string){
        this.connectionId = connectionId;
    }
}

export default new ConnectionStore()