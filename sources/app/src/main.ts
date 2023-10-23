import { BoardApp } from "./app";

// NOTE: CANVAS_ID and WEBSOCKET_URL are defined in html file.
// @ts-ignore
const $board = new BoardApp(CANVAS_ID, WEBSOCKET_URL);
$board.run();
