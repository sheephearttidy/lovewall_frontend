# Lovewall 表白墙前端

基于 **Vue 3 + Vite + Element Plus** 开发的表白墙应用，包含浪漫风格的前台表白墙与企业级后台管理系统。

## ✨ 功能特性

### 前台表白墙
- 💌 **发布表白**：支持填写收件人、内容、便签颜色（6 色）、图片上传（最多 3 张，自动压缩）、匿名发布
- ❤️ **点赞爱心动效**：点击爱心弹出飘心粒子动画
- 💬 **楼中楼评论**：可回复任意评论，回复带 `回复 @昵称` 标签并缩进展示
- 🔗 **分享卡片**：复制链接（打开自动定位并高亮该表白）或复制文案
- 🔍 **搜索与筛选**：按关键词搜索（内容/收件人/署名），按最新/最热排序，按便签颜色筛选
- 🎈 **浪漫视觉**：漂浮爱心背景、便签卡片墙、轻微旋转贴纸效果
- 👤 **注册 / 登录**：游客可浏览，登录后可发布、点赞、评论
- 🧑‍💼 **个人中心**：自定义昵称、头像颜色（7 色）与修改密码，改名后历史表白/评论署名自动同步
- 🗂 **我的表白管理**：个人中心查看自己发布的全部表白（含被隐藏的）、点赞/评论数据，支持定位查看与删除
- 🔔 **消息通知**：表白被点赞/评论、评论被回复时收到通知，铃铛未读红点、全部已读、点击跳转定位高亮
- ✉️ **注册邮箱验证**（后台可开关）：注册需填写邮箱并输入验证码，5 分钟有效、60 秒防重发（Mock 环境验证码以页面通知展示）
- 🔢 **注册图形验证码**（后台可开关）：Canvas 本地绘制（干扰线/噪点/字符旋转），点击刷新，不区分大小写
- 🔑 **忘记密码**：通过用户名 + 绑定邮箱验证身份，三步重置密码
- 🛡 **内容安全**：敏感词过滤（后台可开关，命中自动替换为 *）+ 发布频率限制（表白 60 秒/条、评论 30 秒/条）

### 企业级后台管理（`/admin`，仅管理员可见）
- 📊 **仪表盘**：表白总数、点赞、评论、用户统计，点赞 Top5 榜单，颜色分布，最新动态
- 📝 **表白管理**：搜索、状态筛选（正常/隐藏）、查看详情、隐藏/恢复、单条/批量删除、分页
- 💬 **评论管理**：展平所有评论，搜索、单条/批量删除、分页
- 👥 **用户管理**：新增用户（可填邮箱）、封禁/解封、角色调整、重置密码、删除（内置超管保护）
- ⚙️ **系统设置**：注册邮箱验证、图形验证码、敏感词过滤的实时开关，并预览当前注册流程

## 🛡 内容安全机制

- **敏感词过滤**：开启后，表白与评论中的敏感词自动替换为等长 `*`（内置演示词库，生产环境建议替换为服务端词库或第三方审核 API）
- **发布频率限制**：每用户发布表白间隔 60 秒、发表评论间隔 30 秒，超出将提示剩余等待秒数

## 🏗 工程化

- **ESLint**：`npm run lint`（Vue 3 essential 规则集）
- **CI**：GitHub Actions（`.github/workflows/ci.yml`），push / PR 到 `main` 时自动执行依赖安装 → Lint → Build

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
│   ├── email.js             # Mock 邮件服务（验证码生成/校验）
│   └── seed.js              # Mock 种子数据（用户、表白、评论）
├── assets/styles/
│   └── global.css           # 全局样式与动画（飘心、弹跳等）
├── components/
│   ├── ConfessionCard.vue   # 表白便签卡片（点赞粒子动效/分享/高亮）
│   ├── CommentPanel.vue     # 评论面板（楼中楼回复）
│   ├── FloatingHearts.vue   # 背景漂浮爱心
│   ├── ImageCaptcha.vue     # 图形验证码（Canvas 绘制）
│   ├── NotificationBell.vue # 通知铃铛（未读红点/列表/跳转）
│   ├── PostDialog.vue       # 发布表白弹窗（图片上传/压缩）
│   └── ShareDialog.vue      # 分享弹窗（复制链接/文案）
├── constants/
│   ├── colors.js            # 便签颜色主题与头像色池
│   └── sensitive-words.js   # 敏感词表（演示词库）
├── router/
│   └── index.js             # 路由与登录/管理员权限守卫
├── stores/
│   ├── auth.js              # 用户/会话（注册、登录、资料更新、找回密码等）
│   ├── notification.js      # 消息通知（点赞/评论/回复）
│   ├── settings.js          # 系统设置（邮箱验证/验证码/敏感词开关）
│   └── wall.js              # 表白/点赞/评论（含敏感词过滤与频率限制）
├── utils/
│   ├── format.js            # 时间格式化、ID 生成
│   ├── image.js             # 图片压缩转 base64
│   ├── sensitive.js         # 敏感词检测与替换
│   ├── storage.js           # localStorage 封装
│   └── throttle.js          # 发布频率限制
└── views/
    ├── HomeView.vue         # 表白墙主页
    ├── LoginView.vue        # 登录（含忘记密码入口）
    ├── RegisterView.vue     # 注册（条件性邮箱验证/图形验证码）
    ├── ForgotPasswordView.vue # 找回密码（三步重置）
    ├── ProfileView.vue      # 个人中心（资料自定义/改密码）
    └── admin/
        ├── AdminLayout.vue          # 后台布局（侧边栏+顶栏）
        ├── DashboardView.vue        # 仪表盘
        ├── ConfessionManageView.vue # 表白管理
        ├── CommentManageView.vue    # 评论管理
        ├── UserManageView.vue       # 用户管理
        └── SettingsView.vue         # 系统设置（注册功能开关）
```

## 📌 说明

- 当前为纯前端 Mock 数据版本（localStorage 持久化），后续可无缝替换为真实 API：只需改造 `src/stores` 中的 actions 为 HTTP 请求。
- Mock 密码哈希仅用于演示，请勿用于生产环境。
