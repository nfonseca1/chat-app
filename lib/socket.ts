import { ActionIn, MessageActionIn, LikeActionIn, IdActionIn, ActionOut, MessageSchema } from './types';
import GLOBALS from './_globals';

let socket: WebSocket | null = null;

let messageActionHandler: ((MessageSchema) => void) | null = null;
let likeActionHandler: ((LikeActionIn) => void) | null = null;
let idActionHandler: ((IdActionIn) => void) | null = null;

function createWebSocket() {
    socket = new WebSocket(`ws://${GLOBALS.WS_HOST}:${GLOBALS.WS_PORT}`);

    socket.onopen = function (this: WebSocket, ev: Event) {
        try {
            this.onmessage = (e: MessageEvent<string>) => {
                let socketMsg: ActionIn = JSON.parse(e.data);

                // Socket returns a "message" action
                if (socketMsg.action === 'message') {
                    if (!messageActionHandler) throw new Error('No message action handler available');

                    socketMsg = socketMsg as MessageActionIn;
                    let message: MessageSchema = {
                        messageId: socketMsg.data.messageId,
                        conversationId: socketMsg.data.conversationId,
                        username: socketMsg.data.username,
                        content: socketMsg.data.content,
                        isMedia: socketMsg.data.isMedia,
                        dateTime: socketMsg.data.dateTime
                    }
                    messageActionHandler(message);
                }
                // Socket returns a "like" action
                else if (socketMsg.action === 'like') {
                    if (!likeActionHandler) throw new Error('No message batch action handler available');
                    likeActionHandler(socketMsg);
                }
                // Socket returns an "id" action
                else if (socketMsg.action === 'id') {
                    if (!idActionHandler) throw new Error('No message batch action handler available');
                    idActionHandler(socketMsg);
                }
            }
        }
        catch (e) {
            socket?.close(1005, e.message);
            throw e;
        }
    }
}

function closeWebSocket() {
    if (socket) {
        socket?.close();
        socket = null;
    }
}

function onMessageAction(callback: (message: MessageSchema) => void) {
    messageActionHandler = callback;
}

function onLikeAction(callback: (message: LikeActionIn) => void) {
    likeActionHandler = callback
}

function onIdAction(callback: (message: IdActionIn) => void) {
    idActionHandler = callback;
}

function socketSendMessage(msg: ActionOut) {
    new Promise((resolve: (value: string) => void) => {
        if (msg.action === 'message' && msg.data.isMedia) {
            // If the data contains a media blob, convert the blob to string before stringifying
            msg.data.content.text()
                .then(blobString => {
                    let cleanedMsg = { ...msg }
                    cleanedMsg.data.content = blobString;
                    resolve(JSON.stringify(cleanedMsg));
                })
                .catch(e => { throw new Error(e) })
        }
        else {
            // Data contains no blob, so just stringify
            resolve(JSON.stringify(msg));
        }
    })
        .then(stringifiedMsg => {
            // Send the stringified object if the websocket connection is open
            if (socket?.OPEN) {
                socket.send(stringifiedMsg);
            }
            else {
                throw new Error('Websocket connection is not currently open');
            }
        })
}

function socketRequestBatch(limit: number) {
    let strMsg = JSON.stringify({ action: 'messageBatch', limit });
    socket?.send(strMsg);
}

function socketSend(data: ActionOut) {
    let strMsg = JSON.stringify(data);
    socket?.send(strMsg);
}

export {
    createWebSocket,
    onMessageAction,
    onLikeAction,
    onIdAction,
    socketSend,
    socketSendMessage,
    socketRequestBatch,
    closeWebSocket
}