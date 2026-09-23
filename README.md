# Lovewall 表白墙前端

基于 **Vue 3 + Vite + Element Plus** 开发的表白墙应用，包含浪漫风格的前台表白墙与企业级后台管理系统。

## ✨ 功能特性

### 前台表白墙
- 💌 **发布表白**：支持填写收件人、内容、便签颜色（6 色）、图片上传（最多 3 张，自动压缩）、匿名发布
- ❤️ **点赞爱心动效**：点击爱心弹出飘心粒子动画
- 💬 **评论回复**：每条表白下可展开评论区并发表评论
- 🔍 **搜索与筛选**：按关键词搜索（内容/收件人/署名），按最新/最热排序，按便签颜色筛选
- 🎈 **浪漫视觉**：漂浮爱心背景、便签卡片墙、轻微旋转贴纸效果
- 👤 **注册 / 登录**：游客可浏览，登录后可发布、点赞、评论

### 企业级后台管理（`/admin`，仅管理员可见）
- 📊 **仪表盘**：表白总数、点赞、评论、用户统计，点赞 Top5 榜单，颜色分布，最新动态
- 📝 **表白管理**：搜索、状态筛选（正常/隐藏）、查看详情、隐藏/恢复、单条/批量删除、分页
- 💬 **评论管理**：展平所有评论，搜索、单条/批量删除、分页
- 👥 **用户管理**：新增用户、封禁/解封、角色调整、重置密码、删除（内置超管保护）

## 🛠 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite 5 |
| UI | Element Plus + @element-plus/icons-vue |
| 路由 | Vue Router 4（含权限守卫） |
| 状态管理 | Pinia |
| 数据 | 本地 Mock（localStorage 持久化 + 种子数据） |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 🔑 演示账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123` |
| 普通用户 | `xiaomei` | `123456` |
| 普通用户 | `chenhao` / `yaya` / `luming` / `tangtang` | `123456` |

## 📁 目录结构

```
src/
├── api/
│   └── seed.js              # Mock 种子数据（用户、表白、评论）
├── assets/styles/
│   └── global.css           # 全局样式与动画（飘心、弹跳等）
├── components/
│   ├── ConfessionCard.vue   # 表白便签卡片（点赞粒子动效）
│   ├── CommentPanel.vue     # 评论面板
│   ├── FloatingHearts.vue   # 背景漂浮爱心
│   └── PostDialog.vue       # 发布表白弹窗（图片上传/压缩）
├── constants/
│   └── colors.js            # 便签颜色主题与头像色池
├── router/
│   └── index.js             # 路由与登录/管理员权限守卫
├── stores/
│   ├── auth.js              # 用户/会话（注册、登录、封禁等）
│   └── wall.js              # 表白/点赞/评论
├── utils/
│   ├── format.js            # 时间格式化、ID 生成
│   ├── image.js             # 图片压缩转 base64
│   └── storage.js           # localStorage 封装
└── views/
    ├── HomeView.vue         # 表白墙主页
    ├── LoginView.vue        # 登录
    ├── RegisterView.vue     # 注册
    └── admin/
        ├── AdminLayout.vue          # 后台布局（侧边栏+顶栏）
        ├── DashboardView.vue        # 仪表盘
        ├── ConfessionManageView.vue # 表白管理
        ├── CommentManageView.vue    # 评论管理
        └── UserManageView.vue       # 用户管理
```

## 📌 说明

- 当前为纯前端 Mock 数据版本（localStorage 持久化），后续可无缝替换为真实 API：只需改造 `src/stores` 中的 actions 为 HTTP 请求。
- Mock 密码哈希仅用于演示，请勿用于生产环境。
