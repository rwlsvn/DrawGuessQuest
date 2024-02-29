import {makeAutoObservable} from "mobx";
import {RefObject} from "react";

class CanvasStore {
    canvas: HTMLCanvasElement | null;

    constructor() {
        makeAutoObservable(this);
        this.canvas = null;
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    setColor(color: string) {
        const ctx = this.canvas?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
        }
    }

    setWidth(width: number) {
        const ctx = this.canvas?.getContext('2d');
        if (ctx) {
            ctx.lineWidth = width;
        }
    }

    clear() {
        const ctx = this.canvas?.getContext('2d');
        if (ctx && this.canvas) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

export default new CanvasStore();
