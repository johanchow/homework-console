# 构建阶段 - 指定 x86_64 架构
FROM --platform=linux/amd64 node:22.16.0-alpine AS builder

WORKDIR /app

# 👇 接收构建参数: 如果docker build时没有传入参数，则使用默认参数test
ARG NODE_ENV=test # 构建时使用
ENV NODE_ENV=${NODE_ENV}

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# 限制 Node 构建时最大内存占用
RUN echo "NODE_ENV: ${NODE_ENV}"
RUN pnpm build

FROM node:22.16.0-alpine AS runner

WORKDIR /app

# 拷贝构建产物
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

EXPOSE 3000

USER node
CMD ["node", "server.js"]
