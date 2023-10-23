

export class Renderer {

    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    constructor(canvasId: string) {
        this._canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    public get display(): HTMLCanvasElement {
        return this._canvas;
    }

    public get context(): CanvasRenderingContext2D {
        return this._ctx;
    }
}