FROM node:20-alpine as build

# Install pnpm
RUN npm install -g pnpm

# Copy and install dependencies
WORKDIR /app
COPY package.json .
RUN pnpm install

# Build
COPY . .
RUN pnpm run build

FROM node:20-alpine

ENV NODE_ENV=PRODUCTION

WORKDIR /app

# Install production dependencies
RUN npm install -g pnpm
COPY package.json .
RUN pnpm install

# Copy built files
COPY --from=build /app/dist ./dist

CMD ["pnpm", "start"]
