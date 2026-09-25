# Lovewall 表白墙前端

基于 **Vue 3 + Vite + Element Plus** 构建的表白墙应用，包含浪漫风格的前台表白墙与企业级后台管理系统，已对接 RESTful 后端 API。

## 功能特性

### 前台表白墙

- 发布表白：收件人、内容、便签颜色（6 色）、图片上传（最多 3 张）、匿名发布
- 点赞爱心动效：点击爱心弹出飘心粒子动画
- 楼中楼评论：回复任意评论，带 `回复 @昵称` 标签并缩进展示
- 分享卡片：复制链接（打开自动定位高亮）或复制文案
- 搜索与筛选：关键词搜索、最新/最热排序、便签颜色筛选
- 浪漫视觉：漂浮爱心背景、便签卡片墙、轻微旋转贴纸效果
- 注册 / 登录：游客可浏览，登录后可发布、点赞、评论
- 个人中心：自定义昵称、头像颜色（7 色）与修改密码，改名后历史署名自动同步
- 我的表白管理：查看自己发布的全部表白，支持删除
- 消息通知：被点赞/评论/回复时收到通知，铃铛未读红点、全部已读、点击跳转
- 注册邮箱验证（后台可开关）：注册需填写邮箱并输入验证码
- 注册图形验证码（后台可开关）：Canvas 本地绘制，点击刷新
- 邀请码注册（后台可开关）：注册需输入有效邀请码
- 忘记密码：通过用户名 + 邮箱验证身份，三步重置密码
- 内容安全：敏感词过滤（命中自动替换为 *）+ 发布频率限制

### 后台管理（`/admin`，仅管理员可见）

- 仪表盘：表白总数、点赞、评论、用户统计，趋势折线图，最新动态
- 表白管理：搜索、状态筛选、查看详情、隐藏/恢复、置顶、单条/批量删除、CSV 导出
- 评论管理：展平所有评论，搜索、单条/批量删除、CSV 导出
- 用户管理：新增用户、封禁/解封、角色调整、重置密码、删除、CSV 导出
- 系统设置：注册邮箱验证、图形验证码、敏感词过滤、邀请码的实时开关与管理
- 操作审计日志：记录管理员操作，支持搜索与清空

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite 5 |
| UI | Element Plus + @element-plus/icons-vue |
| 路由 | Vue Router 4（含权限守卫） |
| 状态管理 | Pinia |
| HTTP 客户端 | Axios（统一拦截、JWT Token 管理） |
| 后端对接 | RESTful API（Vite 代理解决跨域） |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview

# 代码检查
npm run lint
```

### 后端对接

前端通过 Vite 开发代理将 `/api` 请求转发至后端服务，默认后端地址 `http://127.0.0.1:5000`，可在 `vite.config.js` 中修改：

```js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true
    }
  }
}
```

生产环境需通过 Nginx 等反向代理将 `/api` 路由至后端服务。

## 演示账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123` |
| 普通用户 | `xiaomei` | `123456` |

## 目录结构

```
src/
├── api/                        # API 接口封装
│   ├── http.js                 # Axios 实例（拦截器、Token 管理）
│   ├── auth.js                 # 认证接口（登录、注册、找回密码）
│   ├── wall.js                 # 表白墙接口（发布、点赞、评论）
│   ├── user.js                 # 用户接口（个人资料、改密码）
│   ├── notification.js         # 通知接口
│   ├── settings.js             # 公共设置接口
│   └── admin.js                # 管理员接口（用户/表白/评论/设置管理）
├── assets/styles/
│   └── global.css              # 全局样式与动画
├── components/
│   ├── ConfessionCard.vue      # 表白便签卡片（点赞粒子动效/分享/高亮）
│   ├── CommentPanel.vue        # 评论面板（楼中楼回复）
│   ├── FloatingHearts.vue      # 背景漂浮爱心
│   ├── ImageCaptcha.vue        # 图形验证码（Canvas 绘制）
│   ├── NotificationBell.vue    # 通知铃铛（未读红点/列表/跳转）
│   ├── PostDialog.vue          # 发布表白弹窗（图片上传/压缩）
│   ├── ShareDialog.vue         # 分享弹窗（复制链接/文案）
│   └── ThemeToggle.vue         # 主题切换（亮色/暗色）
├── constants/
│   ├── colors.js               # 便签颜色主题与头像色池
│   └── sensitive-words.js      # 敏感词表
├── router/
│   └── index.js                # 路由与登录/管理员权限守卫
├── stores/
│   ├── auth.js                 # 用户/会话状态
│   ├── wall.js                 # 表白/点赞/评论状态
│   ├── notification.js         # 消息通知状态
│   ├── settings.js             # 系统设置状态
│   ├── audit.js                # 操作审计日志状态
│   └── theme.js                # 主题状态
├── utils/
│   ├── format.js               # 时间格式化、ID 生成
│   ├── image.js                # 图片压缩转 base64
│   ├── sensitive.js            # 敏感词检测与替换
│   ├── storage.js              # localStorage 封装
│   ├── throttle.js             # 发布频率限制
│   └── csv.js                  # CSV 导出工具
└── views/
    ├── HomeView.vue            # 表白墙主页
    ├── LoginView.vue           # 登录
    ├── RegisterView.vue        # 注册
    ├── ForgotPasswordView.vue  # 找回密码
    ├── ProfileView.vue         # 个人中心
    └── admin/
        ├── AdminLayout.vue             # 后台布局
        ├── DashboardView.vue           # 仪表盘
        ├── ConfessionManageView.vue    # 表白管理
        ├── CommentManageView.vue       # 评论管理
        ├── UserManageView.vue          # 用户管理
        ├── SettingsView.vue            # 系统设置
        └── AuditLogView.vue            # 操作日志
```

## API 对接说明

前端通过 `src/api/http.js` 封装的 Axios 实例与后端通信：

- **请求拦截**：自动携带 JWT Token（`Authorization: Bearer <token>`）
- **响应拦截**：统一处理后端响应格式 `{ code, message, data }`，`code !== 0` 时抛出业务错误；401 状态自动清除 Token
- **Token 管理**：登录/注册成功后存储 Token 至 localStorage，注销时清除

所有 API 模块（`auth.js`、`wall.js`、`user.js`、`notification.js`、`settings.js`、`admin.js`）均基于此实例，返回后端响应体中的 `data` 字段。

## 构建优化

Vite 构建配置了手动分包：

```js
manualChunks: {
  'element-plus': ['element-plus'],
  'vue-vendor': ['vue', 'vue-router', 'pinia']
}
```

将 Element Plus 和 Vue 核心库分离为独立 chunk，优化首屏加载与缓存命中率。