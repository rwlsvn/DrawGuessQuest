import {useEffect, useRef, useState} from "react";
import connectionStore from "../../../store/connectionStore";
import gameHubClient from "../../../signalr/gameHubClient";
import {observer} from "mobx-react-lite";

const RoundTimer = observer(() => {
    const [time, setTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        if (connectionStore.isConnected) {
            gameHubClient.subscribeToEvent
                ('RemainingTimeMilliseconds', remainingTimeMillisecondsHandler);
            gameHubClient.subscribeToEvent('RoundStarted', roundStartedHandler);
            gameHubClient.subscribeToEvent('NewTurn', newTurnHandler);

            return () => {
                gameHubClient.unsubscribeFromEvent
                    ('RemainingTimeMilliseconds', remainingTimeMillisecondsHandler);
                gameHubClient.unsubscribeFromEvent('RoundStarted', roundStartedHandler);
                gameHubClient.unsubscribeFromEvent('NewTurn', newTurnHandler);
            };
        }

        return () => {
            stopTimer();
        };
    }, [connectionStore.isConnected]);

    const remainingTimeMillisecondsHandler = (receivedTime: number) => {
        const timeInSeconds = Math.floor(receivedTime / 1000);
        stopTimer();
        startTimer(timeInSeconds);
    };

    const roundStartedHandler = () => {
        const timeInSeconds = Math.floor(100);
        stopTimer();
        startTimer(timeInSeconds);
    };

    const newTurnHandler = () => {
      stopTimer();
    };

    const startTimer = (initialTime: number) => {
        setTime(initialTime);

        intervalRef.current = setInterval(() => {
            setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
    };

    const stopTimer = () => {
        if(intervalRef.current){
            clearInterval(intervalRef.current);
        }
    };

    return <div className='text-lg'>Time: {time}s</div>;
});

export default RoundTimer;