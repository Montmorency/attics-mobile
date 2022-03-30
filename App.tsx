import { StatusBar } from 'expo-status-bar';

import {StyleSheet, Text, View, Button, TextInput } from 'react-native';

import {TouchableOpacity} from 'react-native';
import {SafeAreaView, FlatList, ListRenderItem} from 'react-native';

import { query, createRecord, initIHPBackend, initAuth} from 'ihp-backend';
import { useQuery} from 'ihp-backend/react';
import { useEffect, useState } from 'react';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';


//Naviation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from '@expo/vector-icons/Ionicons';


import 'expo-dev-client';

const ihpBackend = { host: 'https://attics.di1337.com' };


// Some mock data to put in the navigation skeleton.
const performancesData = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: 'First Item',
        date: '1966-05-19',
        venue: 'Avalon Ballroom'
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        title: 'Second Item',
        date: '1966-06-19',
        venue: 'Ivar Theater'
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        title: 'Third Item',
        date: '1966-11-11',
        venue: 'Fillmore Auditorium'
    }];


const recordingsData = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        performance_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        archive_downloads: 5432,
        avg_rating: 3.5
    },
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        performance_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        archive_downloads: 10000,
        avg_rating: 4.5
    }
];


const songsData = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        recording_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: "Help On The Way",
        track: 1
    },
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        recording_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: "Slipknot!",
        track: 2
    }
    ];

// This function sets the DataSyncController.ihpBackendHost property
// which handles the connections to your ihp-backend app server.

initIHPBackend(ihpBackend);

const PerformanceStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


export default function App() {
    useEffect(() => {
        async function fetchJWT (){
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
        };
        fetchJWT();
    },[]);

    return (
        <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen name="Browse" component={PerformanceStackScreen} />
              <Tab.Screen name="My Shows" component={Bands} />
              <Tab.Screen name="More" component={Bands} />
            </Tab.Navigator>
        </NavigationContainer>
  );
}

function PerformanceStackScreen() {
    return (
        <PerformanceStack.Navigator>
            <PerformanceStack.Screen name="Performances" component={Performances}
                options={{
                    headerTitle: props => <Text> Grateful Dead </Text>,
                    headerRight: () => (
                        <Button
                        onPress={() => alert('Not changing it!')}
                        title="Change Band"
                        color="#000"
                            />
                    ),
                }}
            />
            <PerformanceStack.Screen name="Recordings" component={Recordings}/>
            <PerformanceStack.Screen name="Recording" component={Recording}/>
        </PerformanceStack.Navigator>
    );
};


function onPress() {return;};

function MoreStuff ()
 {  <View>

    </View>
    }

function Performances ({ navigation }) {
    const [selectedPerformanceId, setSelectedPerformanceId] = useState('');
    // const renderPerformance : ListRenderItem<Performance> = ({item}:{item: {id:string; title:string; date:string;}}) => (

    const renderPerformance = ({ item }: { item: { id: string; title: string; date: string; venue: string; } }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Recordings')} style={[styles.show_container]}>
            <Text style={styles.date}> {item.date} </Text>
            <Text style={styles.venue}> {item.venue} </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text> Hello, Eyes of the World </Text>
            <FlatList data={performancesData}
                renderItem={renderPerformance}
                keyExtractor={item => item.id}
                horizontal={true}
            />
        </SafeAreaView>
    );
};



function Recordings ({ navigation }){
    const renderRecording = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Recording')} style={[styles.show_container]}>
            <Text style={styles.date}> {item.date}</Text>
            <Text style={styles.venue}> {item.venue}</Text>
        </TouchableOpacity>);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList data={recordingsData}
                renderItem={renderRecording}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    );
};



function Recording ({ navigation }) {
    const playSong = () => {return;}

    const renderSong = ({ item }) => (
        <TouchableOpacity onPress={playSong} style={[styles.show_container]}>
            <Text style={styles.date}> {item.track} </Text>
            <Text style={styles.venue}> {item.title} </Text>
        </TouchableOpacity>);

    return (
        <SafeAreaView style={styles.container}>
            <Text> Grateful Dead </Text>
            <Text> Live At Fillmore East </Text>
            <View>
            <Text>
            <FavouriteButton />
            <DownloadButton />
            </Text>
            </View>
            <FlatList data={songsData}
                renderItem={renderSong}
                keyExtractor={item => item.id} />
        </SafeAreaView>
    )
};


const FavouriteButton = () => {
    return (
        <View>
            <Button onPress={onPress} title="Favourite" />
        </View>)
};

const DownloadButton = () => {
    return (
        <View>
            <Button onPress={onPress} title="Download" />
        </View>)
};

function Bands() {
    const bands = useQuery(query('bands'));
    if (bands === null) {
        return <Text> Loading Bands ...</Text>
    }
    return (
        <View>
            {bands.map(band => <Band key={band.id} band={band} />)}
        </View>)
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

    return (
        <View>
            <TextInput style={styles.input} onChangeText={setName} value={name} />
            <TextInput style={styles.input} onChangeText={setCollection} value={collection} />
            <View>
                <Button onPress={onPressAddBand} title="Add Band" disabled={isLoading} />
            </View>
        </View>)
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    show: { color: 'white' },
    venue: {
        color: 'grey',
        fontSize: 14
    },
    date: {
        color: 'white',
        fontSize: 18,
        fontWeight: "bold"
    },
    show_container: {
        backgroundColor: '#33448cff',
        color: 'white',
        width: 120,
        height: 160,
        margin: 4,
        borderRadius: 5
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
