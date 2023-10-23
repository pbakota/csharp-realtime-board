// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/stringify.js
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
var byteToHex = [];
for (let i = 0;i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}

// node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// node_modules/uuid/dist/esm-browser/v4.js
var v4 = function(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0;i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
};
var v4_default = v4;
// src/util.ts
class Vector2d {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  x;
  y;
  add(v) {
    return new Vector2d(this.x + v.x, this.y + v.y);
  }
}

class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  ptInRect(x, y) {
    return this.x <= x && x <= this.x + this.w && this.y <= y && y <= this.y + this.h;
  }
  aabb(rect) {
    return this.x < rect.x + rect.w && this.x + this.w > rect.x && this.y < rect.y + rect.h && this.h + this.y > rect.y;
  }
  x;
  y;
  w;
  h;
}

// src/items.ts
class Sprite {
  id;
  size;
  position;
  velocity;
  color;
  border;
  constructor(id, x, y, width, height, faceColor, borderColor) {
    this.id = id;
    this.position = new Vector2d(x, y);
    this.size = new Vector2d(width, height);
    this.velocity = new Vector2d(0, 0);
    this.color = faceColor;
    this.border = borderColor;
  }
  isOver(x, y) {
    return new Rect(this.position.x, this.position.y, this.size.x, this.size.y).ptInRect(x, y);
  }
}

class ImageCache {
  _backgroundCache;
  _cached;
  constructor() {
    this._backgroundCache = document.createElement("canvas");
    this._cached = false;
  }
  draw(ctx, render, x, y) {
    if (this._cached) {
      ctx.drawImage(this._backgroundCache, x, y);
    } else {
      render(this._backgroundCache.getContext("2d"));
      ctx.drawImage(this._backgroundCache, x, y);
      this._cached = true;
    }
  }
  clear() {
    this._cached = false;
  }
}

class BufferedSprite extends Sprite {
  _imageCache;
  constructor(id, x, y, width, height, faceColor, borderColor) {
    super(id, x, y, width, height, faceColor, borderColor);
    this._imageCache = new ImageCache;
  }
}

class Circle extends BufferedSprite {
  constructor() {
    super(...arguments);
  }
  draw(ctx) {
    this._imageCache.draw(ctx, (bctx) => {
      bctx.beginPath();
      bctx.strokeStyle = this.border;
      bctx.lineWidth = 3;
      bctx.fillStyle = this.color;
      bctx.ellipse(this.size.x / 2, this.size.y / 2, this.size.x / 2 - 6, this.size.y / 2 - 6, Math.PI / 4, 0, 2 * Math.PI);
      bctx.fill();
      bctx.stroke();
    }, this.position.x, this.position.y);
  }
  update(dt) {
  }
}

class Box extends BufferedSprite {
  constructor() {
    super(...arguments);
  }
  draw(ctx) {
    this._imageCache.draw(ctx, (bctx) => {
      bctx.beginPath();
      bctx.strokeStyle = this.border;
      bctx.lineWidth = 3;
      bctx.fillStyle = this.color;
      bctx.rect(3, 3, this.size.x - 6, this.size.y - 6);
      bctx.fill();
      bctx.stroke();
    }, this.position.x, this.position.y);
  }
  update(dt) {
  }
}

class Triangle extends BufferedSprite {
  constructor() {
    super(...arguments);
  }
  draw(ctx) {
    this._imageCache.draw(ctx, (bctx) => {
      bctx.beginPath();
      bctx.strokeStyle = this.border;
      bctx.lineWidth = 3;
      bctx.fillStyle = this.color;
      bctx.moveTo(3, this.size.y - 6);
      bctx.lineTo(this.size.x / 2, 3);
      bctx.lineTo(this.size.x - 6, this.size.y - 6);
      bctx.lineTo(3, this.size.y - 6);
      bctx.fill();
      bctx.stroke();
    }, this.position.x, this.position.y);
  }
  update(dt) {
  }
}

// src/models.ts
class Message {
  type;
  boardName;
  constructor(type, boardName) {
    this.type = type;
    this.boardName = boardName;
  }
}

class ObjectMessage extends Message {
  id;
  constructor(type, boardName, id) {
    super(type, boardName);
    this.id = id;
  }
}

class ObjectMovedMessage extends ObjectMessage {
  position;
  constructor(id, boardName, position) {
    super("OBJECT_MOVED", boardName, id);
    this.position = position;
  }
}

class ObjectRemovedMessage extends ObjectMessage {
  constructor(id, boardName) {
    super("OBJECT_REMOVED", boardName, id);
  }
}

class ObjectCreateMessage extends ObjectMessage {
  itemType;
  position;
  size;
  faceColor;
  borderColor;
  strokeWidth;
  constructor(id, boardName, itemType, position, size, faceColor, borderColor, strokeWidth) {
    super("OBJECT_CREATED", boardName, id);
    this.position = position;
    this.size = size;
    this.itemType = itemType;
    this.faceColor = faceColor;
    this.borderColor = borderColor;
    this.strokeWidth = strokeWidth;
  }
}

class UserMessage extends Message {
  user;
  message;
  constructor(boardName, user, message) {
    super("USER_MESSAGE", boardName);
    this.boardName = boardName;
    this.user = user;
    this.message = message;
  }
}

