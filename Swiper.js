import React, {useState, useRef} from 'react';
import {
  View,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;
const STACKS_DEFAULT_SCALE = 0.9;

function Swiper({
  data,
  renderCard,
  onComplete,
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  LeftLabel,
  RightLabel,
}) {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const childScale = useRef(new Animated.Value(STACKS_DEFAULT_SCALE)).current;
  const labelLeftOpacity = useRef(new Animated.Value(0)).current;
  const labelRightOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderMove: (evt, gestureState) => {
      onPanMoving(gestureState);
    },
    onPanResponderRelease: (evt, gestureState) => {
      switch (true) {
        case gestureState.dx > SWIPE_THRESHOLD:
          handleForceSwipe('right');
          break;
        case gestureState.dx < -SWIPE_THRESHOLD:
          handleForceSwipe('left');
          break;
        default:
          handleResetPosition();
          break;
      }
    },
  });

  const onPanMoving = gestureState => {
    position.setValue({x: gestureState.dx, y: 0});
    childScale.setValue(gestureState.dx);
    labelLeftOpacity.setValue(gestureState.dx);
    labelRightOpacity.setValue(gestureState.dx);
  };

  const cardSwipeStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-20deg', '0deg', '20deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{rotate}],
    };
  };

  const cardSwipeChildScaleStyle = () => {
    const scale = childScale.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      outputRange: [1, STACKS_DEFAULT_SCALE, 1],
      extrapolate: 'clamp',
    });

    return {
      transform: [{scale: scale}],
    };
  };

  const labelLeftOpacityStyle = () => {
    const opacity = labelLeftOpacity.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return {opacity};
  };

  const labelRightOpacityStyle = () => {
    const opacity = labelRightOpacity.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return {opacity};
  };

  const handleSwipeComplete = direction => {
    position.setValue({x: 0, y: 0});
    labelLeftOpacity.setValue(0);
    labelRightOpacity.setValue(0);
    childScale.setValue(STACKS_DEFAULT_SCALE);

    const nextIndex = index + 1;
    setIndex(nextIndex);

    const item = data[index];
    onSwipe(item, index);
    direction === 'right'
      ? onSwipeRight(item, index)
      : onSwipeLeft(item, index);

    if (!data[nextIndex]) {
      onComplete();
    }
  };

  const handleResetPosition = () => {
    Animated.spring(position, {
      toValue: {x: 0, y: 0},
      useNativeDriver: false,
    }).start();
    Animated.spring(labelLeftOpacity, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    Animated.spring(labelRightOpacity, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleForceSwipe = direction => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: {x, y: 0},
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => handleSwipeComplete(direction));
  };

  const renderLabels = () => {
    return (
      <View style={styles.labels}>
        <View style={styles.labelContent}>
          <Animated.View style={labelLeftOpacityStyle()}>
            {LeftLabel ? (
              LeftLabel
            ) : (
              <View style={styles.labelLeft}>
                <Text>Nope</Text>
              </View>
            )}
          </Animated.View>
          <Animated.View style={labelRightOpacityStyle()}>
            {RightLabel ? (
              RightLabel
            ) : (
              <View style={styles.labelLeft}>
                <Text>Like</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderCardItem = (item, i) => {
    if (i < index) {
      return null;
    }

    if (i === index) {
      return (
        <Animated.View
          style={[styles.card, cardSwipeStyle()]}
          key={i}
          {...panResponder.panHandlers}>
          {renderLabels()}
          {renderCard(item)}
        </Animated.View>
      );
    }

    return (
      <Animated.View
        key={i}
        style={[styles.card, cardSwipeChildScaleStyle(), {zIndex: -i}]}>
        {renderCard(item)}
      </Animated.View>
    );
  };

  return <View>{data.map(renderCardItem)}</View>;
}

Swiper.defaultProps = {
  data: [],
  onComplete: () => {},
  onSwipe: () => {},
  onSwipeLeft: () => {},
  onSwipeRight: () => {},
};

Swiper.propTypes = {
  data: PropTypes.array.isRequired,
  renderCard: PropTypes.any.isRequired,
  LeftLabel: PropTypes.node,
  RightLabel: PropTypes.node,
  onComplete: PropTypes.func,
  onSwipe: PropTypes.func,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
  },
  labels: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 999,
    width: '100%',
  },
  labelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelLeft: {
    borderWidth: 2,
    borderColor: '#f50',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  labelRight: {
    borderWidth: 2,
    borderColor: '#f50',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
});

export default Swiper;
