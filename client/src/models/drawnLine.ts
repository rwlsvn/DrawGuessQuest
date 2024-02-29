import {Point} from "./point";

export interface DrawnLine {
    color: string;
    width: number;
    isFinished: boolean;
    points: Point[]
}

