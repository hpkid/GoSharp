import * as React from 'react';
import { View, Button, Text } from 'react-native';
import { LinearGradient } from 'expo';

const StyledButton = (props) => {
  return (
    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LinearGradient
            // colors={['#CAD8DE', '#FFF9FB']}
            colors={['#A8CCC9', '#75B9BE']}
            style={{ marginTop: 50, padding: 10, borderRadius: 10, width: 150 }}>
            <Button
              title="NEXT"
              onPress={props.onPress}
              style={{
                backgroundColor: 'transparent',
                fontSize: 30,
              }}>
            </Button>
          </LinearGradient>
        </View>
  )
}

export default StyledButton;