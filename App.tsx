import { StatusBar } from 'expo-status-bar';

import {StyleSheet, Text, View, TextInput } from 'react-native';

import {TouchableOpacity} from 'react-native';
import {SafeAreaView, SectionList, FlatList, ListRenderItem} from 'react-native';

import { query, createRecord, initIHPBackend, initAuth} from 'ihp-backend';
import { useQuery} from 'ihp-backend/react';
import { useEffect, useState } from 'react';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

import * as Linking from 'expo-linking';

//Naviation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


//More UI Elements
import { Button } from '@rneui/base';

import Ionicons from '@expo/vector-icons/Ionicons';

import 'expo-dev-client';

const ihpBackend = { host: 'https://attics.di1337.com' };

// Some mock data to put in the navigation skeleton.
const performancesData = [
    { year: "1966",
      data: [{
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
    }]
    },
    {year:"1967",
     data: [{
        id: 'bd7acbea-c2b2-46c2-aed5-3ad53abb28ba',
        title: 'First Item',
        date: '1967-03-18',
        venue: 'Winterland Arena'
     }]}
];


const recordingsData = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        performance_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        archive_downloads: 5432,
        avg_rating: 3.5,
        reviews : 51,
        transferer: 'lestatkatt@aol.com'
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        performance_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        archive_downloads: 10000,
        avg_rating: 4.5,
        reviews: 3.5,
        transferer: 'Charlie Miller'
    }
];

const songsData = [
    {
        id: 'bd7fcbea-c1b1-46c2-aed5-3ad53abb28ba',
        recording_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: "Help On The Way",
        length: "10:14",
        track: 1
    },
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        recording_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: "Slipknot!",
        length: "7:14",
        track: 2
    },
    {
        id: 'bd7gebec-c1b1-46c2-aed5-3ad53abb28ba',
        recording_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: "Trucking",
        length: "5:14",
        track: 3
    },
    {
        id: 'ad7klbec-c1b1-46c2-aed5-3ad53abb28ba',
        recording_id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: "Me and My Uncle",
        length: "04:14",
        track: 4
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
                getItem: (key:string) => {
                    if (key === 'ihp_jwt') {
                        return jwt;
                    }
                },
                removeItem: (key) => {
                    return null;
                }
            };
            await initAuth();
//            setLoggedIn(true);
        }
        };
        fetchJWT();
    },[]);

    return (
        <NavigationContainer>
            <Tab.Navigator   screenOptions={{headerShown: false}}>
            <Tab.Screen name="Browse" options={BrowseIcon} component={PerformanceStackScreen} />
            <Tab.Screen name="My Shows" options={HeartIcon} component={Bands} />
            <Tab.Screen name="More" options={EllipsisIcon} component={MoreInfo} />
            </Tab.Navigator>
        </NavigationContainer>
  );
}


const BrowseIcon = {tabBarIcon: () => {return (<Ionicons name="musical-note" size={32} color="grey" />)}}
const HeartIcon = {tabBarIcon: () => {return (<Ionicons name="heart" size={32} color="grey" />)}}
const EllipsisIcon = {tabBarIcon: (props) => {return (<Ionicons name="ellipsis-horizontal" size={32} color={props.isFocused? "#33448cff":"grey"} />)}}

const EmptyStarIcon = {tabBarIcon: () => {return (<Ionicons name="star" size={32} color="grey" />)}}
const HalfEmptyStarIcon = {tabBarIcon: () => {return (<Ionicons name="star" size={32} color="#FF9500" />)}}
const DarkStarIcon = {tabBarIcon: () => {return (<Ionicons name="star" size={32} color="#FF9500" />)}}