// src/boardScene.ts
class BoardScene {
  _app;
  _input;
  _shapes;
  _selected;
  _canvasWidth;
  _canvasHeight;
  _insertNewPosition;
  _offset;
  _removeSelected;
  constructor(app) {
    this._app = app;
    this._input = app.input;
    this._shapes = [];
    this._canvasWidth = this._app.renderer.display.width;
    this._canvasHeight = this._app.renderer.display.height;
    this._insertNewPosition = new Vector2d(this._canvasWidth / 2, this._canvasHeight / 2);
    this._selected = null;
    this._removeSelected = false;
  }
  update(dt) {
    const mouse = this._input.mousePos();
    if (this._input.isMouseDown()) {
      if (this._selected == null) {
        this._shapes.forEach((shape) => {
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
          this._app.socket.sendMessage(new ObjectRemovedMessage(this._selected.id, this._app.boardName));
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
  draw(ctx) {
    this._shapes.forEach((s) => {
      s.draw(ctx);
    });
  }
  addShapeToBoard(bi) {
    let newShape;
    switch (bi.type) {
      case "CIRCLE":
        {
          newShape = new Circle(bi.id, bi.position.x, bi.position.y, bi.size.x, bi.size.y, bi.faceColor, bi.borderColor);
        }
        break;
      case "RECT":
        {
          newShape = new Box(bi.id, bi.position.x, bi.position.y, bi.size.x, bi.size.y, bi.faceColor, bi.borderColor);
        }
        break;
      case "TRIANGLE":
        {
          newShape = new Triangle(bi.id, bi.position.x, bi.position.y, bi.size.x, bi.size.y, bi.faceColor, bi.borderColor);
        }
        break;
      default:
        throw "Invalid shape";
    }
    this._shapes.push(newShape);
  }
  addUserMessageToChat(user, message) {
    const messageOutput = document.getElementById("message-output").getElementsByTagName("tbody")[0];
    const newRow = messageOutput.insertRow();
    const newCol = newRow.insertCell();
    newRow.style.cssText = "th-lg";
    newCol.innerHTML = `<em>${user} say</em>: ${message}`;
    messageOutput.appendChild(newRow);
  }
  async command(cmd, args) {
    if (/^add\-/.test(cmd)) {
      let shapeType;
      let position = new Vector2d(this._insertNewPosition.x, this._insertNewPosition.y);
      let size = new Vector2d(100, 100);
      switch (cmd) {
        case "add-circle":
          shapeType = "circle";
          break;
        case "add-rect":
          shapeType = "rect";
          break;
        case "add-triangle":
          shapeType = "triangle";
          break;
        default:
          throw "Invalid add command";
      }
      const faceColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      const borderColor = "black";
      const strokeWidth = 3;
      this._app.socket.sendMessage(new ObjectCreateMessage(v4_default(), this._app.boardName, shapeType, position, size, faceColor, borderColor, strokeWidth));
    } else {
      switch (cmd) {
        case "refresh-board":
          await this.refreshBoard().catch((e) => console.error(e));
          break;
        case "refresh-content":
          await this.refreshContent(args[0]).catch((e) => console.error(e));
          break;
        case "remove-selected":
          this._removeSelected = true;
          break;
        case "send-message":
          this._app.socket.sendMessage(new UserMessage(this._app.boardName, args[0], args[1]));
          break;
        default:
          throw "Invalid command";
      }
    }
  }
  async refreshBoard() {
    this._shapes = [];
    const response = await this._app.socket.rpcCall("get-board-items", this._app.boardName);
    console.log(response);
    response.body.forEach((bi) => {
      this.addShapeToBoard(bi);
    });
  }
  async refreshContent(refreshDoneCallback = undefined) {
    await this.refreshBoard();
    const response = await this._app.socket.rpcCall("get-board-messages", this._app.boardName);
    response.body.forEach((messageEntity) => {
      this.addUserMessageToChat(messageEntity.user, messageEntity.message);
    });
    const messageOutput = document.getElementById("message-output").getElementsByTagName("tbody")[0];
    messageOutput.scrollTop = messageOutput.scrollHeight;
    if (refreshDoneCallback)
      refreshDoneCallback();
  }
  wsMessage(message) {
    switch (message.type) {
      case "OBJECT_CREATED":
        {
          const msg = message;
          let newShape;
          switch (msg.itemType.toUpperCase()) {
            case "CIRCLE":
              newShape = new Circle(msg.id, msg.position.x, msg.position.y, msg.size.x, msg.size.y, msg.faceColor, msg.borderColor);
              break;
            case "RECT":
              newShape = new Box(msg.id, msg.position.x, msg.position.y, msg.size.x, msg.size.y, msg.faceColor, msg.borderColor);
              break;
            case "TRIANGLE":
              newShape = new Triangle(msg.id, msg.position.x, msg.position.y, msg.size.x, msg.size.y, msg.faceColor, msg.borderColor);
              break;
            default:
              throw "Invalid shape";
          }
          this._shapes.push(newShape);
        }
        break;
      case "OBJECT_REMOVED":
        {
          const msg = message;
          this._shapes = this._shapes.filter((s) => s.id != msg.id);
        }
        break;
      case "OBJECT_MOVED":
        {
          const obj = message;
          let shape = this._shapes.find((value) => value.id == obj.id);
          if (shape) {
            shape.position = obj.position;
          }
        }
        break;
      case "USER_MESSAGE":
        {
          const msg = message;
          this.addUserMessageToChat(msg.user, msg.message);
          const messageOutput = document.getElementById("message-output").getElementsByTagName("tbody")[0];
          messageOutput.scrollTop = messageOutput.scrollHeight;
        }
        break;
      default:
        console.error(message);
        throw `Invalid message type ${message.type}`;
    }
  }
}

// src/engine.ts
class Engine {
  _renderer;
  _start;
  _input;
  constructor(element, renderer) {
    this._renderer = renderer;
    this._input = new Input(document.getElementById(element));
    this._start = undefined;
  }
  get displayWidth() {
    return this._renderer.display.width;
  }
  get displayHeight() {
    return this._renderer.display.height;
  }
  get input() {
    return this._input;
  }
  storeLocal(data) {
    if (window.localStorage) {
      window.localStorage.setItem("board", JSON.stringify(data));
    }
  }
  readLocal() {
    if (window.localStorage) {
      return JSON.parse(window.localStorage.getItem("board"));
    }
  }
  get renderer() {
    return this._renderer;
  }
  loop = (ts) => {
    window.requestAnimationFrame(this.loop);
    if (!this._start) {
      this._start = ts;
    }
    const dt = (ts - this._start) / 1000;
    this._start = ts;
    this.update(dt);
    this.draw(this._renderer.context);
  };
  run() {
    window.requestAnimationFrame(this.loop);
  }
}

class Input {
  _keys = {};
  _lastk = InputKey.NO_KEY;
  _mouseDown;
  _mouseMove;
  constructor(element) {
    window.addEventListener("keydown", (e) => {
      this._keys["k" + e.code] = true;
      this._lastk = e.code;
    });
    window.addEventListener("keyup", (e) => {
      this._keys["k" + e.code] = false;
      this._lastk = InputKey.NO_KEY;
    });
    element.addEventListener("mousedown", (e) => {
      this._mouseDown = true;
    });
    element.addEventListener("mouseup", (e) => {
      this._mouseDown = false;
    });
    element.addEventListener("mousemove", (e) => {
      this._mouseMove = new Vector2d(e.offsetX, e.offsetY);
    });
    element.addEventListener("touchmove", (e) => {
      var evt = typeof e.originalEvent === "undefined" ? e : e.originalEvent;
      var touch = evt.touches[0] || evt.changedTouches[0];
      this._mouseMove = new Vector2d(touch.pageX, touch.pageY);
    });
    element.addEventListener("touchstart", (e) => {
      this._mouseDown = true;
    });
    element.addEventListener("touchend", (e) => {
      this._mouseDown = false;
    });
    element.addEventListener("touchcancel", (e) => {
      this._mouseDown = false;
    });
  }
  isMouseDown = () => {
    return this._mouseDown;
  };
  mousePos = () => {
    return this._mouseMove;
  };
  isDown = (keyCode) => {
    this._lastk = keyCode;
    return this._keys["k" + keyCode] == true;
  };
  isUp = (keyCode) => {
    this._lastk = InputKey.NO_KEY;
    return this._keys["k" + keyCode] == false;
  };
  isPressed = (keyCode) => {
    var pressed = this._keys["k" + keyCode] == true;
    this._keys["k" + keyCode] = false;
    return pressed;
  };
  clear = () => {
    this._keys = {};
    this._lastk = InputKey.NO_KEY;
  };
  rawKey = () => {
    if (this._lastk == InputKey.NO_KEY)
      return InputKey.NO_KEY;
    var pressed = this._keys["k" + this._lastk] == true;
    this._keys["k" + this._lastk] = false;
    if (pressed)
      return this._lastk;
    return InputKey.NO_KEY;
  };
}
var InputKey = {
  NO_KEY: "",
  KEY_LEFT: "ArrowLeft",
  KEY_DOWN: "ArrowDown",
  KEY_RIGHT: "ArrowRight",
  KEY_UP: "ArrowUp",
  KEY_RETURN: "Enter",
  KEY_ESCAPE: "Escape",
  KEY_BS: "Backspace",
  KEY_SPACE: "Space",
  KEY_PGDOWN: "PageDown",
  KEY_PGUP: "PageUp",
  KEY_FIRE: "KeyZ",
  KEY_A: "KeyA",
  KEY_B: "KeyB",
  KEY_C: "KeyC",
  KEY_D: "KeyD",
  KEY_E: "KeyE",
  KEY_F: "KeyF",
  KEY_G: "KeyG",
  KEY_H: "KeyH",
  KEY_I: "KeyI",
  KEY_J: "KeyJ",
  KEY_K: "KeyK",
  KEY_L: "KeyL",
  KEY_M: "KeyM",
  KEY_N: "KeyN",
  KEY_O: "KeyO",
  KEY_P: "KeyP",
  KEY_Q: "KeyQ",
  KEY_R: "KeyR",
  KEY_S: "KeyS",
  KEY_T: "KeyT",
  KEY_U: "KeyU",
  KEY_V: "KeyV",
  KEY_W: "KeyW",
  KEY_X: "KeyX",
  KEY_Y: "KeyY",
  KEY_Z: "KeyZ"
};

// src/renderer.ts
class Renderer {
  _canvas;
  _ctx;
  constructor(canvasId) {
    this._canvas = document.getElementById(canvasId);
    this._ctx = this._canvas.getContext("2d");
  }
  get display() {
    return this._canvas;
  }
  get context() {
    return this._ctx;
  }
}

// node_modules/@stomp/stompjs/esm6/byte.js
var BYTE = {
  LF: `
`,
  NULL: "\0"
};

// node_modules/@stomp/stompjs/esm6/frame-impl.js
class FrameImpl {
  constructor(params) {
    const { command, headers, body, binaryBody, escapeHeaderValues, skipContentLengthHeader } = params;
    this.command = command;
    this.headers = Object.assign({}, headers || {});
    if (binaryBody) {
      this._binaryBody = binaryBody;
      this.isBinaryBody = true;
    } else {
      this._body = body || "";
      this.isBinaryBody = false;
    }
    this.escapeHeaderValues = escapeHeaderValues || false;
    this.skipContentLengthHeader = skipContentLengthHeader || false;
  }
  get body() {
    if (!this._body && this.isBinaryBody) {
      this._body = new TextDecoder().decode(this._binaryBody);
    }
    return this._body || "";
  }
  get binaryBody() {
    if (!this._binaryBody && !this.isBinaryBody) {
      this._binaryBody = new TextEncoder().encode(this._body);
    }
    return this._binaryBody;
  }
  static fromRawFrame(rawFrame, escapeHeaderValues) {
    const headers = {};
    const trim = (str) => str.replace(/^\s+|\s+$/g, "");
    for (const header of rawFrame.headers.reverse()) {
      const idx = header.indexOf(":");
      const key = trim(header[0]);
      let value = trim(header[1]);
      if (escapeHeaderValues && rawFrame.command !== "CONNECT" && rawFrame.command !== "CONNECTED") {
        value = FrameImpl.hdrValueUnEscape(value);
      }
      headers[key] = value;
    }
    return new FrameImpl({
      command: rawFrame.command,
      headers,
      binaryBody: rawFrame.binaryBody,
      escapeHeaderValues
    });
  }
  toString() {
    return this.serializeCmdAndHeaders();
  }
  serialize() {
    const cmdAndHeaders = this.serializeCmdAndHeaders();
    if (this.isBinaryBody) {
      return FrameImpl.toUnit8Array(cmdAndHeaders, this._binaryBody).buffer;
    } else {
      return cmdAndHeaders + this._body + BYTE.NULL;
    }
  }
  serializeCmdAndHeaders() {
    const lines = [this.command];
    if (this.skipContentLengthHeader) {
      delete this.headers["content-length"];
    }
    for (const name of Object.keys(this.headers || {})) {
      const value = this.headers[name];
      if (this.escapeHeaderValues && this.command !== "CONNECT" && this.command !== "CONNECTED") {
        lines.push(`${name}:${FrameImpl.hdrValueEscape(`${value}`)}`);
      } else {
        lines.push(`${name}:${value}`);
      }
    }
    if (this.isBinaryBody || !this.isBodyEmpty() && !this.skipContentLengthHeader) {
      lines.push(`content-length:${this.bodyLength()}`);
    }
    return lines.join(BYTE.LF) + BYTE.LF + BYTE.LF;
  }
  isBodyEmpty() {
    return this.bodyLength() === 0;
  }
  bodyLength() {
    const binaryBody = this.binaryBody;
    return binaryBody ? binaryBody.length : 0;
  }
  static sizeOfUTF8(s) {
    return s ? new TextEncoder().encode(s).length : 0;
  }
  static toUnit8Array(cmdAndHeaders, binaryBody) {
    const uint8CmdAndHeaders = new TextEncoder().encode(cmdAndHeaders);
    const nullTerminator = new Uint8Array([0]);
    const uint8Frame = new Uint8Array(uint8CmdAndHeaders.length + binaryBody.length + nullTerminator.length);
    uint8Frame.set(uint8CmdAndHeaders);
    uint8Frame.set(binaryBody, uint8CmdAndHeaders.length);
    uint8Frame.set(nullTerminator, uint8CmdAndHeaders.length + binaryBody.length);
    return uint8Frame;
  }
  static marshall(params) {
    const frame = new FrameImpl(params);
    return frame.serialize();
  }
  static hdrValueEscape(str) {
    return str.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/:/g, "\\c");
  }
  static hdrValueUnEscape(str) {
    return str.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\c/g, ":").replace(/\\\\/g, "\\");
  }
}

// node_modules/@stomp/stompjs/esm6/parser.js
var NULL = 0;
var LF = 10;
var CR = 13;
var COLON = 58;

class Parser {
  constructor(onFrame, onIncomingPing) {
    this.onFrame = onFrame;
    this.onIncomingPing = onIncomingPing;
    this._encoder = new TextEncoder;
    this._decoder = new TextDecoder;
    this._token = [];
    this._initState();
  }
  parseChunk(segment, appendMissingNULLonIncoming = false) {
    let chunk;
    if (typeof segment === "string") {
      chunk = this._encoder.encode(segment);
    } else {
      chunk = new Uint8Array(segment);
    }
    if (appendMissingNULLonIncoming && chunk[chunk.length - 1] !== 0) {
      const chunkWithNull = new Uint8Array(chunk.length + 1);
      chunkWithNull.set(chunk, 0);
      chunkWithNull[chunk.length] = 0;
      chunk = chunkWithNull;
    }
    for (let i = 0;i < chunk.length; i++) {
      const byte2 = chunk[i];
      this._onByte(byte2);
    }
  }
  _collectFrame(byte2) {
    if (byte2 === NULL) {
      return;
    }
    if (byte2 === CR) {
      return;
    }
    if (byte2 === LF) {
      this.onIncomingPing();
      return;
    }
    this._onByte = this._collectCommand;
    this._reinjectByte(byte2);
  }
  _collectCommand(byte2) {
    if (byte2 === CR) {
      return;
    }
    if (byte2 === LF) {
      this._results.command = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte2);
  }
  _collectHeaders(byte2) {
    if (byte2 === CR) {
      return;
    }
    if (byte2 === LF) {
      this._setupCollectBody();
      return;
    }
    this._onByte = this._collectHeaderKey;
    this._reinjectByte(byte2);
  }
  _reinjectByte(byte2) {
    this._onByte(byte2);
  }
  _collectHeaderKey(byte2) {
    if (byte2 === COLON) {
      this._headerKey = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaderValue;
      return;
    }
    this._consumeByte(byte2);
  }
  _collectHeaderValue(byte2) {
    if (byte2 === CR) {
      return;
    }
    if (byte2 === LF) {
      this._results.headers.push([
        this._headerKey,
        this._consumeTokenAsUTF8()
      ]);
      this._headerKey = undefined;
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte2);
  }
  _setupCollectBody() {
    const contentLengthHeader = this._results.headers.filter((header) => {
      return header[0] === "content-length";
    })[0];
    if (contentLengthHeader) {
      this._bodyBytesRemaining = parseInt(contentLengthHeader[1], 10);
      this._onByte = this._collectBodyFixedSize;
    } else {
      this._onByte = this._collectBodyNullTerminated;
    }
  }
  _collectBodyNullTerminated(byte2) {
    if (byte2 === NULL) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte2);
  }
  _collectBodyFixedSize(byte2) {
    if (this._bodyBytesRemaining-- === 0) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte2);
  }
  _retrievedBody() {
    this._results.binaryBody = this._consumeTokenAsRaw();
    try {
      this.onFrame(this._results);
    } catch (e) {
      console.log(`Ignoring an exception thrown by a frame handler. Original exception: `, e);
    }
    this._initState();
  }
  _consumeByte(byte2) {
    this._token.push(byte2);
  }
  _consumeTokenAsUTF8() {
    return this._decoder.decode(this._consumeTokenAsRaw());
  }
  _consumeTokenAsRaw() {
    const rawResult = new Uint8Array(this._token);
    this._token = [];
    return rawResult;
  }
  _initState() {
    this._results = {
      command: undefined,
      headers: [],
      binaryBody: undefined
    };
    this._token = [];
    this._headerKey = undefined;
    this._onByte = this._collectFrame;
  }
}

// node_modules/@stomp/stompjs/esm6/types.js
var StompSocketState;
(function(StompSocketState2) {
  StompSocketState2[StompSocketState2["CONNECTING"] = 0] = "CONNECTING";
  StompSocketState2[StompSocketState2["OPEN"] = 1] = "OPEN";
  StompSocketState2[StompSocketState2["CLOSING"] = 2] = "CLOSING";
  StompSocketState2[StompSocketState2["CLOSED"] = 3] = "CLOSED";
})(StompSocketState = StompSocketState || (StompSocketState = {}));
var ActivationState;
(function(ActivationState2) {
  ActivationState2[ActivationState2["ACTIVE"] = 0] = "ACTIVE";
  ActivationState2[ActivationState2["DEACTIVATING"] = 1] = "DEACTIVATING";
  ActivationState2[ActivationState2["INACTIVE"] = 2] = "INACTIVE";
})(ActivationState = ActivationState || (ActivationState = {}));

// node_modules/@stomp/stompjs/esm6/versions.js
class Versions {
  constructor(versions) {
    this.versions = versions;
  }
  supportedVersions() {
    return this.versions.join(",");
  }
  protocolVersions() {
    return this.versions.map((x) => `v${x.replace(".", "")}.stomp`);
  }
}
Versions.V1_0 = "1.0";
Versions.V1_1 = "1.1";
Versions.V1_2 = "1.2";
Versions.default = new Versions([
  Versions.V1_2,
  Versions.V1_1,
  Versions.V1_0
]);

// node_modules/@stomp/stompjs/esm6/augment-websocket.js
function augmentWebsocket(webSocket, debug) {
  webSocket.terminate = function() {
    const noOp = () => {
    };
    this.onerror = noOp;
    this.onmessage = noOp;
    this.onopen = noOp;
    const ts = new Date;
    const id = Math.random().toString().substring(2, 8);
    const origOnClose = this.onclose;
    this.onclose = (closeEvent) => {
      const delay = new Date().getTime() - ts.getTime();
      debug(`Discarded socket (#${id})  closed after ${delay}ms, with code/reason: ${closeEvent.code}/${closeEvent.reason}`);
    };
    this.close();
    origOnClose?.call(webSocket, {
      code: 4001,
      reason: `Quick discarding socket (#${id}) without waiting for the shutdown sequence.`,
      wasClean: false
    });
  };
}

// node_modules/@stomp/stompjs/esm6/stomp-handler.js
class StompHandler {
  constructor(_client, _webSocket, config) {
    this._client = _client;
    this._webSocket = _webSocket;
    this._connected = false;
    this._serverFrameHandlers = {
      CONNECTED: (frame) => {
        this.debug(`connected to server ${frame.headers.server}`);
        this._connected = true;
        this._connectedVersion = frame.headers.version;
        if (this._connectedVersion === Versions.V1_2) {
          this._escapeHeaderValues = true;
        }
        this._setupHeartbeat(frame.headers);
        this.onConnect(frame);
      },
      MESSAGE: (frame) => {
        const subscription = frame.headers.subscription;
        const onReceive = this._subscriptions[subscription] || this.onUnhandledMessage;
        const message = frame;
        const client = this;
        const messageId = this._connectedVersion === Versions.V1_2 ? message.headers.ack : message.headers["message-id"];
        message.ack = (headers = {}) => {
          return client.ack(messageId, subscription, headers);
        };
        message.nack = (headers = {}) => {
          return client.nack(messageId, subscription, headers);
        };
        onReceive(message);
      },
      RECEIPT: (frame) => {
        const callback = this._receiptWatchers[frame.headers["receipt-id"]];
        if (callback) {
          callback(frame);
          delete this._receiptWatchers[frame.headers["receipt-id"]];
        } else {
          this.onUnhandledReceipt(frame);
        }
      },
      ERROR: (frame) => {
        this.onStompError(frame);
      }
    };
    this._counter = 0;
    this._subscriptions = {};
    this._receiptWatchers = {};
    this._partialData = "";
    this._escapeHeaderValues = false;
    this._lastServerActivityTS = Date.now();
    this.debug = config.debug;
    this.stompVersions = config.stompVersions;
    this.connectHeaders = config.connectHeaders;
    this.disconnectHeaders = config.disconnectHeaders;
    this.heartbeatIncoming = config.heartbeatIncoming;
    this.heartbeatOutgoing = config.heartbeatOutgoing;
    this.splitLargeFrames = config.splitLargeFrames;
    this.maxWebSocketChunkSize = config.maxWebSocketChunkSize;
    this.forceBinaryWSFrames = config.forceBinaryWSFrames;
    this.logRawCommunication = config.logRawCommunication;
    this.appendMissingNULLonIncoming = config.appendMissingNULLonIncoming;
    this.discardWebsocketOnCommFailure = config.discardWebsocketOnCommFailure;
    this.onConnect = config.onConnect;
    this.onDisconnect = config.onDisconnect;
    this.onStompError = config.onStompError;
    this.onWebSocketClose = config.onWebSocketClose;
    this.onWebSocketError = config.onWebSocketError;
    this.onUnhandledMessage = config.onUnhandledMessage;
    this.onUnhandledReceipt = config.onUnhandledReceipt;
    this.onUnhandledFrame = config.onUnhandledFrame;
  }
  get connectedVersion() {
    return this._connectedVersion;
  }
  get connected() {
    return this._connected;
  }
  start() {
    const parser2 = new Parser((rawFrame) => {
      const frame = FrameImpl.fromRawFrame(rawFrame, this._escapeHeaderValues);
      if (!this.logRawCommunication) {
        this.debug(`<<< ${frame}`);
      }
      const serverFrameHandler = this._serverFrameHandlers[frame.command] || this.onUnhandledFrame;
      serverFrameHandler(frame);
    }, () => {
      this.debug("<<< PONG");
    });
    this._webSocket.onmessage = (evt) => {
      this.debug("Received data");
      this._lastServerActivityTS = Date.now();
      if (this.logRawCommunication) {
        const rawChunkAsString = evt.data instanceof ArrayBuffer ? new TextDecoder().decode(evt.data) : evt.data;
        this.debug(`<<< ${rawChunkAsString}`);
      }
      parser2.parseChunk(evt.data, this.appendMissingNULLonIncoming);
    };
    this._webSocket.onclose = (closeEvent) => {
      this.debug(`Connection closed to ${this._webSocket.url}`);
      this._cleanUp();
      this.onWebSocketClose(closeEvent);
    };
    this._webSocket.onerror = (errorEvent) => {
      this.onWebSocketError(errorEvent);
    };
    this._webSocket.onopen = () => {
      const connectHeaders = Object.assign({}, this.connectHeaders);
      this.debug("Web Socket Opened...");
      connectHeaders["accept-version"] = this.stompVersions.supportedVersions();
      connectHeaders["heart-beat"] = [
        this.heartbeatOutgoing,
        this.heartbeatIncoming
      ].join(",");
      this._transmit({ command: "CONNECT", headers: connectHeaders });
    };
  }
  _setupHeartbeat(headers) {
    if (headers.version !== Versions.V1_1 && headers.version !== Versions.V1_2) {
      return;
    }
    if (!headers["heart-beat"]) {
      return;
    }
    const [serverOutgoing, serverIncoming] = headers["heart-beat"].split(",").map((v) => parseInt(v, 10));
    if (this.heartbeatOutgoing !== 0 && serverIncoming !== 0) {
      const ttl = Math.max(this.heartbeatOutgoing, serverIncoming);
      this.debug(`send PING every ${ttl}ms`);
      this._pinger = setInterval(() => {
        if (this._webSocket.readyState === StompSocketState.OPEN) {
          this._webSocket.send(BYTE.LF);
          this.debug(">>> PING");
        }
      }, ttl);
    }
    if (this.heartbeatIncoming !== 0 && serverOutgoing !== 0) {
      const ttl = Math.max(this.heartbeatIncoming, serverOutgoing);
      this.debug(`check PONG every ${ttl}ms`);
      this._ponger = setInterval(() => {
        const delta = Date.now() - this._lastServerActivityTS;
        if (delta > ttl * 2) {
          this.debug(`did not receive server activity for the last ${delta}ms`);
          this._closeOrDiscardWebsocket();
        }
      }, ttl);
    }
  }
  _closeOrDiscardWebsocket() {
    if (this.discardWebsocketOnCommFailure) {
      this.debug("Discarding websocket, the underlying socket may linger for a while");
      this.discardWebsocket();
    } else {
      this.debug("Issuing close on the websocket");
      this._closeWebsocket();
    }
  }
  forceDisconnect() {
    if (this._webSocket) {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeOrDiscardWebsocket();
      }
    }
  }
  _closeWebsocket() {
    this._webSocket.onmessage = () => {
    };
    this._webSocket.close();
  }
  discardWebsocket() {
    if (typeof this._webSocket.terminate !== "function") {
      augmentWebsocket(this._webSocket, (msg) => this.debug(msg));
    }
    this._webSocket.terminate();
  }
  _transmit(params) {
    const { command, headers, body, binaryBody, skipContentLengthHeader } = params;
    const frame = new FrameImpl({
      command,
      headers,
      body,
      binaryBody,
      escapeHeaderValues: this._escapeHeaderValues,
      skipContentLengthHeader
    });
    let rawChunk = frame.serialize();
    if (this.logRawCommunication) {
      this.debug(`>>> ${rawChunk}`);
    } else {
      this.debug(`>>> ${frame}`);
    }
    if (this.forceBinaryWSFrames && typeof rawChunk === "string") {
      rawChunk = new TextEncoder().encode(rawChunk);
    }
    if (typeof rawChunk !== "string" || !this.splitLargeFrames) {
      this._webSocket.send(rawChunk);
    } else {
      let out = rawChunk;
      while (out.length > 0) {
        const chunk = out.substring(0, this.maxWebSocketChunkSize);
        out = out.substring(this.maxWebSocketChunkSize);
        this._webSocket.send(chunk);
        this.debug(`chunk sent = ${chunk.length}, remaining = ${out.length}`);
      }
    }
  }
  dispose() {
    if (this.connected) {
      try {
        const disconnectHeaders = Object.assign({}, this.disconnectHeaders);
        if (!disconnectHeaders.receipt) {
          disconnectHeaders.receipt = `close-${this._counter++}`;
        }
        this.watchForReceipt(disconnectHeaders.receipt, (frame) => {
          this._closeWebsocket();
          this._cleanUp();
          this.onDisconnect(frame);
        });
        this._transmit({ command: "DISCONNECT", headers: disconnectHeaders });
      } catch (error) {
        this.debug(`Ignoring error during disconnect ${error}`);
      }
    } else {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeWebsocket();
      }
    }
  }
  _cleanUp() {
    this._connected = false;
    if (this._pinger) {
      clearInterval(this._pinger);
      this._pinger = undefined;
    }
    if (this._ponger) {
      clearInterval(this._ponger);
      this._ponger = undefined;
    }
  }
  publish(params) {
    const { destination, headers, body, binaryBody, skipContentLengthHeader } = params;
    const hdrs = Object.assign({ destination }, headers);
    this._transmit({
      command: "SEND",
      headers: hdrs,
      body,
      binaryBody,
      skipContentLengthHeader
    });
  }
  watchForReceipt(receiptId, callback) {
    this._receiptWatchers[receiptId] = callback;
  }
  subscribe(destination, callback, headers = {}) {
    headers = Object.assign({}, headers);
    if (!headers.id) {
      headers.id = `sub-${this._counter++}`;
    }
    headers.destination = destination;
    this._subscriptions[headers.id] = callback;
    this._transmit({ command: "SUBSCRIBE", headers });
    const client = this;
    return {
      id: headers.id,
      unsubscribe(hdrs) {
        return client.unsubscribe(headers.id, hdrs);
      }
    };
  }
  unsubscribe(id, headers = {}) {
    headers = Object.assign({}, headers);
    delete this._subscriptions[id];
    headers.id = id;
    this._transmit({ command: "UNSUBSCRIBE", headers });
  }
  begin(transactionId) {
    const txId = transactionId || `tx-${this._counter++}`;
    this._transmit({
      command: "BEGIN",
      headers: {
        transaction: txId
      }
    });
    const client = this;
    return {
      id: txId,
      commit() {
        client.commit(txId);
      },
      abort() {
        client.abort(txId);
      }
    };
  }
  commit(transactionId) {
    this._transmit({
      command: "COMMIT",
      headers: {
        transaction: transactionId
      }
    });
  }
  abort(transactionId) {
    this._transmit({
      command: "ABORT",
      headers: {
        transaction: transactionId
      }
    });
  }
  ack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    this._transmit({ command: "ACK", headers });
  }
  nack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    return this._transmit({ command: "NACK", headers });
  }
}

