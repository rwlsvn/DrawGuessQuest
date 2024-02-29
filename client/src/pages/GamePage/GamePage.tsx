import React, {useEffect} from 'react';
import {useParams} from "react-router-dom";
import connectionStore from "../../store/connectionStore";
import Modal from "react-bootstrap/Modal";
import gameHubClient from "../../signalr/gameHubClient";
import {observer} from "mobx-react-lite";
import JoinGameModal from "./components/JoinGameModal";
import SetNewRoundModal from "./components/SetNewRoundModal";
import playerStore from "../../store/playerStore";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import RoundInfo from "./components/RoundInfo";
import RoundTimer from "./components/RoundTimer";
import PlayerList from "./components/PlayerList";
import MessageCard from "./components/MessageCard";

const GamePage = observer(() => {
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            connectionStore.setConnectionId(id);
        }

        gameHubClient.startConnection()
            .then(() => {
                connectionStore.setIsConnected(true);
            });

        gameHubClient.onClose(() => {connectionStore.setIsConnected(false)});
        gameHubClient.onReconnecting(() => {connectionStore.setIsConnected(false)});
        gameHubClient.onReconnected(() => {connectionStore.setIsConnected(true)});

        gameHubClient.subscribeToEvent('NotifyPainter', () => {
            playerStore.setIsDrawing(true)
        });

        gameHubClient.subscribeToEvent('NewPainter', () => {
            playerStore.setIsDrawing(false)
            playerStore.setDrawingWord('')
        });

        return () => {
            //gameHubClient.stopConnection();
        };
    }, [id]);

    return (
        <div className="flex items-center justify-center h-screen bg-purple-300">
            <Modal show={!connectionStore.isConnected} backdrop="static" size="sm" centered>
                <Modal.Body>
                   Connection...
                </Modal.Body>
            </Modal>
            {connectionStore.isConnected &&
                <>
                    <JoinGameModal/>
                    <SetNewRoundModal/>
                </>
            }
            <div className='flex border-solid border-3 border-black p-4 rounded-3 bg-purple-400'>
                <div>
                    <div className='flex justify-between mb-2'>
                        <RoundInfo/>
                        <RoundTimer/>
                    </div>
                    <Canvas/>
                    <div className='mt-4'>
                        {playerStore.isDrawing && <Toolbar/>}
                    </div>
                </div>
                <div>
                    <div className='mx-3'>
                        <PlayerList/>
                        <MessageCard/>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default GamePage;