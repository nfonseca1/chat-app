import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Button, Dimensions, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import GLOBALS from '../lib/_globals';
import { ConversationSchema } from '../lib/types';
import cache from '../lib/cache';
import Auth, { CognitoUser } from '@aws-amplify/auth';

function UserSelection(props: any) {
    return (
        <View style={styles.userSelection}>
            <Text>{props.user}</Text>
            <TouchableOpacity onPress={() => props.removeUser(props.user)}>
                <AntDesign name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    )
}

export default function NewConversation(props: any) {
    const [name, setName] = useState('');
    const [selection, setSelection] = useState('');
    const [users, setUsers] = useState<string[]>([]);
    const [error, setError] = useState('');

    function addUser(user) {
        let newUsers = users;
        if (!newUsers.includes(user)) {
            newUsers.push(user);
            setUsers(newUsers);
        }
        setSelection('');
    }

    function removeUser(user) {
        let newUsers = users.filter(u => u !== user);
        setUsers(newUsers);
    }

    function createConversation() {
        return fetch(`http://${GLOBALS.API_HOST}:${GLOBALS.API_PORT}/conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, users: [...users, cache.getUsername()] })
        })
            .then(res => res.json())
            .then((data: ConversationSchema | { error: string }) => {

                if ('error' in data) {
                    setError(error);
                }
                else {
                    props.navigation.navigate("Home", { conversation: data })
                }
            })
    }

    return (
        <View style={styles.container}>
            <View style={styles.formField}>
                <Text style={styles.title}>Group Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        onChangeText={(t) => setName(t)}
                        value={name}
                        placeholder="Our Group Chat Name"
                    />
                </View>
            </View>
            <View style={styles.formField}>
                <Text style={styles.title}>Invite Users</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={{ ...styles.input, marginRight: 20 }}
                        onChangeText={(t) => setSelection(t)}
                        value={selection}
                        placeholder="Username"
                    />
                    <Button title="Invite" onPress={() => addUser(selection)} />
                </View>
            </View>
            {users.length > 0 ? (
                <FlatList
                    style={styles.userList}
                    data={users}
                    renderItem={(data) => <UserSelection user={data.item} removeUser={removeUser} />}
                    keyExtractor={(item) => item}
                />
            ) : <View style={styles.userList}></View>}
            <Text style={{ color: 'red' }}>{error}</Text>
            <Button title="Create Conversation" onPress={createConversation} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Dimensions.get('window').width * .08,
        paddingTop: Dimensions.get('window').height * .05,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    formField: {
        marginBottom: Dimensions.get('window').height * .05
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#d0d0d0',
        flex: 1
    },
    title: {
        fontSize: 18,
        width: '100%',
        textAlign: 'left',
        marginBottom: 5
    },
    userList: {
        flex: 1,
        width: '100%'
    },
    userSelection: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#d0d0d0'
    }
})