import * as React from 'react';
import { View, Text, FlatList,StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';

class TimeLineItem extends React.Component {
  state = { isCollapsed: true }

  _keyExtractor = (item, index) => index;
  showDesc = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  render() {
      const { rowData } = this.props;
      let title = (
      <Text style={[styles.title]} onPress={() => this.showDesc()}>
        {rowData.title}
      </Text>
    );
    var desc = null;
    if (rowData.description)
      desc = (
        <View style={styles.descriptionContainer}>
          <FlatList
            data={rowData.description}
            renderItem={({item}) => <Text style={[styles.textDescription]}>{item}</Text>}
          />
        </View>
      );
//<Text style={[styles.textDescription]}>{rowData.description}</Text>
    return (
      <View style={{ flex: 1 }}>
        {title}
        <Collapsible collapsed={this.state.isCollapsed}>{desc}</Collapsible>
      </View>
    );
  }
}

export default TimeLineItem;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7c744'
  },
  descriptionContainer: {
    flexDirection: 'row',
    paddingRight: 50,
  },
  textDescription: {
    marginLeft: 10,
    color: '#B3D6C6',
  },
});
