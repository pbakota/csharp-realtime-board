import { BoardScene } from "./boardScene";
import { CommandReturnValue, Engine } from "./engine";
import { Renderer } from "./renderer";
import { BoardSocket } from "./socket";

export class BoardApp extends Engine {
    private _socket: BoardSocket;
    private _scene: BoardScene;

    private _boardName: string;
    private _userName: string;

    constructor(canvasId: string, brokerUrl: string) {
        super(canvasId, new Renderer(canvasId));

        this._scene = new BoardScene(this);
        this._socket = new BoardSocket(brokerUrl, this.wsMessage);
    }

    public get socket(): BoardSocket {
        return this._socket;
    }

    public get boardName(): string {
        return this._boardName;
    }

    public get userName(): string {
        return this._userName;
    }

    public connect(boardName: string, username: string): Promise<void> {
        this._boardName = boardName;
        this._userName = username;

        return this._socket.connect(this._boardName);
    }

    public update(dt: number): void {
        this._scene.update(dt);
        // console.log(1.0 / dt); // fps
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this._scene.draw(ctx);
    }

    public command(cmd: string, ...args: any): Promise<CommandReturnValue> {
        console.log(`Executing cmd: ${cmd}, args: ${args}`);
        return this._scene.command(cmd, args);
    }

    // To receive messages via websocket and forward them to actual scene
    wsMessage = (message: any): void  => {
        this._scene.wsMessage(message);
    }
}
