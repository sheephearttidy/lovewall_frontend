import { avatarColorOf } from '@/constants/colors'

/**
 * Mock 密码哈希（与 stores/auth.js 保持一致，仅用于演示）
 */
function hashPassword(pwd) {
  let h = 5381
  for (let i = 0; i < pwd.length; i++) h = ((h << 5) + h + pwd.charCodeAt(i)) | 0
  return 'mw' + (h >>> 0).toString(36)
}

function hoursAgo(n) {
  return Date.now() - n * 3600 * 1000
}

function user(id, username, nickname, password, role, createdAt) {
  return {
    id,
    username,
    nickname,
    password: hashPassword(password),
    role,
    avatarColor: avatarColorOf(nickname),
    createdAt,
    status: 'active'
  }
}

/**
 * 种子用户（演示账号：admin / admin123，其余密码均为 123456）
 */
export function seedUsers() {
  return [
    user('u-admin', 'admin', '管理员', 'admin123', 'admin', hoursAgo(24 * 60)),
    user('u-1001', 'xiaomei', '小美', '123456', 'user', hoursAgo(24 * 50)),
    user('u-1002', 'chenhao', '辰昊', '123456', 'user', hoursAgo(24 * 40)),
    user('u-1003', 'yaya', '丫丫', '123456', 'user', hoursAgo(24 * 30)),
    user('u-1004', 'luming', '陆鸣', '123456', 'user', hoursAgo(24 * 20)),
    user('u-1005', 'tangtang', '糖糖', '123456', 'user', hoursAgo(24 * 10))
  ]
}

let cid = 0
function comment(id, authorId, nickname, content, hours) {
  return {
    id,
    confessionId: null,
    authorId,
    nickname,
    content,
    createdAt: hoursAgo(hours),
    status: 'normal'
  }
}

/**
 * 种子表白数据
 */
