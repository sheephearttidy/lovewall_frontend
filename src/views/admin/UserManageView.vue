<template>
  <div class="manage-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名 / 昵称"
        clearable
        :prefix-icon="Search"
        class="search-input"
      />
      <div class="spacer"></div>
      <el-button type="primary" @click="createVisible = true">
        <el-icon><Plus /></el-icon>新增用户
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="paged" stripe style="width: 100%">
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div class="user-cell">
            <span class="avatar" :style="{ background: row.avatarColor }">{{ row.nickname.slice(0, 1) }}</span>
            <div>
              <div class="nickname">{{ row.nickname }}</div>
              <div class="username">@{{ row.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="190" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.email">{{ row.email }}</span>
          <span v-else class="muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '正常' : '已封禁' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :type="row.status === 'active' ? 'warning' : 'success'"
            :disabled="row.id === auth.currentUser?.id"
            @click="toggleBan(row)"
          >
            {{ row.status === 'active' ? '封禁' : '解封' }}
          </el-button>
          <el-button link type="primary" :disabled="row.id === 'u-admin'" @click="toggleRole(row)">
            {{ row.role === 'admin' ? '取消管理员' : '设为管理员' }}
          </el-button>
          <el-button link @click="resetPwd(row)">重置密码</el-button>
          <el-button
            link
            type="danger"
            :disabled="row.id === auth.currentUser?.id || row.id === 'u-admin'"
            @click="removeOne(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="filtered.length"
        layout="total, prev, pager, next"
      />
    </div>

    <!-- 新增用户弹窗 -->
    <el-dialog v-model="createVisible" title="新增用户" width="440px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="84px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="3-20 位字母、数字或下划线" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="createForm.nickname" placeholder="留空则默认使用用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="createForm.password" type="password" placeholder="至少 6 位" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="createUser">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils/format'

const auth = useAuthStore()
auth.init()

const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const createVisible = ref(false)
const createFormRef = ref()

const createForm = reactive({ username: '', nickname: '', email: '', password: '', role: 'user' })
const createRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '3-20 位字母、数字或下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return auth.users
  return auth.users.filter(
    (u) => u.username.toLowerCase().includes(kw) || u.nickname.toLowerCase().includes(kw)
  )
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

async function toggleBan(row) {
  const next = row.status === 'active' ? 'banned' : 'active'
  await ElMessageBox.confirm(
    `确定要${next === 'banned' ? '封禁' : '解封'}用户「${row.nickname}」吗？`,
    '提示',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  auth.setBanned(row.id, next === 'banned')
  ElMessage.success(next === 'banned' ? '已封禁' : '已解封')
}

async function toggleRole(row) {
  const next = row.role === 'admin' ? 'user' : 'admin'
  await ElMessageBox.confirm(
    `确定将「${row.nickname}」${next === 'admin' ? '设为' : '取消'}管理员吗？`,
    '提示',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  auth.setRole(row.id, next)
  ElMessage.success('角色已更新')
}

async function resetPwd(row) {
  await ElMessageBox.confirm(
    `确定将「${row.nickname}」的密码重置为 123456 吗？`,
    '提示',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  auth.resetPassword(row.id)
  ElMessage.success('密码已重置为 123456')
}

async function removeOne(row) {
  await ElMessageBox.confirm(`删除用户「${row.nickname}」后无法恢复，确定继续吗？`, '警告', {
    type: 'error',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  auth.deleteUser(row.id)
  ElMessage.success('删除成功')
}

async function createUser() {
  try {
    await createFormRef.value.validate()
  } catch {
    return
  }
  try {
    auth.createUser({ ...createForm })
    ElMessage.success('用户创建成功')
    createVisible.value = false
    Object.assign(createForm, { username: '', nickname: '', email: '', password: '', role: 'user' })
  } catch (e) {
    ElMessage.error(e.message)
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.search-input {
  width: 260px;
}
.spacer {
  flex: 1;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nickname {
  font-size: 14px;
  color: var(--text-1);
  font-weight: 500;
}
.username {
  font-size: 12px;
  color: var(--text-4);
}
.muted {
  color: var(--text-4);
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
