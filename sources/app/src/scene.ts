import { CommandReturnValue } from "./engine";

export interface Scene {
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    command(cmd: string, args: any): CommandReturnValue;
    wsMessage(message: any): void;
}