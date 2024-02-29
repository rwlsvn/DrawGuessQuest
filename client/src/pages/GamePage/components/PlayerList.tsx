import React, {useEffect, useState} from 'react';
import connectionStore from "../../../store/connectionStore";
import gameHubClient from "../../../signalr/gameHubClient";
import {Player} from "../../../models/player";
import {observer} from "mobx-react-lite";

const PlayerList = observer(() => {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (connectionStore.isConnected) {
            gameHubClient.subscribeToEvent('PlayersInfo', playersInfoHandler);
            gameHubClient.subscribeToEvent('PlayerJoinGame', playerJoinGameHandler);
            gameHubClient.subscribeToEvent('PlayerLeftGame', playerLeftGameHandler);
        }

        return () => {
            gameHubClient.unsubscribeFromEvent('PlayersInfo', playersInfoHandler);
            gameHubClient.unsubscribeFromEvent('PlayerJoinGame', playerJoinGameHandler);
            gameHubClient.unsubscribeFromEvent('PlayerLeftGame', playerLeftGameHandler);
        };
    }, [connectionStore.isConnected]);

    const playersInfoHandler = (players: Player[]) => {
        setPlayers(players);
    };

    const playerJoinGameHandler = (player: Player) => {
        setPlayers((prevPlayers) => [...prevPlayers, player]);
    };

    const playerLeftGameHandler = (playerId: string) => {
        setPlayers((prevPlayers) =>
            prevPlayers.filter((player) => player.id !== playerId)
        );
    };

    return (
        <div className='border-solid border-3 border-black rounded-3 bg-purple-300 my-2'>
            <h4 className='text-center mb-2'>Players</h4>
            <div className='w-64 h-48 px-3 overflow-auto'>
                {players && players.length > 0 && (
                    <div>
                        {players.map((player) => (
                            <div key={player.id} className='flex justify-between mb-2'>
                                <div>{player.username}</div>
                                <div>{player.score}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default PlayerList;