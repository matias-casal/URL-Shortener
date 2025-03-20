import createCache from "@emotion/cache";

/**
 * Creates a client-side Emotion cache
 * Optimizes CSS-in-JS performance by preventing style recalculations
 */
export default function createEmotionCache() {
  return createCache({ key: "css" });
}
