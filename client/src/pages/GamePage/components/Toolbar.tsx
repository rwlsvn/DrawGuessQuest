import React, {ChangeEvent, useEffect, useState} from 'react';
import '../styles.css'
import playerStore from "../../../store/playerStore";
import canvasStore from "../../../store/canvasStore";
import gameHubClient from "../../../signalr/gameHubClient";
import connectionStore from "../../../store/connectionStore";
import {observer} from "mobx-react-lite";

const Toolbar = observer(() => {
    const [value, setValue] = useState(1);

    useEffect(() => {
        canvasStore.setColor('#000')
        canvasStore.setWidth(1)
    }, [playerStore.isDrawing]);

    const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10)
        setValue(value);
        canvasStore.setWidth(value)
    };

    return (
        <div className="toolbar w-full h-10 flex items-center">
            <div className="flex justify-between w-full">
                <div className="flex items-center">
                    <button
                        className="clear h-10 w-10 border-2 border-black mr-2 cursor-pointer rounded-2"
                        onClick={() => {
                            canvasStore.clear();
                            gameHubClient.invokeServerMethod(
                                "ClearPainting",
                                connectionStore.connectionId
                            );
                        }}
                    ></button>
                    <input
                        onChange={(e) => canvasStore.setColor(e.target.value)}
                        type="color"
                        className="h-10 w-10 border-2 border-black mr-2 cursor-pointer rounded-2 bg-center bg-no-repeat"
                    />
                </div>

                <div className="flex items-center w-full">
                    <input
                        type="range"
                        className="form-range mx-3 w-full"
                        min="1"
                        max="100"
                        value={value}
                        onChange={handleSliderChange}
                    />
                </div>
            </div>
        </div>
    );

});

export default Toolbar;