function PerformanceStackScreen() {
    return (
        <PerformanceStack.Navigator  screenOptions ={{headerStyle: {backgroundColor: "#33448cff"},
                                                      headerTintColor : 'white'
                                                     }}>
            <PerformanceStack.Screen name="Performances" component={Performances}
                options={{
                    headerTitle: props => <Text style={[{marginBottom:12, marginTop:60, color:'white', fontSize:32, fontWeight:'700'}]}> Grateful Dead </Text>,
                    headerRight: () => (
                        <Button
                         onPress={() => alert('Not changing it!')}
                         title="Change Band"
                         buttonStyle={{backgroundColor:'#33448cff'}}
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
   {<View>
    <Text> Tips and things. </Text>
    </View>
    }

//return  [...Array(5)].map((x, i) => <Ionicons name="star" size={32} color="#FF9500" key={i}/>)

const starElements =  [...Array(5)].map((x, i) => <Ionicons name="star" size={20} color="#FF9500" key={i}/>)

function Performances ({ navigation }) {
    const renderPerformance = ({ item }: { item: { id: string; title: string; date: string; venue: string; } }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Recordings')} style={[styles.show_container]}>
            <View style={[styles.ratings]}>
              {starElements}
            </View>
            <Text style={styles.date}> {item.date} </Text>
            <Text style={styles.venue}> {item.venue} </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <SectionList sections={performancesData}
                         stickySectionHeadersEnabled={false}
                         keyExtractor={(item, index) => item.id + index}
        renderSectionHeader={({ section }) => (
            <>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={styles.header}> {section.year} </Text>
                <Text style={{color:'white'}}> See All </Text>
                </View>
                <FlatList data={section.data}
                  renderItem={renderPerformance}
                  keyExtractor={item => item.id}
                  horizontal={true}
                />
                </>
                         )}
                renderItem={()=>{return null;}}
                horizontal={false}
            />
        </SafeAreaView>
    );
};


function Recordings ({ navigation }){
    const renderRecording = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Recording')} style={[styles.recording_container]}>
            <View style={{flexDirection:"row-reverse"}}>
              {starElements}
            </View>
            <Text style={styles.date}> {item.transferer}</Text>
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
        <TouchableOpacity onPress={playSong} style={[styles.track_listing]}>
            <View style={styles.tracks}>
            <View style={{flexDirection:'row'}}>
            <Text style={styles.index}> {item.track} </Text>
            <Text style={styles.track}> {item.title} </Text>
            </View>
            <Text style={styles.timing}> {item.length} </Text>
            </View>
        </TouchableOpacity>);

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ marginTop:30, marginBottom:30}}>
            <Text style={{ color:'white', fontSize: 32, fontWeight: '700' }} > Grateful Dead </Text>
            <Text style={{ color:'white', fontSize: 24, fontWeight: '600' }} >  Live At Fillmore East </Text>
            <Text style={{ color:'white', fontSize: 24, fontWeight: '600' }} >  1971-04-29 </Text>
            </View>

            <View style={{flexDirection:'row', marginBottom:30}}>
                <FavouriteButton />
                <DownloadButton />
            </View>

            <FlatList data={songsData}
                renderItem={renderSong}
                keyExtractor={item => item.id}/>
        </SafeAreaView>
    )
};

const heartOutlineIcon = () => {return <Ionicons name="heart-outline" size={32} color="red"/>}
const heartFilledIcon = () => {return <Ionicons name="heart" size={32} color="white"/>}
const DownloadIcon = () => {return <Ionicons name="download" size={32} color="#33448cff" />}

const FavouriteButton = () => {
    const [isToggled, setToggleFavourite] = useState(false)
    return (
        <Button onPress={()=> {setToggleFavourite(!isToggled); return;}}
        buttonStyle={{borderColor:"red", backgroundColor: isToggled? "red":"black" }}
        titleStyle={isToggled ? {color:"white"} : {color:"red"}}
        containerStyle={{marginRight:30}}
        type="outline"
        title={isToggled? "Unfavourite":"Favourite"}
        icon={isToggled? heartFilledIcon():heartOutlineIcon()}/>
    )
};

const DownloadButton = () => {
    const [isToggled, setToggleDownload] = useState(false)
    return (
        <Button onPress={()=> {setToggleDownload(!isToggled); return;}}
        titleStyle={isToggled ? {color:"white"} : {color:"#33448cff"}}
        buttonStyle={{backgroundColor: isToggled? "green":"black" }}
        type="outline"
        title={isToggled ? "Downloaded":"Download"}
        icon={<DownloadIcon/>} />
    )

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


const greenButton = (title:string) => {
    return (
        <Button onPress={()=> {return;}}
        titleStyle={{color:"white"}}
        buttonStyle={{backgroundColor: "green" }}
        type="outline"
        title={title}/>
    )
};


const dangerButton = (title:string) => {
    return (
              <Button onPress={()=> {return;}}
        titleStyle={{color:"red"}}
        buttonStyle={{backgroundColor: "black" }}
        type="outline"
        title={title}/>
    )
};

const infoButton = (title:string) => {
    return (
              <Button onPress={()=> {return;}}
        titleStyle={{color:"orange"}}
        buttonStyle={{backgroundColor: "black" }}
        type="outline"
        title={title}/>
    )
};

function MoreInfo(){
    return(
        <SafeAreaView style={styles.container}>
            <View>

            <Text style={styles.info}>
            Version 1.5
        </Text>

            <Text style={styles.info}>
            Developed by Zachary Wood
        </Text>

            <Text style={styles.info}>
            Developed by Zachary Wood
        </Text>

            <Text style={styles.info}>
            Leave a review on the App Store!
        </Text>

            <Text style={styles.info}>
            See the source code on GitHub
        </Text>

            <Text style={styles.info}>
            Suggestions? Send me a message
        </Text>

            <Text style={styles.info}>
            View last update popup
        </Text>

            <Text style={styles.info}>
            Live Music Archive streaming policy
        </Text>

            {dangerButton("Delete all downloads")}
            {infoButton("Migrate from v. 4")}

            <Text style={styles.info}>
            Attics is proudly powered by the Internet Archive's Live
            Music Archive. Please consider supporting their awesome work with a
            donation!
            </Text>

            {greenButton ("Donate to archive.org")}

            <Text style={styles.info}>
        Running Attics's servers has monthly costs for me as well. To support me and
        future development work on Attics, feel free to leave a tip below, review the app, or just send a nice message.
            </Text>

            {greenButton ("Zac's Tip Jar")}


            </View>
        </SafeAreaView>
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
        justifyContent: 'center'
    },
    show: { color: 'white' },
    venue: {
        color: 'grey',
        fontSize: 14
    },
    info : {
        color:'white',
        fontSize: 18,
        fontWeight: '600'
    },
    button: {
        color:"33448cff",
        backgroundColor:"black",
        margin:4
    },
    header:{
        color: 'white',
        fontSize: 32,
        fontWeight: "bold"
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
        height: 140,
        margin: 4,
        borderRadius: 5
    },
    recording_container: {
        backgroundColor: '#33448cff',
        color: 'white',
        height: 120,
        width: 260,
        padding:20,
        margin: 4,
        borderRadius: 5
    },
    tracks:{
        width:380,
        justifyContent:"space-between",
        flexDirection:'row',
    },
    track:{
        color: 'white',
        fontSize: 18,
        fontWeight: "bold"
    },
    index : {
        color: 'grey',
        fontSize: 14
    },
    timing : {
        color: 'grey',
        fontSize: 14
    },
    track_listing: {
        backgroundColor: 'black',
        color: 'white',
        height: 40
    },
    ratings: {
        marginLeft:4,
        marginTop:10,
        paddingBottom:40,
        flexDirection:'row'
    },
    input: {
        height: 40,
        minWidth: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    }
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
