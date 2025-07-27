# 构建阶段
FROM node:22.16.0-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 设置淘宝 pnpm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com

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

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# 拷贝 Next.js standalone 构建产物（包含 server.js、package.json 等）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 如果有静态资源，拷贝 .next/static 文件夹
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 如果有 public 文件夹，拷贝到容器
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

# 切换到非 root 用户
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

