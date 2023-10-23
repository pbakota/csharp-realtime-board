import { Renderer } from "./renderer";
import { Vector2d } from "./util";

export type CommandReturnValue = any | void;

export abstract class Engine {

    private _renderer: Renderer;
    private _start: number | undefined;
    private _input: Input;

    constructor(element: string, renderer: Renderer) {
        this._renderer = renderer;
        this._input = new Input(document.getElementById(element) as HTMLElement);
        this._start = undefined;
    }

    protected get displayWidth(): number {
        return this._renderer.display.width;
    }

    protected get displayHeight(): number {
        return this._renderer.display.height;
    }

    public get input(): Input {
        return this._input;
    }

    public abstract update(dt: number): void;

    public abstract draw(ctx: CanvasRenderingContext2D): void;

    public abstract command(cmd: string, args: any): CommandReturnValue;

    public storeLocal(data: any): void {
        if (window.localStorage) {
            window.localStorage.setItem('board', JSON.stringify(data));
        }
    }

    public readLocal(): any {
        if (window.localStorage) {
            return JSON.parse(window.localStorage.getItem('board') as string);
        }
    }

    public get renderer(): Renderer {
        return this._renderer;
    }

    // define this as property
    protected loop = (ts: number): void => {
        window.requestAnimationFrame(this.loop);

        if (!this._start) {
            this._start = ts;
        }
        const dt = (ts - this._start) / 1000.0;
        this._start = ts;

        this.update(dt);
        this.draw(this._renderer.context);
    }

    public run(): void {
        window.requestAnimationFrame(this.loop);
    }
}

interface Key {
    [keyCode: string]: boolean;
}

export class Input {
    private _keys: Key = {};
    private _lastk = InputKey.NO_KEY;
    private _mouseDown: boolean;
    private _mouseMove: Vector2d;

    constructor(element: HTMLElement) {
        window.addEventListener("keydown", (e: any) => {
            this._keys['k' + e.code] = true;
            this._lastk = e.code;
        });

        window.addEventListener("keyup", (e: any) => {
            this._keys['k' + e.code] = false;
            this._lastk = InputKey.NO_KEY;
        });

        element.addEventListener('mousedown', (e: any) => {
            this._mouseDown = true;
        });

        element.addEventListener('mouseup', (e: any) => {
            this._mouseDown = false;
        });

        element.addEventListener('mousemove', (e: any) => {
            this._mouseMove = new Vector2d(e.offsetX, e.offsetY);
        });

        // NOTE: the touchscreen support is still totally broken
        // needs a lot of testing.
        element.addEventListener('touchmove', (e: any) => {
            var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
            var touch = evt.touches[0] || evt.changedTouches[0];
            this._mouseMove = new Vector2d(touch.pageX, touch.pageY);
        });

        element.addEventListener('touchstart', (e: any) => {
            this._mouseDown = true;
        });

        element.addEventListener('touchend', (e: any) => {
            this._mouseDown = false;
        });

        element.addEventListener('touchcancel', (e: any) => {
            this._mouseDown = false;
        });
    }

    isMouseDown = (): boolean => {
        return this._mouseDown;
    }

    mousePos = (): Vector2d => {
        return this._mouseMove;
    }

    isDown = (keyCode: string) => {
        this._lastk = keyCode;
        return this._keys['k' + keyCode] == true;
    };

    isUp = (keyCode: string) => {
        this._lastk = InputKey.NO_KEY;
        return this._keys['k' + keyCode] == false;
    };

    isPressed = (keyCode: string) => {
        var pressed = (this._keys['k' + keyCode] == true);
        this._keys['k' + keyCode] = false;
        return pressed;
    };

    clear = () => {
        this._keys = {};
        this._lastk = InputKey.NO_KEY;
    }

    rawKey = () => {
        if (this._lastk == InputKey.NO_KEY)
            return InputKey.NO_KEY;

        var pressed = (this._keys['k' + this._lastk]) == true;
        this._keys['k' + this._lastk] = false;
        if (pressed)
            return this._lastk;

        return InputKey.NO_KEY;
    }
}

/**
 * Key constants
 */
export const InputKey = {
    NO_KEY: '',
    KEY_LEFT: 'ArrowLeft',
    KEY_DOWN: 'ArrowDown',
    KEY_RIGHT: 'ArrowRight',
    KEY_UP: 'ArrowUp',
    KEY_RETURN: 'Enter',
    KEY_ESCAPE: 'Escape',
    KEY_BS: 'Backspace',
    KEY_SPACE: 'Space',
    KEY_PGDOWN: 'PageDown',
    KEY_PGUP: 'PageUp',
    KEY_FIRE: 'KeyZ',
    KEY_A: 'KeyA',
    KEY_B: 'KeyB',
    KEY_C: 'KeyC',
    KEY_D: 'KeyD',
    KEY_E: 'KeyE',
    KEY_F: 'KeyF',
    KEY_G: 'KeyG',
    KEY_H: 'KeyH',
    KEY_I: 'KeyI',
    KEY_J: 'KeyJ',
    KEY_K: 'KeyK',
    KEY_L: 'KeyL',
    KEY_M: 'KeyM',
    KEY_N: 'KeyN',
    KEY_O: 'KeyO',
    KEY_P: 'KeyP',
    KEY_Q: 'KeyQ',
    KEY_R: 'KeyR',
    KEY_S: 'KeyS',
    KEY_T: 'KeyT',
    KEY_U: 'KeyU',
    KEY_V: 'KeyV',
    KEY_W: 'KeyW',
    KEY_X: 'KeyX',
    KEY_Y: 'KeyY',
    KEY_Z: 'KeyZ',
}