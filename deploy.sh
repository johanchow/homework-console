#!/bin/bash

# 部署脚本 - homework-console
# 用于管理 Docker 容器

# 配置
IMAGE="homework-console"
CONTAINER="homework-console-app"
PORT="3000"
NETWORK="homework-network"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 打印消息
print() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查 Docker
check() {
    if ! docker info > /dev/null 2>&1; then
        print $RED "错误: Docker 未运行"
        exit 1
    fi
}

# 构建
build() {
    print $BLUE "构建镜像..."
    
    if [ ! -f "Dockerfile" ]; then
        print $RED "错误: 未找到 Dockerfile"
        exit 1
    fi
    
    docker build -t $IMAGE .
    
    if [ $? -eq 0 ]; then
        print $GREEN "构建成功: $IMAGE"
    else
        print $RED "构建失败"
        exit 1
    fi
}

# 从 tar 文件加载镜像
load() {
    print $BLUE "从 tar 文件加载镜像..."
    
    local tar_file="homework-console.tar"
    
    if [ ! -f "$tar_file" ]; then
        print $RED "错误: 未找到 $tar_file"
        exit 1
    fi
    
    print $BLUE "正在加载镜像，请稍候..."
    docker load < "$tar_file"
    
    if [ $? -eq 0 ]; then
        print $GREEN "镜像加载成功: $IMAGE"
    else
        print $RED "镜像加载失败"
        exit 1
    fi
}

# 导出镜像到 tar 文件
save() {
    print $BLUE "导出镜像到 tar 文件..."
    
    # 检查镜像是否存在
    if ! docker images | grep -q "$IMAGE"; then
        print $RED "错误: 镜像 $IMAGE 不存在，请先构建镜像"
        exit 1
    fi
    
    docker save $IMAGE:latest > homework-console.tar
    
    if [ $? -eq 0 ]; then
        print $GREEN "镜像导出成功: homework-console.tar"
        print $BLUE "文件大小: $(du -h homework-console.tar | cut -f1)"
    else
        print $RED "镜像导出失败"
        exit 1
    fi
}

# 创建网络
network() {
    if ! docker network ls | grep -q $NETWORK; then
        print $BLUE "创建网络: $NETWORK"
        docker network create $NETWORK
    fi
}

# 启动
start() {
    print $BLUE "启动容器..."
    
    if docker ps -a | grep -q $CONTAINER; then
        print $YELLOW "容器已存在，重新创建..."
        docker stop $CONTAINER > /dev/null 2>&1
        docker rm $CONTAINER > /dev/null 2>&1
    fi
    
    network
    
    docker run -d \
        --name $CONTAINER \
        --network $NETWORK \
        -p $PORT:3000 \
        -e NODE_ENV=production \
        --restart unless-stopped \
        $IMAGE
    
    if [ $? -eq 0 ]; then
        print $GREEN "启动成功!"
        print $BLUE "访问: http://localhost:$PORT"
    else
        print $RED "启动失败"
        exit 1
    fi
}

# 停止
stop() {
    print $BLUE "停止容器..."
    docker stop $CONTAINER
    
    if [ $? -eq 0 ]; then
        print $GREEN "已停止"
    else
        print $YELLOW "容器可能已停止"
    fi
}

# 重启
restart() {
    print $BLUE "重启容器..."
    docker restart $CONTAINER
    
    if [ $? -eq 0 ]; then
        print $GREEN "重启成功"
    else
        print $RED "重启失败"
        exit 1
    fi
}

# 状态
status() {
    print $BLUE "容器状态:"
    docker ps -a | grep $CONTAINER
    
    if [ $? -ne 0 ]; then
        print $YELLOW "容器不存在"
    fi
}

# 日志
logs() {
    print $BLUE "查看日志 (Ctrl+C 退出):"
    docker logs -f $CONTAINER
}

# 进入
enter() {
    print $BLUE "进入容器..."
    docker exec -it $CONTAINER /bin/sh
}

# 删除容器
remove() {
    print $YELLOW "删除容器..."
    docker stop $CONTAINER > /dev/null 2>&1
    docker rm $CONTAINER
    
    if [ $? -eq 0 ]; then
        print $GREEN "已删除"
    else
        print $YELLOW "容器可能不存在"
    fi
}

# 删除镜像
rmi() {
    print $YELLOW "删除镜像..."
    remove
    docker rmi $IMAGE
    
    if [ $? -eq 0 ]; then
        print $GREEN "已删除"
    else
        print $YELLOW "镜像可能不存在"
    fi
}

# 清理
cleanup() {
    print $YELLOW "清理所有资源..."
    docker stop $CONTAINER > /dev/null 2>&1
    docker rm $CONTAINER > /dev/null 2>&1
    docker rmi $IMAGE > /dev/null 2>&1
    docker network rm $NETWORK > /dev/null 2>&1
    print $GREEN "清理完成"
}

# 部署 (构建 + 启动)
deploy() {
    print $BLUE "开始部署..."
    build
    start
    print $GREEN "部署完成!"
}

# 从 tar 文件部署 (加载 + 启动)
deploy_from_tar() {
    print $BLUE "从 tar 文件部署..."
    load
    start
    print $GREEN "部署完成!"
}

# 帮助
help() {
    echo "部署脚本 - homework-console"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
echo "  build     构建镜像"
echo "  save      导出镜像到 tar 文件"
echo "  load      从 tar 文件加载镜像"
echo "  start     启动容器"
echo "  stop      停止容器"
echo "  restart   重启容器"
echo "  status    查看状态"
echo "  logs      查看日志"
echo "  enter     进入容器"
echo "  remove    删除容器"
echo "  rmi       删除镜像"
echo "  cleanup   清理所有"
echo "  deploy    构建并启动"
echo "  deploy-tar 从 tar 文件部署"
echo "  help      显示帮助"
    echo ""
    echo "示例:"
echo "  $0 deploy      # 构建并启动"
echo "  $0 deploy-tar  # 从 tar 文件部署"
echo "  $0 save        # 导出镜像"
echo "  $0 load        # 加载镜像"
echo "  $0 logs        # 查看日志"
echo "  $0 stop        # 停止应用"
}

# 主函数
main() {
    check
    
    case "$1" in
        "build")
            build
            ;;
        "save")
            save
            ;;
        "load")
            load
            ;;
        "start")
            start
            ;;
        "stop")
            stop
            ;;
        "restart")
            restart
            ;;
        "status")
            status
            ;;
        "logs")
            logs
            ;;
        "enter")
            enter
            ;;
        "remove")
            remove
            ;;
        "rmi")
            rmi
            ;;
        "cleanup")
            cleanup
            ;;
        "deploy")
            deploy
            ;;
        "deploy-tar")
            deploy_from_tar
            ;;
        "help"|"-h"|"--help"|"")
            help
            ;;
        *)
            print $RED "未知命令: $1"
            echo ""
            help
            exit 1
            ;;
    esac
}

main "$@" 