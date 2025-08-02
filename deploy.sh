#!/bin/bash

set -e

# 镜像信息
IMAGE_NAME="ghcr.io/johanchow/homework-console:latest"
CONTAINER_NAME="homework-console"

# 如果镜像是私有的，请先登录
# echo "your_personal_access_token" | docker login ghcr.io -u johanchow --password-stdin

echo "🚀 拉取最新镜像..."
docker pull $IMAGE_NAME

# 停止并删除旧容器（如果存在）
if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
  echo "🧹 停止并删除旧容器 $CONTAINER_NAME..."
  docker stop $CONTAINER_NAME
  docker rm $CONTAINER_NAME
fi

# 启动新容器
echo "🔄 启动新容器 $CONTAINER_NAME..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 3000:3000 \
  --restart unless-stopped \
  $IMAGE_NAME

echo "✅ 部署完成！容器 $CONTAINER_NAME 正在运行。"
