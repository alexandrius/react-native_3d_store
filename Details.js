import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native";
// import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  getBottomSpace,
  getStatusBarHeight,
} from "react-native-iphone-x-helper";
import {
  Svg,
  Defs,
  RadialGradient,
  Stop,
  Ellipse,
  Circle,
  Image as SvgImage,
} from "react-native-svg";

const colorPrimary = "#2596be";

const { width, height } = Dimensions.get("window");

const ORIGINAL_BUTTON_WIDTH = width - 100;
const BUTTON_SIZE = 50;

const COORDS = { x: 0, y: 0 };

export default function Details() {
  const buttonRef = useRef(null);
  const cartRef = useRef(null);

  const cartCoords = useSharedValue({ ...COORDS });
  const ballCoords = useSharedValue({ ...COORDS });

  const ballOpacity = useSharedValue(0);
  const ballAnimation = useSharedValue(0);
  const buttonWidth = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  function calcBezier(interpolatedValue, p0, p1, p2) {
    "worklet";
    return Math.round(
      Math.pow(1 - interpolatedValue, 2) * p0 +
        2 * (1 - interpolatedValue) * interpolatedValue * p1 +
        Math.pow(interpolatedValue, 2) * p2
    );
  }

  const ballStyle = useAnimatedStyle(() => {
    const cart = cartCoords.value;
    const ball = ballCoords.value;

    const translateX = calcBezier(ballAnimation.value, ball.x, ball.x, cart.x);
    const translateY = calcBezier(
      ballAnimation.value,
      ball.y,
      cart.y - 10,
      cart.y - 10
    );

    return {
      opacity: ballOpacity.value,
      transform: [
        { translateX },
        { translateY },
        { scale: interpolate(ballAnimation.value, [0, 1], [1, 0.2]) },
      ],
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      width: interpolate(
        buttonWidth.value,
        [0, 1],
        [BUTTON_SIZE, ORIGINAL_BUTTON_WIDTH]
      ),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonWidth.value,
    };
  });

  function setBallPosition(y) {
    ballCoords.value = { x: width / 2 - BUTTON_SIZE / 2, y };
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.flex}
      >
        <View>
          <View style={styles.imageContainer}>
            <View style={styles.image} />
            <Svg style={{ position: "absolute" }} height={width} width={width}>
              <Defs>
                <RadialGradient id="grad">
                  <Stop
                    offset="0"
                    stopColor="rgba(255,255,255)"
                    stopOpacity="0"
                  />
                  <Stop
                    offset="0.9"
                    stopColor="rgba(0,0,0,0)"
                    stopOpacity="1"
                  />
                </RadialGradient>
              </Defs>
              <Circle
                cx={width / 2}
                cy={height / 2}
                r={height}
                fill="url(#grad)"
              />
            </Svg>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Cobra Bowling - (2022 Edition)</Text>
            <Text style={styles.description}>- Awesome Look</Text>
            <Text style={styles.description}>- Soft and Durable</Text>
            <Text style={styles.description}>- BluHeel Stitched</Text>
            <Text style={styles.description}>
              - Package Dimensions: 12.0 L x 3.0 H x 6.0 W{" "}
            </Text>
            <Text style={styles.description}>- Country of Origin: Georgia</Text>
          </View>
        </View>

        <View>
          <View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>Was: </Text>
              <Text style={styles.priceOld}>$ 350</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>Price: </Text>
              <Text style={styles.price}>$ 199</Text>
            </View>
          </View>

          {/** Wrapped into View since TouchableOpacity can't animate opacity */}
          <Animated.View style={[styles.buttonContainer, buttonStyle]}>
            <TouchableOpacity
              ref={buttonRef}
              activeOpacity={1}
              style={styles.button}
              onPress={() => {
                buttonRef.current.measure(
                  (_x, _y, _width, _height, _px, py) => {
                    setBallPosition(py);

                    buttonWidth.value = withTiming(
                      0,
                      {
                        duration: 300,
                        easing: Easing.bezier(0.11, 0, 0.5, 0),
                      },
                      () => {
                        ballOpacity.value = 1;
                        buttonOpacity.value = 0;
                        ballAnimation.value = withTiming(1, {
                          duration: 900,
                          easing: Easing.bezier(0.12, 0, 0.39, 0),
                        });
                      }
                    );
                  }
                );
              }}
            >
              <Animated.Text style={[styles.buttonLabel, labelStyle]}>
                Add to Cart
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.navContainer}>
        <View style={styles.navButton}>
          {/* <FontAwesome5
            size={15}
            color="rgb(115,114,131)"
            name="chevron-left"
          /> */}
        </View>
        <View
          style={styles.navButton}
          ref={cartRef}
          onLayout={() => {
            //Precalculate cart button position
            if (cartRef.current && !cartCoords.value.x && !cartCoords.value.y)
              cartRef.current.measure((_x, _y, _width, _height, px, py) => {
                cartCoords.value = { x: px, y: py };
              });
          }}
        >
          {/* <FontAwesome5
            color="rgb(115,114,131)"
            name="shopping-cart"
            size={15}
          /> */}
        </View>
      </View>

      <Animated.View style={[styles.cartItemBall, ballStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  navContainer: {
    top: getStatusBarHeight() + 40,
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 1,
  },
  navButton: {
    height: 44,
    width: 44,
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: getBottomSpace() || 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  imageContainer: {
    backgroundColor: "black",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    height: 300,
    width: "100%",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#8a8a8a",
    marginBottom: 10,
    opacity: 0.2,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2b2b2b",
    marginBottom: 10,
  },
  description: {
    color: "#454545",
    fontSize: 14,
    marginVertical: 5,
  },
  priceKey: {
    color: "#454545",
    width: 40,
  },
  priceContainer: {
    marginLeft: 20,
    marginTop: 30,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
  },
  priceOld: {
    color: "#595959",
    fontWeight: "bold",
    fontSize: 18,
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  price: {
    color: "#454545",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: BUTTON_SIZE / 2,
    width: ORIGINAL_BUTTON_WIDTH,
    height: BUTTON_SIZE,
    alignSelf: "center",
    overflow: "hidden",
  },
  button: {
    backgroundColor: colorPrimary,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonLabel: {
    color: "white",
    width: ORIGINAL_BUTTON_WIDTH,
    textAlign: "center",
  },
  cartItemBall: {
    position: "absolute",
    height: BUTTON_SIZE,
    width: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colorPrimary,
  },
});
