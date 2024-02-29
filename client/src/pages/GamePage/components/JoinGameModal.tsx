import React, {ChangeEvent, useState} from 'react';
import playerStore from "../../../store/playerStore";
import gameHubClient from "../../../signalr/gameHubClient";
import connectionStore from "../../../store/connectionStore";
import { Button, Modal, Form } from 'react-bootstrap';
import {observer} from "mobx-react-lite";

const JoinGameModal = observer(() => {
    const [show, setShow] = useState(true);
    const [username, setUsername] = useState('');

    const handleClose = () => setShow(false);

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleEnterClick = () => {
        if(username !== ''){
            playerStore.username = username
            gameHubClient.invokeServerMethod
            ('JoinGroup', connectionStore.connectionId, playerStore.username)
            handleClose();
        }
    };

    return (
        <>
            <Modal
                size="sm"
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header>
                    <Modal.Title>Username</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        className='text-lg my-1'
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={handleUsernameChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleEnterClick();
                            }
                        }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' onClick={handleEnterClick}>
                        Enter
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
});

export default JoinGameModal;