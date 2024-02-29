import React, {useEffect, useRef, useState} from 'react';
import connectionStore from "../../../store/connectionStore";
import {observer} from "mobx-react-lite";
import gameHubClient from "../../../signalr/gameHubClient";
import playerStore from "../../../store/playerStore";
import {Modal, Form, Button} from "react-bootstrap";

const SetNewRoundModal = observer(() => {
    const [show, setShow] = useState(false);
    const [winnerName, setWinnerName] = useState('');
    const [showWinner, setShowWinner] = useState(false)
    const [guessedWord, setGuessedWord] = useState('');
    const [word, setWord] = useState('')

    const [time, setTime] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        if (connectionStore.isConnected) {
            gameHubClient.subscribeToEvent('NewTurn', newTurnHandler);
            gameHubClient.subscribeToEvent('NotifyWin', notifyWinHandler);
            gameHubClient.subscribeToEvent('RoundStarted', roundStartedHandler);
        }

        return () => {
            gameHubClient.unsubscribeFromEvent('NewTurn', newTurnHandler);
            gameHubClient.unsubscribeFromEvent('NotifyWin', notifyWinHandler);
            gameHubClient.unsubscribeFromEvent('RoundStarted', roundStartedHandler);

        };
    }, [connectionStore.isConnected]);

    const newTurnHandler = () => {
        setShow(true);
        stopTimer();
        startTimer(10);
    };

    const notifyWinHandler = (winnerName: string, word: string) => {
        setShowWinner(true)
        setWinnerName(winnerName)
        setGuessedWord(word)
    }

    const roundStartedHandler = () => {
        setShow(false)
        setShowWinner(false)
    }

    const handleEnterWordClick = () => {
        if (word !== '') {
            gameHubClient.invokeServerMethod
            ('StartRound', connectionStore.connectionId, word);
            playerStore.setDrawingWord(word);
            setWord('');
            stopTimer();
        }
    };

    const startTimer = (initialTime: number): void => {
        setTime(initialTime);

        intervalRef.current = setInterval(() => {
            setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
    };

    const stopTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    return (
        <Modal
            size="sm"
            show={show}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Body>
                {showWinner && (
                    <div className='my-2'>
                        <div className='text-lg my-1'>Winner: {winnerName}</div>
                        <div className='text-lg my-1'>Guessed Word: {guessedWord}</div>
                    </div>
                )}
                {playerStore.isDrawing ?
                    <div className='my-2'>
                        <Form.Group controlId="formUsername" className='my-2'>
                            <div className='text-lg my-1'>Enter your word:</div>
                            <Form.Control
                                type="text"
                                placeholder="Word"
                                value={word}
                                onChange={e => setWord(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleEnterWordClick();
                                    }
                                }}
                            />
                        </Form.Group>
                        <div className='flex justify-between'>
                            <div>
                                <div className='text-lg'>Time: {time}s</div>
                            </div>
                            <div>
                                <Button variant="primary" onClick={handleEnterWordClick}>
                                    Enter
                                </Button>
                            </div>
                        </div>
                    </div>
                    :
                    <div className='text-lg my-1'>
                        Waiting for painter...
                    </div>
                }
            </Modal.Body>
        </Modal>
    );
});

export default SetNewRoundModal;