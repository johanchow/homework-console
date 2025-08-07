#!/bin/bash

# === 配置参数 ===
CONTAINER_NAME="homework-console-container"
PORT=3000
# 如果NODE_ENV是test|prod，则使用test|latest镜像
if [ "$NODE_ENV" = "prod" ]; then
  IMAGE_NAME="ghcr.io/johanchow/homework-console:latest"
else
  IMAGE_NAME="ghcr.io/johanchow/homework-console:test"
fi

# 合并 env 文件
cat .env .env.$NODE_ENV > .env.merged

# === 操作函数 ===

deploy() {
  echo "🛠️ 拉取最新镜像: $IMAGE_NAME"
  docker pull $IMAGE_NAME

  echo "🛑 停止并移除旧容器（如有）: $CONTAINER_NAME"
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true

  echo "🚀 启动新容器: $CONTAINER_NAME"
  docker run -d \
    --name $CONTAINER_NAME \
    --env-file .env.merged \
    -p $PORT:3000 \
    --restart=unless-stopped \
    $IMAGE_NAME
}

status() {
  docker ps -a | grep $CONTAINER_NAME
}

logs() {
  docker logs -f $CONTAINER_NAME
}

stop() {
  echo "🛑 停止容器: $CONTAINER_NAME"
  docker stop $CONTAINER_NAME
}

restart() {
  echo "🔄 重启容器: $CONTAINER_NAME"
  docker restart $CONTAINER_NAME
}

enter() {
  echo "🧭 进入容器: $CONTAINER_NAME"
  docker exec -it $CONTAINER_NAME /bin/sh
}

cleanup() {
  echo "🧹 清理容器与镜像资源"
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
  docker rmi $IMAGE_NAME 2>/dev/null || true
}

# === 主控制 ===
case "$1" in
  deploy)
    deploy
    ;;
  status)
    status
    ;;
  logs)
    logs
    ;;
  stop)
    stop
    ;;
  restart)
    restart
    ;;
  enter)
    enter
    ;;
  cleanup)
    cleanup
    ;;
  *)
    echo "Usage: $0 {deploy|status|logs|stop|restart|enter|cleanup}"
    ;;
esac