// node_modules/@stomp/stompjs/esm6/client.js
class Client {
  constructor(conf = {}) {
    this.stompVersions = Versions.default;
    this.connectionTimeout = 0;
    this.reconnectDelay = 5000;
    this.heartbeatIncoming = 1e4;
    this.heartbeatOutgoing = 1e4;
    this.splitLargeFrames = false;
    this.maxWebSocketChunkSize = 8 * 1024;
    this.forceBinaryWSFrames = false;
    this.appendMissingNULLonIncoming = false;
    this.discardWebsocketOnCommFailure = false;
    this.state = ActivationState.INACTIVE;
    const noOp = () => {
    };
    this.debug = noOp;
    this.beforeConnect = noOp;
    this.onConnect = noOp;
    this.onDisconnect = noOp;
    this.onUnhandledMessage = noOp;
    this.onUnhandledReceipt = noOp;
    this.onUnhandledFrame = noOp;
    this.onStompError = noOp;
    this.onWebSocketClose = noOp;
    this.onWebSocketError = noOp;
    this.logRawCommunication = false;
    this.onChangeState = noOp;
    this.connectHeaders = {};
    this._disconnectHeaders = {};
    this.configure(conf);
  }
  get webSocket() {
    return this._stompHandler?._webSocket;
  }
  get disconnectHeaders() {
    return this._disconnectHeaders;
  }
  set disconnectHeaders(value) {
    this._disconnectHeaders = value;
    if (this._stompHandler) {
      this._stompHandler.disconnectHeaders = this._disconnectHeaders;
    }
  }
  get connected() {
    return !!this._stompHandler && this._stompHandler.connected;
  }
  get connectedVersion() {
    return this._stompHandler ? this._stompHandler.connectedVersion : undefined;
  }
  get active() {
    return this.state === ActivationState.ACTIVE;
  }
  _changeState(state) {
    this.state = state;
    this.onChangeState(state);
  }
  configure(conf) {
    Object.assign(this, conf);
  }
  activate() {
    const _activate = () => {
      if (this.active) {
        this.debug("Already ACTIVE, ignoring request to activate");
        return;
      }
      this._changeState(ActivationState.ACTIVE);
      this._connect();
    };
    if (this.state === ActivationState.DEACTIVATING) {
      this.debug("Waiting for deactivation to finish before activating");
      this.deactivate().then(() => {
        _activate();
      });
    } else {
      _activate();
    }
  }
  async _connect() {
    await this.beforeConnect();
    if (this._stompHandler) {
      this.debug("There is already a stompHandler, skipping the call to connect");
      return;
    }
    if (!this.active) {
      this.debug("Client has been marked inactive, will not attempt to connect");
      return;
    }
    if (this.connectionTimeout > 0) {
      if (this._connectionWatcher) {
        clearTimeout(this._connectionWatcher);
      }
      this._connectionWatcher = setTimeout(() => {
        if (this.connected) {
          return;
        }
        this.debug(`Connection not established in ${this.connectionTimeout}ms, closing socket`);
        this.forceDisconnect();
      }, this.connectionTimeout);
    }
    this.debug("Opening Web Socket...");
    const webSocket = this._createWebSocket();
    this._stompHandler = new StompHandler(this, webSocket, {
      debug: this.debug,
      stompVersions: this.stompVersions,
      connectHeaders: this.connectHeaders,
      disconnectHeaders: this._disconnectHeaders,
      heartbeatIncoming: this.heartbeatIncoming,
      heartbeatOutgoing: this.heartbeatOutgoing,
      splitLargeFrames: this.splitLargeFrames,
      maxWebSocketChunkSize: this.maxWebSocketChunkSize,
      forceBinaryWSFrames: this.forceBinaryWSFrames,
      logRawCommunication: this.logRawCommunication,
      appendMissingNULLonIncoming: this.appendMissingNULLonIncoming,
      discardWebsocketOnCommFailure: this.discardWebsocketOnCommFailure,
      onConnect: (frame) => {
        if (this._connectionWatcher) {
          clearTimeout(this._connectionWatcher);
          this._connectionWatcher = undefined;
        }
        if (!this.active) {
          this.debug("STOMP got connected while deactivate was issued, will disconnect now");
          this._disposeStompHandler();
          return;
        }
        this.onConnect(frame);
      },
      onDisconnect: (frame) => {
        this.onDisconnect(frame);
      },
      onStompError: (frame) => {
        this.onStompError(frame);
      },
      onWebSocketClose: (evt) => {
        this._stompHandler = undefined;
        if (this.state === ActivationState.DEACTIVATING) {
          this._changeState(ActivationState.INACTIVE);
        }
        this.onWebSocketClose(evt);
        if (this.active) {
          this._schedule_reconnect();
        }
      },
      onWebSocketError: (evt) => {
        this.onWebSocketError(evt);
      },
      onUnhandledMessage: (message) => {
        this.onUnhandledMessage(message);
      },
      onUnhandledReceipt: (frame) => {
        this.onUnhandledReceipt(frame);
      },
      onUnhandledFrame: (frame) => {
        this.onUnhandledFrame(frame);
      }
    });
    this._stompHandler.start();
  }
  _createWebSocket() {
    let webSocket;
    if (this.webSocketFactory) {
      webSocket = this.webSocketFactory();
    } else if (this.brokerURL) {
      webSocket = new WebSocket(this.brokerURL, this.stompVersions.protocolVersions());
    } else {
      throw new Error("Either brokerURL or webSocketFactory must be provided");
    }
    webSocket.binaryType = "arraybuffer";
    return webSocket;
  }
  _schedule_reconnect() {
    if (this.reconnectDelay > 0) {
      this.debug(`STOMP: scheduling reconnection in ${this.reconnectDelay}ms`);
      this._reconnector = setTimeout(() => {
        this._connect();
      }, this.reconnectDelay);
    }
  }
  async deactivate(options = {}) {
    const force = options.force || false;
    const needToDispose = this.active;
    let retPromise;
    if (this.state === ActivationState.INACTIVE) {
      this.debug(`Already INACTIVE, nothing more to do`);
      return Promise.resolve();
    }
    this._changeState(ActivationState.DEACTIVATING);
    if (this._reconnector) {
      clearTimeout(this._reconnector);
      this._reconnector = undefined;
    }
    if (this._stompHandler && this.webSocket.readyState !== StompSocketState.CLOSED) {
      const origOnWebSocketClose = this._stompHandler.onWebSocketClose;
      retPromise = new Promise((resolve, reject) => {
        this._stompHandler.onWebSocketClose = (evt) => {
          origOnWebSocketClose(evt);
          resolve();
        };
      });
    } else {
      this._changeState(ActivationState.INACTIVE);
      return Promise.resolve();
    }
    if (force) {
      this._stompHandler?.discardWebsocket();
    } else if (needToDispose) {
      this._disposeStompHandler();
    }
    return retPromise;
  }
  forceDisconnect() {
    if (this._stompHandler) {
      this._stompHandler.forceDisconnect();
    }
  }
  _disposeStompHandler() {
    if (this._stompHandler) {
      this._stompHandler.dispose();
    }
  }
  publish(params) {
    this._checkConnection();
    this._stompHandler.publish(params);
  }
  _checkConnection() {
    if (!this.connected) {
      throw new TypeError("There is no underlying STOMP connection");
    }
  }
  watchForReceipt(receiptId, callback) {
    this._checkConnection();
    this._stompHandler.watchForReceipt(receiptId, callback);
  }
  subscribe(destination, callback, headers = {}) {
    this._checkConnection();
    return this._stompHandler.subscribe(destination, callback, headers);
  }
  unsubscribe(id, headers = {}) {
    this._checkConnection();
    this._stompHandler.unsubscribe(id, headers);
  }
  begin(transactionId) {
    this._checkConnection();
    return this._stompHandler.begin(transactionId);
  }
  commit(transactionId) {
    this._checkConnection();
    this._stompHandler.commit(transactionId);
  }
  abort(transactionId) {
    this._checkConnection();
    this._stompHandler.abort(transactionId);
  }
  ack(messageId, subscriptionId, headers = {}) {
    this._checkConnection();
    this._stompHandler.ack(messageId, subscriptionId, headers);
  }
  nack(messageId, subscriptionId, headers = {}) {
    this._checkConnection();
    this._stompHandler.nack(messageId, subscriptionId, headers);
  }
}

