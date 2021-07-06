import { ConversationSchema, MessageSchema } from './types';

let _username = '';
let _conversations: ConversationSchema[] = []
let _messages: Map<string, Map<string, MessageSchema>> = new Map();

const cache = {
    getUsername: () => _username,
    setUsername: (username: string) => {
        _username = username;
    },
    /**
     * Gets a list of all conversations for the user.
     * @returns List of conversations
     */
    getConversations: () => _conversations,
    /**
     * Set a list of all conversations for this user. Replaces any conversations that currently exist.
     * @param conversations - The array of conversations to set for the user
     */
    setConversations: (conversations: ConversationSchema[]) => {
        _conversations = conversations;
        let newMessages = new Map();
        for (let c of conversations) {
            newMessages.set(c.conversationId, new Map());
        }
        _messages = newMessages;
    },
    /**
     * Adds a conversation to the current user's list of conversations.
     * @param conversation - The conversation to append to the list
     */
    addConversation: (conversation: ConversationSchema) => {
        _conversations = [..._conversations, conversation];
        _messages.set(conversation.conversationId, new Map());
    },
    /**
     * Get a map of all messages for the given conversation Id.
     * @param conversationId - The Id of the conversation to get messages for
     * @returns A map of messages for the conversation
     */
    getMessages: (conversationId: string) => {
        return _messages.get(conversationId);
    },
    /**
     * Set a list of all messages for the given conversation. If any messages already exist for that conversation, they will be replaced.
     * @param conversationId - The Id of the conversation to set messages for
     * @param messages - The list of messages to set for the conversation
     */
    setMessagesForConversation: (conversationId: string, messages: MessageSchema[]) => {
        let messageMap = new Map(messages.map(m => [m.messageId, m]));
        _messages.set(conversationId, messageMap);
    },
    /**
     * Add a message to the current message list that exists for the specified conversation.
     * @param conversationId - The Id of the conversation to add a message to
     * @param message - The message to be added to the conversation's message list
     */
    addMessageToConversation: (conversationId: string, message: MessageSchema) => {
        _messages.get(conversationId)?.set(message.messageId, message);
    },
    /**
     * Adds a list of messages to to the front of the conversation's message list. Existing messages still remain.
     * @param conversationId - The Id of the conversation to add messages to
     * @param messages - The list of messages to add to the front of the currently existing list
     */
    addOldMessagesToConversation: (conversationId: string, messages: MessageSchema[]) => {
        let currentMessages = Array.from(_messages.get(conversationId)?.entries() || []);
        let newMessages: [string, MessageSchema][] = messages.map(m => {
            return [m.messageId, m]
        })
        let newMessageMap = new Map([...currentMessages, ...newMessages])
        _messages.set(conversationId, newMessageMap);
    }
}

export default cache;