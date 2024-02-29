import {HubConnection, HubConnectionBuilder, HubConnectionState} from "@microsoft/signalr";

class GameHubClient {
    private connection: HubConnection;
    private onCloseCallbacks: (() => void)[] = [];
    private onReconnectingCallbacks: (() => void)[] = [];
    private onReconnectedCallbacks: (() => void)[] = [];

    constructor() {
        this.connection = new HubConnectionBuilder()
            .withUrl('https://localhost:7007/game')
            .withAutomaticReconnect()
            .build();
    }

    startConnection = async (): Promise<void> => {
        await new Promise<void>(async (resolve, reject) => {
            try {
                await this.connection.start();
                console.log('SignalR Connected!');
                resolve(); // Resolve the promise after successful connection
            } catch (err) {
                console.error('Error connecting to SignalR:', err);
                reject(err); // Reject the promise in case of an error
            }
        });

        this.connection.onreconnecting(() => {
            this.onReconnectingCallbacks.forEach(callback => callback());
            console.log('SignalR Reconnecting...');
        });

        this.connection.onreconnected(() => {
            this.onReconnectedCallbacks.forEach(callback => callback());
            console.log('SignalR Reconnected!');
        });

        this.connection.onclose((error) => {
            this.onCloseCallbacks.forEach(callback => callback());
        });
    };

    stopConnection = async () => {
        try {
            await this.connection.stop();
            console.log('SignalR Disconnected!');
        } catch (err) {
            console.error('Error disconnecting from SignalR:', err);
        }
    };

    subscribeToEvent = (eventName: string, callback: (...args: any[]) => void) => {
        this.connection.on(eventName, callback);
    };

    unsubscribeFromEvent = (eventName: string, callback: (...args: any[]) => void) => {
        this.connection.off(eventName, callback);
    };

    invokeServerMethod = (methodName: string, ...args: any[]) => {
        if (this.connection.state === HubConnectionState.Connected) {
            this.connection.invoke(methodName, ...args)
                .catch(error => console.error(`Error invoking ${methodName}:`, error));
        } else {
            console.warn(`Connection not in the Connected state. Unable to invoke ${methodName}.`);
        }
    };

    public onClose = (callback: () => void) => {
        this.onCloseCallbacks.push(callback);
    };

    public onReconnecting = (callback: () => void) => {
        this.onReconnectingCallbacks.push(callback);
    };

    public onReconnected = (callback: () => void) => {
        this.onReconnectedCallbacks.push(callback);
    };
}

export default new GameHubClient()