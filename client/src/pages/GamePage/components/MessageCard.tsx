import React, {useEffect, useRef, useState} from 'react';
import connectionStore from "../../../store/connectionStore";
import gameHubClient from "../../../signalr/gameHubClient";
import {Message} from "../../../models/message";
import {observer} from "mobx-react-lite";

const MessageCard = observer(() => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (connectionStore.isConnected) {
            gameHubClient.subscribeToEvent('ReceiveMessage', receiveMessageHandler);
            gameHubClient.subscribeToEvent('NewTurn', newTurnHandler);
        }

        return () => {
            gameHubClient.unsubscribeFromEvent('ReceiveMessage', receiveMessageHandler);
            gameHubClient.unsubscribeFromEvent('NewTurn', newTurnHandler);
        };
    }, [connectionStore.isConnected]);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const receiveMessageHandler = (message: string, username: string) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { message: message, username: username },
        ]);
    };

    const newTurnHandler = () => {
        setMessages([]);
    };


    const sendMessage = () => {
        if (inputMessage) {
            gameHubClient.invokeServerMethod(
                'SendMessage',
                connectionStore.connectionId,
                inputMessage
            );
            setInputMessage('');
        }
    };

    return (
        <div className='border-solid border-3 border-black rounded-3 bg-purple-300 my-2'>
            <div className='w-64 h-60 px-3 overflow-auto' ref={messageContainerRef}>
                {messages && messages.length > 0 && (
                    messages.map((message, index) => (
                        <div key={index} className="">
                            <strong>{message.username}</strong>: {message.message}
                        </div>
                    ))
                )}
            </div>
            <div className='p-2 flex items-center'>
                <input
                    className="h-10 p-1 rounded border border-black"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder="Type your message..."
                />
                <button
                    className="send h-10 w-10 border-2 border-black rounded-3 cursor-pointer ml-4"
                    onClick={sendMessage}
                ></button>
            </div>
        </div>
    );
});

export default MessageCard;