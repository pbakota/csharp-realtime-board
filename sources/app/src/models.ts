import { Vector2d } from "./util";

export interface ActionMessage {
    type: string;
}

export abstract class Message implements ActionMessage {

    type: string;
    boardName: string;

    constructor(type: string, boardName: string) {
        this.type = type;
        this.boardName = boardName;
    }
}

export abstract class ObjectMessage extends Message {

    id: string;

    constructor(type: string, boardName: string, id: string) {
        super(type, boardName);
        this.id = id;
    }
}

export class ObjectMovedMessage extends ObjectMessage {

    position: Vector2d;

    constructor(id: string, boardName: string, position: Vector2d) {
        super("OBJECT_MOVED", boardName, id);
        this.position = position;
    }
}

export class ObjectRemovedMessage extends ObjectMessage {
    constructor(id: string, boardName: string) {
        super("OBJECT_REMOVED", boardName, id);
    }
}

export class ObjectCreateMessage extends ObjectMessage {

    itemType: string;
    position: Vector2d;
    size: Vector2d;

    faceColor: string;
    borderColor: string;
    strokeWidth: number;

    constructor(id: string, boardName: string, itemType: string, position: Vector2d, size: Vector2d,
        faceColor: string, borderColor: string, strokeWidth: number)
    {
        super("OBJECT_CREATED", boardName, id);
        this.position = position;
        this.size = size;
        this.itemType = itemType;
        this.faceColor = faceColor;
        this.borderColor = borderColor;
        this.strokeWidth = strokeWidth;
    }
}

export class UserMessage extends Message {

    user: string;
    message: string;

    constructor(boardName: string, user: string, message: string) {
        super("USER_MESSAGE", boardName);
        this.boardName = boardName;
        this.user = user;
        this.message = message;
    }
}

/* RPC call - API response */

export class ApiResponse<T> {
    body: T;
}

export class BoardItemEntity {
    id: string;
    boardId: string;
    type: string;
    position: Vector2d;
    size: Vector2d;
    faceColor: string;
    borderColor: string;
    strokeWidth: number;
}

export class UserMessageEntity {
    id: string;
    boardId: string;
    user: string;
    message: string;
}