export function seedConfessions() {
  const list = [
    {
      to: '图书馆三楼穿白卫衣的男生',
      from: '小美',
      authorId: 'u-1001',
      color: 'pink',
      content:
        '每天下午你都会坐在靠窗的位置看书，阳光落在你侧脸上的样子，我偷偷看了一个学期。今天终于鼓起勇气，想认识你。',
      images: [],
      likes: ['u-1002', 'u-1003', 'u-1004', 'u-1005'],
      comments: [
        comment('cm-101', 'u-1003', '丫丫', '冲冲冲！我好像知道你说的是谁，就是每周三穿灰色卫衣那位！', 2),
        comment('cm-102', 'u-1002', '辰昊', '勇敢的人先享受世界！', 1)
      ],
      createdAt: hoursAgo(3),
      status: 'normal'
    },
    {
      to: '林亦然',
      from: '匿名',
      authorId: 'u-1002',
      color: 'blue',
      content:
        '谢谢你把高数笔记借给我，还耐心给我讲了三遍泰勒展开。奶茶已经备好，什么时候有空？',
      images: [],
      likes: ['u-1001'],
      comments: [comment('cm-103', 'u-1005', '糖糖', '这波稳了，泰勒展开都愿意讲三遍，必然是心动了。', 5)],
      createdAt: hoursAgo(7),
      status: 'normal'
    },
    {
      to: '三食堂打饭阿姨',
      from: '陆鸣',
      authorId: 'u-1004',
      color: 'orange',
      content:
        '阿姨，虽然您每次手都会抖一下，但抖出来的都是人间温情。今天您多给我的一勺糖醋排骨，我记在心里了。',
      images: [],
      likes: ['u-1001', 'u-1002', 'u-1003', 'u-1005'],
      comments: [
        comment('cm-104', 'u-1003', '丫丫', '哈哈哈哈阿姨的爱重如泰山', 4),
        comment('cm-105', 'u-1001', '小美', '下次帮我也要一勺！', 2)
      ],
      createdAt: hoursAgo(12),
      status: 'normal'
    },
    {
      to: '夜跑时偶遇的橙色跑鞋女生',
      from: '辰昊',
      authorId: 'u-1002',
      color: 'green',
      content:
        "操场第三圈超你的那阵风是我。配速 5'30\" 还能冲你笑一下，我已经用尽了全部力气。",
      images: [],
      likes: ['u-1005'],
      comments: [],
      createdAt: hoursAgo(26),
      status: 'normal'
    },
    {
      to: '全宇宙最可爱的糖糖',
      from: '丫丫',
      authorId: 'u-1003',
      color: 'yellow',
      content:
        '一起自习、一起吃火锅、一起在操场看星星。友情以上，恋人未满？不，我想和你更进一步。',
      images: [],
      likes: ['u-1001', 'u-1005'],
      comments: [comment('cm-106', 'u-1005', '糖糖', '看到这条的时候我笑了，答案你懂的。', 20)],
      createdAt: hoursAgo(30),
      status: 'normal'
    },
    {
      to: '隔壁班弹吉他的少年',
      from: '匿名',
      authorId: null,
      color: 'purple',
      content:
        '你在楼道里弹《晴天》的那个傍晚，整栋楼都安静了，包括我的心脏。',
      images: [],
      likes: ['u-1001', 'u-1003'],
      comments: [],
      createdAt: hoursAgo(49),
      status: 'normal'
    },
    {
      to: '我的室友们',
      from: '小美',
      authorId: 'u-1001',
      color: 'pink',
      content:
        '感谢你们容忍我半夜背单词、早上赖床和一周三次的 emo。毕业以后也要常来看我！',
      images: [],
      likes: [],
      comments: [],
      createdAt: hoursAgo(52),
      status: 'normal'
    },
    {
      to: '程可可',
      from: '匿名',
      authorId: 'u-1005',
      color: 'blue',
      content:
        '第一次见你是在社团招新，你穿着向日葵图案的裙子。后来我加入了那个社团，只为每周三能见到你。',
      images: [],
      likes: ['u-1002'],
      comments: [],
      createdAt: hoursAgo(73),
      status: 'normal'
    },
    {
      to: '总是占我座位的橘猫',
      from: '糖糖',
      authorId: 'u-1005',
      color: 'green',
      content:
        '你是一只橘猫，你霸占了我的电动车坐垫，也霸占了我的心。今天给你带了小鱼干，请你对我负责。',
      images: [],
      likes: ['u-1001', 'u-1003', 'u-1004'],
      comments: [comment('cm-107', 'u-1004', '陆鸣', '猫：这鱼干我先收下，人就算了', 40)],
      createdAt: hoursAgo(96),
      status: 'normal'
    },
    {
      to: '考研自习室的台灯',
      from: '陆鸣',
      authorId: 'u-1004',
      color: 'yellow',
      content: '这句话写给陪我度过 300 个夜晚的台灯：等上岸那天，我请你晒太阳。',
      images: [],
      likes: ['u-1002', 'u-1005'],
      comments: [],
      createdAt: hoursAgo(120),
      status: 'normal'
    },
    {
      to: '天文社的社长',
      from: '匿名',
      authorId: 'u-1003',
      color: 'purple',
      content:
        '你说猎户座的腰带三星连成一线，我觉得你和星星一样，遥不可及，却又让人挪不开眼。',
      images: [],
      likes: [],
      comments: [],
      createdAt: hoursAgo(130),
      status: 'hidden'
    },
    {
      to: '未来的自己',
      from: '辰昊',
      authorId: 'u-1002',
      color: 'orange',
      content:
        '希望明年的你，已经牵起了那个人的手，把今年不敢说的话，都变成了日常。',
      images: [],
      likes: ['u-1001'],
      comments: [],
      createdAt: hoursAgo(150),
      status: 'normal'
    }
  ]
  list.forEach((c, i) => {
    c.id = 'c-seed-' + ++cid
    c.comments.forEach((cm) => (cm.confessionId = c.id))
  })
  return list
}