// src/socket.ts
class RpcCall {
  timeout;
  correlation_id;
  onreply;
  constructor(correlation_id, timeout, onreply) {
    this.correlation_id = correlation_id;
    this.timeout = timeout;
    this.onreply = onreply;
  }
}

class BoardSocket {
  _stompClient;
  _wsCallback;
  _rpcReplyQueueName;
  _rpcTimeout;
  _rpcCalls;
  boardName;
  constructor(brokerUrl, wscallback, rpcTimeout = 5000) {
    this._wsCallback = wscallback;
    this._rpcTimeout = rpcTimeout;
    this._rpcCalls = [];
    this._stompClient = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 1000
    });
    this._rpcReplyQueueName = `/queue/replies-${v4_default()}`;
  }
  connect(boardName) {
    return new Promise((resolve, reject) => {
      this.boardName = boardName;
      this._stompClient.activate();
      this._stompClient.onConnect = () => {
        this._stompClient.subscribe(`/topic/outgoing.x-${this.boardName}`, (message) => {
          this._wsCallback(JSON.parse(message.body));
        });
        this._stompClient.subscribe(this._rpcReplyQueueName, this.apiReply, {
          "auto-delete": "true",
          durable: "false",
          exclusive: "false"
        });
        resolve();
      };
      this._stompClient.onDisconnect = () => {
        console.log("Socket disconnected");
      };
      this._stompClient.onStompError = (e) => {
        console.error(`Stomp error ${e}`);
        reject(e);
      };
    });
  }
  sendMessage(message) {
    this._stompClient.publish({
      destination: `/app/incoming/x-${this.boardName}`,
      body: JSON.stringify({ message: JSON.stringify(message) })
    });
  }
  apiReply = (message) => {
    this._rpcCalls.find((c) => message.headers["correlation-id"] === c.correlation_id)?.onreply(message);
  };
  rpcCall(methodName, ...args) {
    return new Promise((resolve, reject) => {
      const correlation_id = v4_default();
      const timeoutId = window.setTimeout(() => {
        this._rpcCalls = this._rpcCalls.filter((m) => m.timeout != timeoutId);
        reject(`Method '${methodName}' has timed out`);
      }, this._rpcTimeout);
      this._rpcCalls.push(new RpcCall(correlation_id, timeoutId, (message) => {
        window.clearTimeout(timeoutId);
        this._rpcCalls = this._rpcCalls.filter((m) => m.correlation_id != correlation_id);
        resolve(JSON.parse(message.body));
      }));
      this._stompClient.publish({
        destination: "/app/api/request",
        body: JSON.stringify({ method: methodName, args }),
        headers: {
          "reply-to": this._rpcReplyQueueName,
          "correlation-id": correlation_id
        }
      });
    });
  }
}

// src/app.ts
class BoardApp extends Engine {
  _socket;
  _scene;
  _boardName;
  _userName;
  constructor(canvasId, brokerUrl) {
    super(canvasId, new Renderer(canvasId));
    this._scene = new BoardScene(this);
    this._socket = new BoardSocket(brokerUrl, this.wsMessage);
  }
  get socket() {
    return this._socket;
  }
  get boardName() {
    return this._boardName;
  }
  get userName() {
    return this._userName;
  }
  connect(boardName, username) {
    this._boardName = boardName;
    this._userName = username;
    return this._socket.connect(this._boardName);
  }
  update(dt) {
    this._scene.update(dt);
  }
  draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this._scene.draw(ctx);
  }
  command(cmd, ...args) {
    console.log(`Executing cmd: ${cmd}, args: ${args}`);
    return this._scene.command(cmd, args);
  }
  wsMessage = (message) => {
    this._scene.wsMessage(message);
  };
}

// src/main.ts
var $board = new BoardApp(CANVAS_ID, WEBSOCKET_URL);
$board.run();
