import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Button,
  FlatList,
} from 'react-native';
import { Constants, MapView } from 'expo';
// import Timeline from 'react-native-timeline-listview';
import Timeline from '../components/timeline-listview';
import Collapsible from 'react-native-collapsible';
import TimelineItem from '../components/TimeLineItem';
import { Ionicons } from '@expo/vector-icons';
import d from './d';

// https://github.com/habibridho/RNCollapsingToolbar/blob/master/App.js

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const HEADER_EXPANDED_HEIGHT = 500;
const HEADER_COLLAPSED_HEIGHT = 60;

// TODO: fill with real polylineCoors
// going from ORIGIN to DESTINATION from view1
const polylineCoors = [
  { latitude: 62.8025259, longitude: 24.4351431 },
  { latitude: 61.7896386, longitude: 23.421646 },
  { latitude: 59.7665248, longitude: 25.4161628 },
];
// TODO: number of steps to follow, each store point will have a collapsible list of items that user will buy
const start = new Date();
let millis = start.getTime();
// now.getTime()
const newData = d.path.reduce((acc, el) => {
  const arr = el.instructions.split(' ');
  let mode = arr[0];
  let des = arr.slice(2).join(' ');
  millis = el.duration.value * 1000 + millis;
  const m = new Date(millis);
  
  return [...acc, {
      title: `${mode} ${el.duration.text}`,
      icon: el.travelMode === 'WALKING' ? 'md-walk' : 'md-bus'
    }, {
      title: des,
      icon: 'md-locate',
      time: `${m.getHours()}:${m.getMinutes() < 10 ? '0' + m.getMinutes() : m.getMinutes()}`
    }]
}, [{title: `Ylioppilaskylä, Turku`, icon: 'md-locate', time: `${start.getHours()}:${start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes()}`}] );


export default class View3 extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'MAP',
    headerStyle: {
      backgroundColor: '#203546',
    },
    headerTintColor: '#f7c744',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerLeft: <Ionicons
          name="md-arrow-back"
          size={40}
          color="#B3D6C6"
          style={{ marginLeft: 10}}
          onPress={() => navigation.goBack()}
        />
  });
  state = {
    // default to HELSINKI
    region: {
      latitude: 60.4521556,
      longitude: 22.266266200000018,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markers: [],
    scrollY: new Animated.Value(0),
    isCollapsed: true,
  };

  componentWillMount
  onRegionChange(region) {
    this.setState({ region });
  }

  renderDetail = (rowData, sectionID, rowID) => {
    return <TimelineItem rowData={rowData} />;
  };

  renderPolyLine = () => {
    return d.path.map((el, i) => {
      return (
        <MapView.Polyline
          key={i}
          coordinates={el.path.map(({ lat, lng }) => ({ latitude: lat, longitude: lng}))}
          strokeColor={el.travelMode === "TRANSIT" ? "#203546" : "red"} 
          strokeWidth={5}
        />
      )
    })
  }

  render() {
    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
      extrapolate: 'clamp',
    });
    // const headerTitleOpacity = this.state.scrollY.interpolate({
    //   inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    //   outputRange: [0, 1],
    //   extrapolate: 'clamp',
    // });
    // const heroTitleOpacity = this.state.scrollY.interpolate({
    //   inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    //   outputRange: [1, 0],
    //   extrapolate: 'clamp',
    // });
    console.log(d);
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.header, { height: headerHeight }]}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 60.4521556,
              longitude: 22.266266200000018,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <MapView.Marker
              title="Starting point"
              description="Yo-kyla"
              coordinate={{ latitude: d.path[0].startLocation.lat, longitude: d.path[0].startLocation.lng}}>
            </MapView.Marker>
            {this.renderPolyLine()}
          </MapView>
          
        </Animated.View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          onScroll={Animated.event([
            {
              nativeEvent: {
                contentOffset: {
                  y: this.state.scrollY,
                },
              },
            },
          ])}
          scrollEventThrottle={16}>
          <Timeline
            data={newData}
            renderDetail={this.renderDetail}
            options={{
              removeClippedSubviews: false,
              style:{paddingTop:5}
            }}
            circleSize={25}
            circleColor='#B3D6C6'
            lineColor='#B3D6C6'
            timeContainerStyle={{minWidth:52, marginTop: -5, marginBottom: 40}}
            timeStyle={{textAlign: 'center', color:'#B3D6C6', padding: 5, borderRadius:13}}
            descriptionStyle={{ marginTop: 0 }}
            detailContainerStyle={{ marginTop: -15 }}
            innerCircle={'icon'}
            columnFormat='single-column-left'
          />
        </ScrollView>
      </View>
    );
  }
}
// change padding of description
// show icon
// <Text>{content}</Text>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#203546',
  },
  scrollContainer: {
    backgroundColor: '#203546',
    padding: 16,
    paddingTop: HEADER_EXPANDED_HEIGHT + 10,
  },
  header: {
    backgroundColor: 'lightblue',
    position: 'absolute',
    width: SCREEN_WIDTH,
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
