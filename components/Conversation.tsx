import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Dimensions, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import GLOBALS from '../lib/_globals';
import { socketSend } from '../lib/socket';
import { MessageSchema, MessageActionOut } from '../lib/types';
import cache from '../lib/cache';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { onMessageAction } from '../lib/socket';

class MsgItem extends React.PureComponent<{ item: MessageSchema, changedUser: boolean }> {
    render() {
        let containerStyle: StyleProp<any> = { alignItems: 'flex-start' }
        let messageStyle: StyleProp<any> = { backgroundColor: '#e0e0e0', justifyContent: 'flex-start' }
        let textStyle: StyleProp<any> = { color: 'black' }

        if (this.props.item.username === cache.getUsername()) {
            containerStyle = { alignItems: 'flex-end' };
            messageStyle = { backgroundColor: '#1c57b8', justifyContent: 'flex-end' };
            textStyle = { color: 'white' };
        }

        return (
            <View style={{ ...styles.messageContainer, ...containerStyle }}>
                {this.props.changedUser ? <Text style={styles.username}>{this.props.item.username}</Text> : null}
                <View style={{ ...styles.message, ...messageStyle }}>
                    <Text style={{ ...textStyle }}>{this.props.item.content}</Text>
                </View>
            </View>
        )
    }
}

interface Props {
    route: RouteProp<any, 'Conversation'>,
    navigation: NavigationProp<any>
}

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

export default function Conversation(props: Props) {
    const [text, setText] = useState('');
    const [flatList, setFlatList] = useState<FlatList | null>(null);
    const [conversationId, setConversationId] = useState('');

    const forceUpdate = useForceUpdate();

    function batchGetMessages(conversationId: string) {
        fetch(`http://${GLOBALS.API_HOST}:${GLOBALS.API_PORT}/messages/${conversationId}?limit=30`)
            .then(res => res.json())
            .then((data: MessageSchema[] | { error: string }) => {
                if ('error' in data) {
                    throw new Error(data.error);
                }
                else {
                    cache.setMessagesForConversation(conversationId, data);
                    forceUpdate();
                }
            })
            .catch(e => {
                console.error(e);
            })
    }

    // Initialize
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            // Save conversation Id
            let id = props.route.params?.conversationId;
            if (id) {
                setConversationId(id);
            }

            // Set title accordingly
            props.navigation.setOptions({ title: cache.getConversationById(id)?.name || 'Conversation' })

            // Set action handlers
            setActionHandlers();

            // Batch get messages if their currently aren't any
            let conversationMessages = cache.getMessages(conversationId);
            if (conversationMessages?.length === 0 || !conversationMessages) {
                batchGetMessages(id);
            }
        });

        return unsubscribe;
    }, [props.navigation]);

    // Scroll to bottom
    useEffect(() => {
        if (flatList) {
            setTimeout(() => {
                flatList.scrollToEnd({ animated: true });
            }, 100)
        }

        setActionHandlers();
    })

    // Action handlers
    function setActionHandlers() {
        onMessageAction((msg) => {
            cache.addMessageToConversation(msg.conversationId, msg);
            forceUpdate();
        })
    }

    function handleSend() {
        let msg: MessageActionOut = {
            action: 'message',
            data: {
                tempMessageId: uuidv4(),
                tempDateTime: Date.now(),
                conversationId: conversationId,
                username: cache.getUsername(),
                content: text,
                isMedia: false
            }
        }
        setText('');

        socketSend(msg);
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ref={(ref) => setFlatList(ref)}
                style={styles.list}
                data={cache.getMessages(conversationId)}
                renderItem={(data) => {
                    let changedUser = false;
                    if (data.index > 0) {
                        let msgs = cache.getMessages(conversationId);
                        changedUser = msgs[data.index - 1].username !== data.item.username ? true : false;
                    }
                    return (<MsgItem
                        item={data.item}
                        changedUser={changedUser}
                    />)
                }}
                keyExtractor={(item) => item.messageId}
            />
            <View style={styles.inputs}>
                <TextInput
                    style={styles.textInput}
                    onChangeText={(t) => setText(t)}
                    value={text}
                    placeholder="Your Message"
                />
                <Button title="Send" onPress={handleSend} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8
    },
    list: {
        flex: 1
    },
    inputs: {
        flexDirection: 'row'
    },
    textInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#d0d0d0',
        marginBottom: 5,
        marginRight: 8,
        flex: 1
    },
    messageContainer: {
        width: Dimensions.get('window').width - 16,
        marginBottom: 10
    },
    username: {
        color: '#606060',
        fontSize: 14,
        paddingBottom: 4
    },
    message: {
        height: Dimensions.get('window').height * .05,
        minWidth: Dimensions.get('window').width * .15,
        maxWidth: Dimensions.get('window').width * .65,
        backgroundColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
        borderRadius: 8
    }
});
