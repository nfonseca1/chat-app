import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity } from 'react-native';
import { Authenticator, SignIn, SignUp, ConfirmSignUp, AmplifyTheme } from 'aws-amplify-react-native';
import * as SplashScreen from 'expo-splash-screen';
import Amplify from '@aws-amplify/core';
import Auth, { CognitoUser } from '@aws-amplify/auth';

import cache from '../lib/cache';

Amplify.configure({
    Auth: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_ASj3E6hIq',
        userPoolWebClientId: 'uch9uokcj5u3v5eb2p427a92o'
    },
    Analytics: {
        disabled: true
    }
});

function AuthScreen(props: any) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const [authState, setAuthState] = useState<'signIn' | 'signUp' | 'confirmSignUp'>('signIn');

    useEffect(() => {
        SplashScreen.preventAutoHideAsync()
            .then(() => Auth.currentAuthenticatedUser())
            .then((user: CognitoUser) => {
                cache.setUsername(user.getUsername());
                props.navigation.navigate('Home');
                SplashScreen.hideAsync();
            })
            .catch(e => { SplashScreen.hideAsync() })
    }, [])

    function handleSignIn() {
        let authUsername = username;

        Auth.signIn(authUsername, password)
            .then((user) => {
                cache.setUsername(authUsername);
                props.navigation.navigate('Home');
            })
            .catch(e => {
                setError(e.message);
            })
        setError('');
    }

    function handleSignUp() {
        Auth.signUp({
            username: username,
            password: password,
            attributes: {
                email: email
            }
        })
            .then(() => {
                setAuthState('confirmSignUp');
            })
            .catch(e => {
                setError(e.message);
            })
        setError('');
    }

    function handleConfirmation() {
        let authUsername = username;

        Auth.confirmSignUp(authUsername, confirmation)
            .then(() => {
                cache.setUsername(authUsername);
                props.navigation.navigate('Home');
            })
            .catch(e => {
                setError(e.message);
            })
    }

    function resendConfirmation() {
        Auth.resendSignUp(username);
        setConfirmation('');
        setError('');
    }

    if (authState === 'signIn') {
        return (
            <View style={styles.container}>
                <Text>Username</Text>
                <TextInput
                    onChangeText={(t) => setUsername(t)}
                    value={username}
                    style={styles.input}
                />
                <Text>Password</Text>
                <TextInput
                    onChangeText={(t) => setPassword(t)}
                    value={password}
                    textContentType="password"
                    secureTextEntry={true}
                    style={styles.input}
                />
                <View style={styles.buttons}>
                    <Button title="Sign In" onPress={handleSignIn} />
                    <TouchableOpacity onPress={() => setAuthState('signUp')}>
                        <Text>Sign Up</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.error}>{error}</Text>
            </View>
        )
    }
    if (authState === 'signUp') {
        return (
            <View style={styles.container}>
                <Text>Username</Text>
                <TextInput
                    onChangeText={(t) => setUsername(t)}
                    value={username}
                    style={styles.input}
                />
                <Text>Email</Text>
                <TextInput
                    onChangeText={(t) => setEmail(t)}
                    value={email}
                    style={styles.input}
                />
                <Text>Password</Text>
                <TextInput
                    onChangeText={(t) => setPassword(t)}
                    value={password}
                    textContentType="password"
                    secureTextEntry={true}
                    style={styles.input}
                />
                <View style={styles.buttons}>
                    <Button title="Sign Up" onPress={handleSignUp} />
                    <TouchableOpacity onPress={() => setAuthState('signIn')}>
                        <Text>Sign In</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.error}>{error}</Text>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Text>Confirmation Code</Text>
            <TextInput
                onChangeText={(t) => setConfirmation(t)}
                value={confirmation}
                style={styles.input}
            />
            <View style={styles.buttons}>
                <Button title="Confirm" onPress={handleConfirmation} />
                <TouchableOpacity onPress={resendConfirmation}>
                    <Text>Resend Code</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.error}>{error}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 5,
        width: '80%'
    },
    error: {
        color: 'red'
    },
    buttons: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});

export default AuthScreen;