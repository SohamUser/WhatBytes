import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useState } from "react";

const SOUND_PREFERENCE_KEY = "sticky-note.sound-enabled.v1";

export function useTearSound() {
  const player = useAudioPlayer(require("../assets/sounds/tear.wav"));
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    player.volume = 0.45;
  }, [player]);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(SOUND_PREFERENCE_KEY).then((storedValue) => {
      if (active && storedValue !== null) setSoundEnabled(storedValue === "true");
    });
    return () => {
      active = false;
    };
  }, []);

  const playTear = useCallback(() => {
    if (!soundEnabled) return;
    void player.seekTo(0);
    player.play();
  }, [player, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;
      void AsyncStorage.setItem(SOUND_PREFERENCE_KEY, String(next));
      return next;
    });
  }, []);

  return { soundEnabled, toggleSound, playTear };
}
