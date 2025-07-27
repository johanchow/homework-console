# 构建阶段
FROM node:22.16.0-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# 限制 Node 构建时最大内存占用
ENV NODE_OPTIONS=--max_old_space_size=1536
RUN pnpm build

# 生产阶段
# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
FROM node:22.16.0-alpine AS runner

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
