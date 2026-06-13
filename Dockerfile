# syntax=docker/dockerfile:1

# ---- deps: install dependencies (cached on lockfile) ----
FROM node:26-alpine AS deps
WORKDIR /app
# node:26-alpine no longer bundles yarn — install Yarn 1 (classic) for the yarn.lock
RUN npm install -g yarn@1.22.22
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ---- builder: standalone Next.js build ----
FROM node:26-alpine AS builder
WORKDIR /app
RUN npm install -g yarn@1.22.22
ARG GIT_SHA=dev
# BUILD_STANDALONE=1 makes next.config emit output:'standalone' (Netlify stays default).
ENV BUILD_STANDALONE=1 \
    NEXT_PUBLIC_BUILD_ID=$GIT_SHA \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# ---- runner: minimal runtime (no build tools, no source) ----
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# Standalone server + the assets it does NOT bundle automatically:
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
# '/' is SSR from local data → reliable health signal (independent of the external v2 API).
HEALTHCHECK --interval=10s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1
CMD ["node", "server.js"]
