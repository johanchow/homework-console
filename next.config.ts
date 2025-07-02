import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 启用实验性功能，支持 Next.js 15.3.1 和 React 19 的新特性
  experimental: {
    reactCompiler: true, // 启用 React Compiler，减少无效重渲染以优化 TTI
  },

  turbopack: {
    // 启用 Turbopack 构建，支持增量编译，提高构建速度
    rules: {
      // 自定义构建规则，支持 SVG 组件化
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // 图片优化配置，支持 WebP 和 AVIF 格式，满足高性能图片加载需求
  images: {
    formats: ['image/avif', 'image/webp'], // 使用现代图片格式以减少加载时间
    minimumCacheTTL: 300, // 图片缓存 5 分钟，平衡性能与更新频率
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 响应式图片尺寸，覆盖多终端
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 图标尺寸优化
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 允许所有 HTTPS 域名（生产环境可限制为 CDN 域名）
      },
    ],
  },

  // 自定义 HTTP 头，增强安全性，符合文档中的 XSS/CSRF 防护要求
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // {
          //   key: 'Content-Security-Policy',
          //   value:
          //     "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*; connect-src 'self' wss://ws.example.com https://api.example.com; frame-ancestors 'none';",
          // },
          // { key: 'X-Frame-Options', value: 'DENY' }, // 防止点击劫持
          { key: 'X-Content-Type-Options', value: 'nosniff' }, // 防止 MIME 类型嗅探
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, // 控制引用信息
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }, // 强制 HTTPS 和 TLS 1.3
        ],
      },
    ]
  },

  // Webpack 配置，支持 Service Worker 和模块化，满足 PWA 需求
  webpack: config => {
    // 支持 Web Worker（如 Service Worker），用于离线缓存
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    })

    // 支持 SVG 模块化导入，提升组件复用性
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // 优化 JS Bundle Size，启用代码分割
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 700000, // 控制 JS Bundle Size ≤ 700KB
      },
    }

    return config
  },

  // 性能优化：启用压缩和缓存，减少网络传输
  compress: process.env.NODE_ENV === 'production', // 生产环境启用压缩,
  poweredByHeader: false, // 移除 X-Powered-By 头，增强安全性

  // 环境变量校验，确保 API 和 WebSocket 配置正确
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'hhttps://gateway.ftestqoed.com',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://gateway.ftestqoed.com',
    NEXT_PUBLIC_CRYPTO_SECRET: process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret-key',
  },

  // 自定义构建输出，适合自部署
  output: 'standalone', // 生成独立构建，便于部署到 Docker 或其他服务器

  // 静态资源优化
  staticPageGenerationTimeout: 60, // 静态页面生成超时时间（秒）
  generateEtags: true, // 启用 ETag 缓存，减少重复请求

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 路由重定向，满足 SEO 和合规性需求
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true, // 301 重定向，利于 SEO
  //     },
  //   ];
  // },

  // 路由重写，支持 API 代理和多语言路由
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, // 代理到外部 API
  //     },
  //   ];
  // },
}

export default nextConfig
