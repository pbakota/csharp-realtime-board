import { Rect, Vector2d } from "./util";

export interface Drawable {
    position: Vector2d;
    draw(ctx: CanvasRenderingContext2D): void;
}

export interface Moveable {
    id: string;
    velocity: Vector2d;
    update(dt: number): void;
}

export interface Shape extends Drawable, Moveable {
    size: Vector2d;
    color: string;
    border: string;
    isOver(x: number, y: number): boolean;
}

export abstract class Sprite implements Shape {
    id: string;
    size: Vector2d;
    position: Vector2d;
    velocity: Vector2d;
    color: string;
    border: string;

    constructor(id: string, x: number, y: number, width: number, height: number, faceColor: string, borderColor: string) {
        this.id = id;
        this.position = new Vector2d(x, y);
        this.size = new Vector2d(width, height);
        this.velocity = new Vector2d(0, 0);
        this.color = faceColor;
        this.border = borderColor;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract update(dt: number): void;
    public isOver(x: number, y: number): boolean {
        return new Rect(this.position.x, this.position.y, this.size.x, this.size.y).ptInRect(x, y);
    }
}

type RenderCB = (ctx: CanvasRenderingContext2D) => void;

export class ImageCache {
    private _backgroundCache: HTMLCanvasElement;
    private _cached: boolean;

    constructor() {
        this._backgroundCache = document.createElement('canvas') as HTMLCanvasElement;
        this._cached = false;
    }

    public draw(ctx: CanvasRenderingContext2D, render: RenderCB, x: number, y: number) {
        if (this._cached) {
            // draw cached image
            ctx.drawImage(this._backgroundCache, x, y);
        } else {

            // render image
            render(this._backgroundCache.getContext('2d') as CanvasRenderingContext2D);

            // cache it!
            ctx.drawImage(this._backgroundCache, x, y);
            this._cached = true;
        }
    }

    public clear() {
        this._cached = false;
    }
}


export abstract class BufferedSprite extends Sprite {

    protected _imageCache: ImageCache;

    constructor(id: string, x: number, y: number, width: number, height: number, faceColor: string, borderColor: string) {
        super(id, x, y, width, height, faceColor, borderColor);
        this._imageCache = new ImageCache();
    }
}

export class Circle extends BufferedSprite {

    draw(ctx: CanvasRenderingContext2D): void {
        this._imageCache.draw(ctx, (bctx: CanvasRenderingContext2D) => {
            bctx.beginPath();
            bctx.strokeStyle = this.border;
            bctx.lineWidth = 3;
            bctx.fillStyle = this.color;
            bctx.ellipse(this.size.x / 2, this.size.y / 2, this.size.x / 2 - 6, this.size.y / 2 - 6, Math.PI / 4, 0, 2 * Math.PI);
            bctx.fill();
            bctx.stroke();
        }, this.position.x, this.position.y);
    }

    update(dt: number): void {

    }
}

export class Box extends BufferedSprite {

    draw(ctx: CanvasRenderingContext2D): void {
        this._imageCache.draw(ctx, (bctx: CanvasRenderingContext2D) => {
            bctx.beginPath();
            bctx.strokeStyle = this.border;
            bctx.lineWidth = 3;
            bctx.fillStyle = this.color;
            bctx.rect(3, 3, this.size.x-6, this.size.y-6);
            bctx.fill();
            bctx.stroke();
        }, this.position.x, this.position.y);
    }

    update(dt: number): void {

    }
}

export class Triangle extends BufferedSprite {

    draw(ctx: CanvasRenderingContext2D): void {
        this._imageCache.draw(ctx, (bctx: CanvasRenderingContext2D) => {
            bctx.beginPath();
            bctx.strokeStyle = this.border;
            bctx.lineWidth = 3;
            bctx.fillStyle = this.color;
            bctx.moveTo(3, this.size.y-6);
            bctx.lineTo(this.size.x / 2, 3);
            bctx.lineTo(this.size.x - 6, this.size.y - 6);
            bctx.lineTo(3, this.size.y-6);
            bctx.fill();
            bctx.stroke();
        }, this.position.x, this.position.y);
    }

    update(dt: number): void {

    }
}

