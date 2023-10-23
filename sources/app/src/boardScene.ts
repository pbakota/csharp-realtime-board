import { v4 as uuidv4 } from 'uuid';
import { Box, Circle, Shape, Triangle } from "./items";
import { Scene } from "./scene";
import { Input } from './engine';
import { Vector2d } from './util';
import { BoardApp } from './app';
import { ActionMessage, ApiResponse, BoardItemEntity, ObjectCreateMessage, ObjectMovedMessage, ObjectRemovedMessage, UserMessage, UserMessageEntity } from './models';

export interface NoParamCallback {
    (): void;
}

export class BoardScene implements Scene {

    private _app: BoardApp;
    private _input: Input;
    private _shapes: Shape[];
    private _selected: Shape | null;
    private _canvasWidth: number;
    private _canvasHeight: number;
    private _insertNewPosition: Vector2d;
    private _offset: Vector2d;
    private _removeSelected: boolean;

    constructor(app: BoardApp) {

        this._app = app;
        this._input = app.input;
        this._shapes = [];

        this._canvasWidth = this._app.renderer.display.width;
        this._canvasHeight = this._app.renderer.display.height;

        this._insertNewPosition = new Vector2d(this._canvasWidth / 2, this._canvasHeight / 2);

        this._selected = null;
        this._removeSelected = false;
    }

