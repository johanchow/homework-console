# 构建阶段
FROM node:22.16.0-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 pnpm 锁文件和 package.json
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建 Next.js 应用
RUN pnpm build

# 生产阶段
FROM node:22.16.0-alpine AS runner

WORKDIR /app

# 拷贝 Next.js standalone 构建产物（包含 server.js、package.json 等）
COPY --from=builder --chown=node:node /app/.next/standalone ./

# 如果有静态资源，拷贝 .next/static 文件夹
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# **拷贝语言包目录 locales 到容器**
COPY --from=builder --chown=node:node /app/locales ./locales

ENV NODE_ENV=production
CMD ["node", "server.js"]

