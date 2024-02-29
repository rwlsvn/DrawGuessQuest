import {useEffect, useState} from "react";
import gameHubClient from "../../../signalr/gameHubClient";
import playerStore from "../../../store/playerStore";
import {observer} from "mobx-react-lite";

const RoundInfo = observer(() => {
    const [painter, setPainter] = useState('');
    const [wordLength, setWordLength] = useState(0)

    useEffect(() => {
        gameHubClient.subscribeToEvent('NewPainter', newPainterHandler);
        gameHubClient.subscribeToEvent('NotifyPainter', notifyPainterHandler);
        gameHubClient.subscribeToEvent('SetWord', setWordHandler);

        return () => {
            gameHubClient.unsubscribeFromEvent('NewPainter', newPainterHandler);
            gameHubClient.unsubscribeFromEvent('NotifyPainter', notifyPainterHandler);
            gameHubClient.unsubscribeFromEvent('SetWord', setWordHandler);
        };
    }, []);

    const newPainterHandler = (painterName: string) => {
        setPainter(painterName);
    };

    const notifyPainterHandler = () => {
        setPainter('You');
    };

    const setWordHandler = (letterCount: number) => {
        setWordLength(letterCount);
    };

    return (
        <div>
            <span className='text-lg'>Painter: {painter}</span>
            {playerStore.isDrawing ? (
                <span className='mx-4 text-lg'>Word: {playerStore.drawingWord}</span>
            ) : (
                <span className='mx-4 text-lg'>Word Length: {wordLength}</span>
            )}
        </div>
    );

});

export default RoundInfo;