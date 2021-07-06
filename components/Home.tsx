import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Auth, { CognitoUser } from '@aws-amplify/auth';

import cache from '../lib/cache';
import GLOBALS from '../lib/_globals';
import { createWebSocket, closeWebSocket, onLikeAction, onMessageAction, onIdAction } from '../lib/socket';
import { ConversationSchema, MessageSchema } from '../lib/types';
import { NavigationProp, RouteProp } from '@react-navigation/native';

interface Props {
    route: RouteProp<any, 'Home'>,
    navigation: NavigationProp<any>
}

interface ConversationItemProps {
    item: ConversationSchema,
    openConversation: (conversationId: string) => void
}

function ConversationItem(props: ConversationItemProps) {
    return (
        <TouchableOpacity style={styles.conversationItem} onPress={() => props.openConversation(props.item.conversationId)}>
            <Text>{props.item.name}</Text>
        </TouchableOpacity>
    )
}

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

export default function Home(props: Props) {
    const forceUpdate = useForceUpdate();

    // Set screen focus event listener
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            // Set action handlers
            setActionHandlers();

            // Add conversation if one is passed
            let conversation = props.route.params?.conversation;
            if (conversation) {
                cache.addConversation(conversation);
                forceUpdate();
            }
        });

        return unsubscribe;
    }, [props.navigation]);

    // Initialize
    useEffect(() => {
        // Create web socket connection
        createWebSocket();

        // Get initial conversations for user
        fetch(`http://${GLOBALS.API_HOST}:${GLOBALS.API_PORT}/conversations/${cache.getUsername()}`)
            .then(res => res.json())
            .then((data: ConversationSchema[] | { error: string }) => {
                if ('error' in data) {
                    console.warn(data.error);
                }
                else {
                    cache.setConversations(data);
                    forceUpdate();
                }
            })
            .catch(e => {
                console.error('Could not get messages', e);
            })
    }, [])

    // Action Handlers
    function setActionHandlers() {
        onMessageAction((msg) => {
            cache.addMessageToConversation(msg.conversationId, msg);
            forceUpdate();
        })
    }

    function openConversation(conversationId: string) {
        props.navigation.navigate("Conversation", { conversationId });
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                style={styles.flatList}
                data={cache.getConversations()}
                keyExtractor={(item) => item.conversationId}
                renderItem={({ item }) => <ConversationItem item={item} openConversation={openConversation} />}
            />
            <Button
                color="red"
                title="Sign Out"
                onPress={() => {
                    Auth.signOut();
                    closeWebSocket();
                    props.navigation.navigate("Auth");
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    flatList: {
        flex: 1,
        width: '100%'
    },
    conversationItem: {
        width: '100%',
        height: Dimensions.get('window').height * .05,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingHorizontal: Dimensions.get('window').width * .08
    }
})