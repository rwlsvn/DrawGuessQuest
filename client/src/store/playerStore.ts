import {makeAutoObservable} from "mobx";

class PlayerStore {
    username: string | null
    isDrawing: boolean
    drawingWord: string | null

    constructor() {
        makeAutoObservable(this)
        this.username = null;
        this.isDrawing = false;
        this.drawingWord = null;
    }

    setUsername(username: string) {
        this.username = username;
    }

    setIsDrawing(isDrawing: boolean) {
        this.isDrawing = isDrawing;
    }

    setDrawingWord(drawingWord: string) {
        this.drawingWord = drawingWord;
    }
}

export default new PlayerStore()