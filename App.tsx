import { StatusBar } from 'expo-status-bar';

import { StyleSheet, Text, View, Button, TextInput } from 'react-native';

import {TouchableOpacity} from 'react-native';
import {SafeAreaView, FlatList} from 'react-native';

import { query, createRecord, initIHPBackend, initAuth} from 'ihp-backend';
import { useQuery} from 'ihp-backend/react';
import { useEffect, useState } from 'react';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

//import * as SecureStore from 'expo-secure-store';
//for dev debugging

import 'expo-dev-client';

const ihpBackend = { host: 'https://attics.di1337.com' };
    const DATA = [
        {
            id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
            title: 'First Item',
            date:'24-03-1977'
        },
        {
            id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
            title: 'Second Item',
            date:'24-03-1977'
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d72',
            title: 'Third Item',
            date:'24-03-1977'
        }];

// This function sets the DataSyncController.ihpBackendHost property
// which handles the connections to your ihp-backend app server.
initIHPBackend(ihpBackend);

export default function App() {

    const [isLoggedIn, setLoggedIn] = useState(true);
    useEffect(async () => {
        const url = AuthSession.makeRedirectUri();
        const result = await WebBrowser.openAuthSessionAsync(ihpBackend.host + '?redirectBack=' + encodeURIComponent(url), url);

        if (result.type === 'success') {
            const userId = getUrlParameter(result.url, 'userId');
            const accessToken = getUrlParameter(result.url, 'accessToken');
            const jwt = null; //await fetchJWT(userId, accessToken);

// Should refactor DataSync to use this.
// SecureStore.setItemAsync('ihp_jwt', jwt);

            window.localStorage = {
                getItem: (key) => {
                    if (key === 'ihp_jwt') {
                        return jwt;
                    }
                },
                removeItem: (key) => {
                    return null;
                }
            };
            await initAuth();
            setLoggedIn(true);
        }
    });

    return (
            <View style={styles.container}>
            <Text> Hello, Eyes of the World </Text>
            <Text> {isLoggedIn ? <Bands/> : 'You Are Not Logged In.'} </Text>
            <StatusBar style="auto" />
            <Performances/>
            </View>
  );
}


interface PerformanceProps {
    performance : { id: string;
                    title: string;
                    date: string;
                  }
}


const Performance = ({performance}:PerformanceProps, onPress:any) => {
    return (<TouchableOpacity onPress={onPress}>
        <Text> {"H" + performance.title} </Text>
        <Text> "Hello Is It Me You're Looking For?" </Text>
     </TouchableOpacity>
     )
};


const Performances = () => {
    const [selectedPerformanceId, setSelectedPerformanceId] = useState('');

    const renderPerformance = (performance:PerformanceProps) => {
        return (<Performance performance={performance}
                             onPress={() => setSelectedPerformanceId(performance.id)}/>
               );
    };

    return (
        <SafeAreaView style={styles.container}>
        <FlatList data={DATA}
        renderItem={renderPerformance}
        horizontal={true}
         />
         </SafeAreaView>
    );
};

function Bands() {
  const bands = useQuery(query('bands'));
  if (bands === null) {
    return <Text>Loading Bands ...</Text>
  }
    return (
        <View>
            {bands.map(band => <Band key={band.id} band={band} />)}
        </View>
    )
}

interface BandProps {
  band: Band;
}

function Band({ band }: BandProps) {
  return <View><Text>{band.name}</Text></View>
}

function NewBandButton() {
  const [name, setName] = useState('');
  const [collection, setCollection] = useState('');
  const [isLoading, setLoading] = useState(false);

  async function onPressAddBand() {
    setLoading(true);
      await createRecord('bands', { name, collection });
      setName('');
      setCollection('');
    setLoading(false);
  }

  return <View>
    <TextInput style={styles.input} onChangeText={setName} value={name} />
    <TextInput style={styles.input} onChangeText={setCollection} value={collection} />
    <View>
      <Button onPress={onPressAddBand} title="Add Band" disabled={isLoading}/>
    </View>
  </View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    minWidth: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

function getUrlParameter(url: string, name: string) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(url);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


// You can set the ihpBackend url explicitly or grab
// the url from the system environment variable BACKEND_URL.
// const ihpBackend = { host: process.env.BACKEND_URL };
