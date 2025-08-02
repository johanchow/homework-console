# 构建阶段 - 指定 x86_64 架构
FROM --platform=linux/amd64 node:22.16.0-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# 限制 Node 构建时最大内存占用
RUN pnpm build

FROM node:22.16.0-alpine AS runner

WORKDIR /app

# 拷贝构建产物
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/locales ./locales

ENV NODE_ENV=production
EXPOSE 3000

USER node
CMD ["node", "server.js"]
