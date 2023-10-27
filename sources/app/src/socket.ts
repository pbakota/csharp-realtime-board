import { v4 as uuidv4 } from 'uuid';
import { ActionMessage } from './models';
import { Client, IMessage } from '@stomp/stompjs';

export interface FnWsMessageCallback {
    (response: ActionMessage): void;
}

interface FnRpcReplyCallback {
    (message: IMessage): void
}

class RpcCall {
    timeout: number;
    correlation_id: string;
    onreply: FnRpcReplyCallback;
    constructor(correlation_id: string, timeout: number, onreply: FnRpcReplyCallback) {
        this.correlation_id = correlation_id;
        this.timeout = timeout;
        this.onreply = onreply;
    }
}

export class BoardSocket {
    private _stompClient: Client;
    private _wsCallback: FnWsMessageCallback;
    private _rpcReplyQueueName: string;
    private _rpcTimeout: number;
    private _rpcCalls: RpcCall[];

    public boardName: string;

    constructor(brokerUrl: string, wscallback: FnWsMessageCallback, rpcTimeout: number = 5000) {
        this._wsCallback = wscallback;
        this._rpcTimeout = rpcTimeout;
        this._rpcCalls = [];
        this._stompClient = new Client({
            brokerURL: brokerUrl,
            reconnectDelay: 1000,
            // Typically, login, passcode and vhost
            // Adjust these for your broker
            connectHeaders: {
                login: "guest",
                passcode: "guest"
            },
        });
        this._rpcReplyQueueName = `/queue/replies-${uuidv4()}`;
    }

    public connect(boardName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.boardName = boardName;
            this._stompClient.activate();
            this._stompClient.onConnect = (): void => {

                // Subscribe to events/messages
                this._stompClient.subscribe(`/topic/outgoing.x-${this.boardName}`, (message: IMessage) => {
                    this._wsCallback(JSON.parse(message.body) as ActionMessage);
                });

                // subscribe to rpc reply
                this._stompClient.subscribe(this._rpcReplyQueueName, this.apiReply, {
                    // NOTE: These header values need to match with the values that were used in websocket server queue to prevent
                    // exceptions like (payload=RESOURCE_LOCKED - cannot obtain exclusive access to locked queue 'replies-eda3b8...(truncated))
                    "auto-delete": "true",
                    "durable": "false",
                    "exclusive": "false"
                });

                resolve();
            };
            this._stompClient.onDisconnect = () => {
                console.log("Socket disconnected");
            }
            this._stompClient.onStompError = (e) => {
                console.error(`Stomp error ${e}`);
                reject(e);
            }
        });
    }

    public sendMessage(message: ActionMessage): void {
        this._stompClient.publish({
            destination: `/app/incoming/x-${this.boardName}`,
            body: JSON.stringify({ 'message': JSON.stringify(message) })
        });
    }

    private apiReply = (message: IMessage): void => {
        this._rpcCalls.find(c => message.headers['correlation-id'] === c.correlation_id)?.onreply(message);
    }

    public rpcCall<T>(methodName: string, ...args: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const correlation_id = uuidv4();

            const timeoutId = window.setTimeout(() => {
                this._rpcCalls = this._rpcCalls.filter(m => m.timeout != timeoutId);
                reject(`Method '${methodName}' has timed out`);
            }, this._rpcTimeout);

            this._rpcCalls.push(new RpcCall(
                correlation_id,
                timeoutId,
                (message: IMessage) => {
                    window.clearTimeout(timeoutId);
                    this._rpcCalls = this._rpcCalls.filter(m => m.correlation_id != correlation_id);
                    resolve(JSON.parse(message.body) as T);
                }
            ));

            this._stompClient.publish({
                destination: '/app/api/request',
                body: JSON.stringify({ method: methodName, args: args }),
                headers: {
                    'reply-to': this._rpcReplyQueueName,
                    'correlation-id': correlation_id,
                }
            });
        })
    }
}