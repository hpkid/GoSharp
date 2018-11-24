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
import content from './content';
// import Timeline from 'react-native-timeline-listview';
import Timeline from '../components/timeline-listview';
import Collapsible from 'react-native-collapsible';
import TimelineItem from '../components/TimeLineItem';
import { Ionicons } from '@expo/vector-icons';


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
const data = [
  {
    time: '09:00',
    title: 'ORIGIN',
    icon: 'md-locate',
    description: [
      'Event 1 Description',
      'Event 1 Description',
      'Event 1 Description',
    ],
  },
  {
    time: '10:45',
    title: 'Walk x min',
    icon: 'md-walk',
    description: [
      'Event 1 Description',
      'Event 1 Description',
      'Event 1 Description',
    ],
  },
  {
    time: '12:00',
    title: 'Liddl - x min - y euro',
    icon: 'md-cart',
    description: [
      'Event 1 Description',
      'Event 1 Description',
      'Event 1 Description',
    ],
  },
  {
    time: '14:00',
    title: 'SS-Market - x min - y euro',
        icon: 'md-cart',
    description: [
      'Event 1 Description',
      'Event 1 Description',
      'Event 1 Description',
    ],
  },
  {
    time: '16:30',
    title: 'KK-Supermarket - x min - y euro',
        icon: 'md-cart',
    description: [
      'Event 1 Description',
      'Event 1 Description',
      'Event 1 Description',
    ],
  },
  {
    time: '17:00',
    title: 'DESTINATION',
    icon: 'md-locate',
    description: [
      'Event 1 Description',
      'Event 1 Description',
      'Event 1 Description',
    ],
  },
];

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
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markers: [],
    scrollY: new Animated.Value(0),
    isCollapsed: true,
  };
  onRegionChange(region) {
    this.setState({ region });
  }

  renderDetail = (rowData, sectionID, rowID) => {
    return <TimelineItem rowData={rowData} />;
  };

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
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.header, { height: headerHeight }]}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 60.16952,
              longitude: 24.93545,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <MapView.Marker
              coordinate={{
                latitude: 60.16952,
                longitude: 24.93545,
              }}
              title={'Helsinki'}
              description={"Finland's Capital"}
              key={'capital'}
            />
            <MapView.Polyline
              coordinates={polylineCoors}
              strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
              strokeColors={['#000']}
              strokeWidth={2}
            />
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
            data={data}
            renderDetail={this.renderDetail}
            options={{
              removeClippedSubviews: false,
              style:{paddingTop:5}
            }}
            circleSize={18}
            circleColor='#B3D6C6'
            lineColor='#B3D6C6'
            timeContainerStyle={{minWidth:52, marginTop: -5, marginBottom: 40}}
            timeStyle={{textAlign: 'center', backgroundColor:'#f7c744', color:'#203546', padding: 5, borderRadius:13}}
            descriptionStyle={{ marginTop: 0 }}
            detailContainerStyle={{ marginTop: -15 }}
            innerCircle={'icon'}
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
