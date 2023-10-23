

export class Vector2d {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    x: number;
    y: number;

    public add(v: Vector2d): Vector2d {
        return new Vector2d(this.x + v.x, this.y + v.y);
    }
}

export class Rect {
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    public ptInRect(x: number, y: number): boolean {
        return this.x <= x && x <= this.x + this.w && this.y <= y && y <= this.y + this.h;
    }

    public aabb(rect: Rect): boolean {
        return (
            this.x < rect.x + rect.w &&
            this.x + this.w > rect.x &&
            this.y < rect.y + rect.h &&
            this.h + this.y > rect.y
        );
    }

    x: number;
    y: number;
    w: number;
    h: number;
}


