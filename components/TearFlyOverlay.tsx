import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { PaperTexture } from "@/components/PaperTexture";
import { TornEdgeSvg } from "@/components/TornEdgeSvg";
import type { AnimationSubmission, ScreenRect } from "@/context/AnimationCoordinator";

interface TearFlyOverlayProps {
  request: AnimationSubmission;
  targetRect: ScreenRect;
  onComplete: () => void;
  onTearStart: () => void;
}

export function TearFlyOverlay({ request, targetRect, onComplete, onTearStart }: TearFlyOverlayProps) {
  const tearProgress = useSharedValue(0);
  const flightProgress = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  const onTearStartRef = useRef(onTearStart);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTearStartRef.current = onTearStart;
  }, [onComplete, onTearStart]);

  useEffect(() => {
    onTearStartRef.current();
    const finish = () => onCompleteRef.current();

    if (reduceMotion) {
      flightProgress.value = withTiming(
        1,
        { duration: 150, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.Never },
        (finished) => {
          if (finished) runOnJS(finish)();
        },
      );
      return;
    }

    tearProgress.value = withTiming(
      1,
      { duration: 220, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.Never },
      (finished) => {
        if (!finished) return;
        flightProgress.value = withTiming(
          1,
          { duration: 430, easing: Easing.inOut(Easing.cubic), reduceMotion: ReduceMotion.Never },
          (flightFinished) => {
            if (flightFinished) runOnJS(finish)();
          },
        );
      },
    );
  }, [flightProgress, reduceMotion, request.taskId, tearProgress]);

  const containerStyle = useAnimatedStyle(() => {
    const t = flightProgress.value;
    const startCenterX = request.sourceRect.x + request.sourceRect.width / 2;
    const startCenterY = request.sourceRect.y + request.sourceRect.height / 2;
    const targetCenterX = targetRect.x + targetRect.width / 2;
    const targetCenterY = targetRect.y + targetRect.height / 2;
    const controlX = (startCenterX + targetCenterX) / 2 + 56;
    const controlY = Math.min(startCenterY, targetCenterY) - (reduceMotion ? 12 : 120);
    const inverse = 1 - t;
    const x = inverse * inverse * startCenterX + 2 * inverse * t * controlX + t * t * targetCenterX;
    const y = inverse * inverse * startCenterY + 2 * inverse * t * controlY + t * t * targetCenterY;
    const scale = reduceMotion ? 1 - t * 0.22 : 1 - t * 0.86;

    return {
      opacity: t < 0.72 ? 1 : 1 - ((t - 0.72) / 0.28) * 0.72,
      transform: [
        { translateX: x - startCenterX },
        { translateY: y - startCenterY },
        { rotate: reduceMotion ? "0deg" : `${t * 9}deg` },
        { scale },
      ],
    };
  });

  const topStyle = useAnimatedStyle(() => ({
    opacity: 1 - flightProgress.value,
    transform: [
      { translateY: reduceMotion ? 0 : -tearProgress.value * 9 },
      { rotate: reduceMotion ? "0deg" : `${tearProgress.value * -2.5}deg` },
    ],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: reduceMotion ? flightProgress.value * 6 : tearProgress.value * 12 },
      { rotate: reduceMotion ? "0deg" : `${tearProgress.value * 1.2}deg` },
    ],
  }));

  const stripHeight = Math.min(64, request.sourceRect.height * 0.18);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: request.sourceRect.x,
          top: request.sourceRect.y,
          width: request.sourceRect.width,
          height: request.sourceRect.height,
          zIndex: 1000,
        },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: stripHeight,
            backgroundColor: "#FFEB7A",
            overflow: "hidden",
            shadowColor: "#392E18",
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 6,
          },
          topStyle,
        ]}
      >
        <PaperTexture />
        <View className="absolute bottom-[-8px] left-0 right-0">
          <TornEdgeSvg />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: stripHeight - 7,
            bottom: 0,
            backgroundColor: "#FFEB7A",
            overflow: "hidden",
            shadowColor: "#392E18",
            shadowOpacity: 0.24,
            shadowRadius: 10,
            elevation: 9,
          },
          sheetStyle,
        ]}
      >
        <PaperTexture />
        <View className="absolute left-0 right-0 top-[-8px]">
          <TornEdgeSvg inverted />
        </View>
        <View className="px-7 pt-8">
          <Text
            className="text-[25px] leading-8 text-stone-900"
            numberOfLines={2}
            style={{ fontFamily: "Kalam_700Bold" }}
          >
            {request.previewTitle}
          </Text>
          {request.previewDescription ? (
            <Text
              className="mt-2 text-[18px] leading-6 text-stone-700"
              numberOfLines={4}
              style={{ fontFamily: "Kalam_400Regular" }}
            >
              {request.previewDescription}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  );
}