    public update(dt: number): void {
        const mouse = this._input.mousePos();
        if (this._input.isMouseDown()) {
            if (this._selected == null) {
                this._shapes.forEach(shape => {
                    if (shape.isOver(mouse.x, mouse.y)) {
                        if (this._selected?.id != shape.id) {
                            this._offset = new Vector2d(shape.position.x - mouse.x, shape.position.y - mouse.y);
                            this._selected = shape;
                            console.log(`Selected ${shape.id}`);
                            return;
                        }
                    }
                });
                if (this._selected != null && this._removeSelected) {
                    this._app.socket.sendMessage(new ObjectRemovedMessage((this._selected as Shape).id, this._app.boardName));
                    this._selected = null;
                }
                this._removeSelected = false;
            }

            if (this._selected != null) {
                this._selected.position = mouse.add(this._offset);
                this._app.socket.sendMessage(new ObjectMovedMessage(this._selected.id, this._app.boardName, this._selected.position));
            }
        } else {
            this._selected = null;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this._shapes.forEach(s => {
            s.draw(ctx);
        });
    }

    private addShapeToBoard(bi: BoardItemEntity) {
        let newShape: Shape;
        switch (bi.type) {
            case 'CIRCLE': {
                newShape = new Circle(bi.id, bi.position.x, bi.position.y, bi.size.x, bi.size.y, bi.faceColor, bi.borderColor);
            } break;
            case 'RECT': {
                newShape = new Box(bi.id, bi.position.x, bi.position.y, bi.size.x, bi.size.y, bi.faceColor, bi.borderColor);
            } break;
            case 'TRIANGLE': {
                newShape = new Triangle(bi.id, bi.position.x, bi.position.y, bi.size.x, bi.size.y, bi.faceColor, bi.borderColor);
            } break;
            default:
                throw "Invalid shape";
        }
        this._shapes.push(newShape);
    }

    private addUserMessageToChat(user: string, message: string) {
        const messageOutput = (document.getElementById('message-output') as HTMLElement).getElementsByTagName('tbody')[0];
        const newRow = messageOutput.insertRow();
        const newCol = newRow.insertCell();
        newRow.style.cssText = 'th-lg';
        newCol.innerHTML = `<em>${user} say</em>: ${message}`;
        messageOutput.appendChild(newRow);
    }

    public async command(cmd: string, args: any) {

        if (/^add\-/.test(cmd)) {
            // add commands
            let shapeType: string;
            let position: Vector2d = new Vector2d(this._insertNewPosition.x, this._insertNewPosition.y);
            let size: Vector2d = new Vector2d(100, 100);
            switch (cmd) {
                case 'add-circle':
                    shapeType = 'circle';
                    break;
                case 'add-rect':
                    shapeType = 'rect';
                    break;
                case 'add-triangle':
                    shapeType = 'triangle';
                    break;
                default:
                    throw "Invalid add command";
            }

            const faceColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            const borderColor = 'black';
            const strokeWidth = 3;

            this._app.socket.sendMessage(new ObjectCreateMessage(uuidv4(), this._app.boardName, shapeType, position, size,
                faceColor, borderColor, strokeWidth));

        } else {
            // all other commands
            switch (cmd) {
                case 'refresh-board':
                    await this.refreshBoard().catch(e => console.error(e));
                    break;
                case 'refresh-content':
                    await this.refreshContent(args[0]).catch(e => console.error(e));
                    break;
                case 'remove-selected':
                    this._removeSelected = true;
                    break;
                case 'send-message':
                    this._app.socket.sendMessage(new UserMessage(this._app.boardName, args[0], args[1]));
                    break;
                default:
                    throw "Invalid command";
            }
        }
    }

    public async refreshBoard(): Promise<void> {
        this._shapes = [];
        const response = await this._app.socket.rpcCall<ApiResponse<BoardItemEntity[]>>('get-board-items', this._app.boardName);
        console.log(response);
        response.body.forEach(bi => {
            this.addShapeToBoard(bi);
        });
    }

    public async refreshContent(refreshDoneCallback: NoParamCallback | undefined = undefined): Promise<void> {
        await this.refreshBoard();
        const response = await this._app.socket.rpcCall<ApiResponse<UserMessageEntity[]>>('get-board-messages', this._app.boardName);
        response.body.forEach(messageEntity => {
            this.addUserMessageToChat(messageEntity.user, messageEntity.message);
        });
        // To scroll to the bottom
        const messageOutput = (document.getElementById('message-output') as HTMLElement).getElementsByTagName('tbody')[0];
        messageOutput.scrollTop = messageOutput.scrollHeight;

        // the callback when everything has done
        if (refreshDoneCallback) refreshDoneCallback();
    }

    public wsMessage(message: ActionMessage): void {
        switch (message.type) {
            case 'OBJECT_CREATED': {
                const msg = message as ObjectCreateMessage;
                let newShape: Shape;
                switch (msg.itemType.toUpperCase()) {
                    case 'CIRCLE':
                        newShape = new Circle(msg.id, msg.position.x, msg.position.y, msg.size.x, msg.size.y, msg.faceColor, msg.borderColor);
                        break;
                    case 'RECT':
                        newShape = new Box(msg.id, msg.position.x, msg.position.y, msg.size.x, msg.size.y, msg.faceColor, msg.borderColor);
                        break;
                    case 'TRIANGLE':
                        newShape = new Triangle(msg.id, msg.position.x, msg.position.y, msg.size.x, msg.size.y, msg.faceColor, msg.borderColor);
                        break;
                    default:
                        throw "Invalid shape";
                }
                this._shapes.push(newShape);
            } break;
            case 'OBJECT_REMOVED': {
                const msg = message as ObjectRemovedMessage;
                this._shapes = this._shapes.filter(s => s.id != msg.id);
            } break;
            case 'OBJECT_MOVED': {
                const obj = message as ObjectMovedMessage;
                let shape = this._shapes.find(value => value.id == obj.id);
                if (shape) {
                    shape.position = obj.position;
                }
            } break;
            case 'USER_MESSAGE': {
                const msg = message as UserMessage;
                this.addUserMessageToChat(msg.user, msg.message);
                // To scroll to the bottom
                const messageOutput = (document.getElementById('message-output') as HTMLElement).getElementsByTagName('tbody')[0];
                messageOutput.scrollTop = messageOutput.scrollHeight;
            } break;
            default:
                console.error(message);
                throw `Invalid message type ${message.type}`;
        }
    }
}