import React, {LegacyRef, useEffect, useRef} from 'react';
import {observer} from "mobx-react-lite";
import canvasStore from "../../../store/canvasStore";
import connectionStore from "../../../store/connectionStore";
import {DrawnLine} from "../../../models/drawnLine";
import gameHubClient from "../../../signalr/gameHubClient";
import {Point} from "../../../models/point";
import playerStore from "../../../store/playerStore";

const Canvas = observer(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const drawnLineStateRef = useRef<DrawnLine>({
        color: '#000',
        width: 1,
        isFinished: false,
        points: []
    });
    const isDrawingRef = useRef(false);

    useEffect(() => {
        if (canvasRef.current) {
            canvasStore.setCanvas(canvasRef.current);
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctxRef.current = ctx;
                ctxRef.current.lineCap = 'round';
            }
        }

        if (connectionStore.isConnected) {
            gameHubClient.subscribeToEvent('DrawLine', drawLineHandler);
            gameHubClient.subscribeToEvent('DrawPainting', drawPaintingHandler);
            gameHubClient.subscribeToEvent('ClearPainting', clearPaintingHandler);
        }

        return () => {
            gameHubClient.unsubscribeFromEvent('DrawLine', drawLineHandler);
            gameHubClient.unsubscribeFromEvent('DrawPainting', drawPaintingHandler);
            gameHubClient.unsubscribeFromEvent('ClearPainting', clearPaintingHandler);
        };

    }, [connectionStore.isConnected]);

    useEffect(() => {
        ctxRef.current?.beginPath()
        if (playerStore.isDrawing) {
            canvasRef.current?.addEventListener("mousedown", onMouseDown);
            canvasRef.current?.addEventListener("mouseup", onMouseUp);
            canvasRef.current?.addEventListener("mousemove", onMouseMove);

            canvasRef.current?.addEventListener("mouseleave", onMouseUp);

            return () => {
                canvasRef.current?.removeEventListener("mousedown", onMouseDown);
                canvasRef.current?.removeEventListener("mouseup", onMouseUp);
                canvasRef.current?.removeEventListener("mousemove", onMouseMove);
                canvasRef.current?.removeEventListener("mouseleave", onMouseUp);
            };
        }
    }, [playerStore.isDrawing]);

    const drawLineHandler = (drawnLine: DrawnLine) => {
        drawPainting(drawnLine)
    };

    const drawPaintingHandler = (drawnPainting: DrawnLine[]) => {
        drawnPainting.forEach((drawnLine : DrawnLine) => {
            drawPainting(drawnLine)
        });
    };

    const clearPaintingHandler = () => {
        canvasStore.clear()
    };

    const onMouseDown = (e: MouseEvent) => {
        isDrawingRef.current = true

        const target = e.target as HTMLCanvasElement;
        const x = e.pageX - (target?.offsetLeft || 0);
        const y = e.pageY - (target?.offsetTop || 0);

        ctxRef.current?.beginPath();
        drawLine(x, y);

        drawnLineStateRef.current = ({
            color: ctxRef.current!.strokeStyle as string,
            width: ctxRef.current!.lineWidth,
            isFinished: false,
            points: [{x, y}],
        });
        checkDrawingData()
    };

    const onMouseUp = (e: MouseEvent) => {
        if(isDrawingRef.current){
            const target = e.target as HTMLCanvasElement;
            const x = e.pageX - (target?.offsetLeft || 0);
            const y = e.pageY - (target?.offsetTop || 0);
            drawLine(x, y);
            drawnLineStateRef.current = {
                ...drawnLineStateRef.current,
                points: [...drawnLineStateRef.current.points, { x, y }]
            }
            drawnLineStateRef.current = {
                ...drawnLineStateRef.current,
                isFinished: true
            }
            sendDrawingData()
            isDrawingRef.current = false
        }
    };

    const onMouseMove = (e: MouseEvent) => {
        if (isDrawingRef.current) {
            const target = e.target as HTMLCanvasElement;
            const x = e.pageX - (target?.offsetLeft || 0);
            const y = e.pageY - (target?.offsetTop || 0);
            drawLine(x, y);
            drawnLineStateRef.current = {
                ...drawnLineStateRef.current,
                points: [...drawnLineStateRef.current.points, { x, y }]
            }
            checkDrawingData()
        }
    };

    const drawLine = (x: number, y: number) => {
        ctxRef.current?.lineTo(x, y);
        ctxRef.current?.stroke();
        ctxRef.current?.moveTo(x, y);
    };

    const drawPainting = (drawnLine: DrawnLine) => {
        ctxRef.current!.strokeStyle = drawnLine.color;
        ctxRef.current!.lineWidth = drawnLine.width;

        drawnLine.points.forEach((point: Point) => {
            drawLine(point.x, point.y);
        });

        if (drawnLine.isFinished){
            ctxRef.current?.beginPath();
        }
    }

    const checkDrawingData = () => {
        if (drawnLineStateRef.current.points.length > 80) {
            sendDrawingData()
            drawnLineStateRef.current = {
                color: ctxRef.current!.strokeStyle as string,
                width: ctxRef.current!.lineWidth,
                points: [],
                isFinished: false
            };
        }
    }

    const sendDrawingData = () => {
        gameHubClient.invokeServerMethod("DrawLine",
            connectionStore.connectionId, drawnLineStateRef.current)
    }

    return (
        <div
            className="flex justify-center items-center"
        >
            <canvas
                className="border-2 border-black bg-white rounded-lg"
                ref={canvasRef}
                width={450}
                height={450}
            />
        </div>
    );
});

export default Canvas;