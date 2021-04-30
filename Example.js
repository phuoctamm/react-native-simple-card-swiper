import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

import Swiper from './Swiper';

const data = [{name: 'Foo'}, {name: 'Baz'}, {name: 'Lo'}, {name: 'Haz'}];

function Example() {
  const renderItem = (item, index) => {
    return (
      <View style={styles.card}>
        <Text>{item.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <Swiper
          data={data}
          renderCard={renderItem}
          LeftLabel={
            <View style={styles.label}>
              <Text>Nope</Text>
            </View>
          }
          RightLabel={
            <View style={styles.label}>
              <Text>Like</Text>
            </View>
          }
          onSwipeLeft={item => {
            console.log('left');
          }}
          onSwipeRight={item => {
            console.log('right');
          }}
          onSwipe={(item, index) => {
            console.log('swipe', index);
          }}
          onComplete={() => {
            console.log('complete');
          }}
        />
      </View>
      <View>
        <Text>Some text</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    aspectRatio: 1 / 1.5,
  },
  label: {
    borderWidth: 2,
    borderColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default Example;
