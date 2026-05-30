import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const rateLimiters = {
  // Components
  componentsGet: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "pb:rl:components:get",
    analytics: true,
  }),
  componentsPost: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "pb:rl:components:post",
    analytics: true,
  }),
  componentsPut: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "pb:rl:components:put",
    analytics: true,
  }),
  componentsDelete: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "pb:rl:components:delete",
    analytics: true,
  }),

  // Packs
  packsGet: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "pb:rl:packs:get",
    analytics: true,
  }),
  packsPost: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "pb:rl:packs:post",
    analytics: true,
  }),
  packsPut: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "pb:rl:packs:put",
    analytics: true,
  }),
  packsDelete: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "pb:rl:packs:delete",
    analytics: true,
  }),
  packsUse: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "pb:rl:packs:use",
    analytics: true,
  }),
  packsSave: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "pb:rl:packs:save",
    analytics: true,
  }),
  packsUnsave: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "pb:rl:packs:unsave",
    analytics: true,
  }),
  packsSavedGet: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "pb:rl:packs:saved",
    analytics: true,
  }),
  componentsSearch: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "pb:rl:components:search",
    analytics: true,
  }),
};

export async function checkRateLimit(limiter, userId) {
  const { success, limit, remaining, reset } = await limiter.limit(userId);
  return {
    success,
    limit,
    remaining,
    retryAfter: Math.ceil((reset - Date.now()) / 1000),
  };
}

export function rateLimitResponse(retryAfter) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Try again in a moment.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    },
  );
}
