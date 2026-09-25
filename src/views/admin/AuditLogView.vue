<template>
  <div class="audit-view">
    <!-- 筛选栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索操作人 / 摘要"
        clearable
        style="width: 240px"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="actionFilter" placeholder="全部动作" clearable style="width: 150px">
        <el-option v-for="a in actionOptions" :key="a.value" :label="a.label" :value="a.value" />
      </el-select>
      <div class="toolbar-right">
        <el-button @click="exportLogs">
          <el-icon><Download /></el-icon>
          <span>导出 CSV</span>
        </el-button>
        <el-popconfirm title="确定清空全部操作日志？" @confirm="clearAll">
          <template #reference>
            <el-button type="danger" plain>
              <el-icon><Delete /></el-icon>
              <span>清空日志</span>
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- 日志表格 -->
    <el-table :data="paged" stripe class="log-table">
      <el-table-column label="时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作人" width="130">
        <template #default="{ row }">
          <div class="operator">
            <span class="op-avatar" :style="{ background: avatarColorOf(row.operator) }">
              {{ (row.operator || '?').slice(0, 1) }}
            </span>
            <span>{{ row.operator }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="动作" width="130">
        <template #default="{ row }">
          <el-tag :type="tagType(row.action)" effect="light" size="small">
            {{ labelOf(row.action) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作摘要" min-width="300">
        <template #default="{ row }">
          <span class="detail">{{ row.detail }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager-row">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="filtered.length"
        layout="total, prev, pager, next"
        background
        hide-on-single-page
      />
    </div>

    <el-empty v-if="!filtered.length" description="暂无操作记录" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'
import { formatDateTime } from '@/utils/format'
import { avatarColorOf } from '@/constants/colors'
import { exportCsv } from '@/utils/csv'

const audit = useAuditStore()
audit.init()

const keyword = ref('')
const actionFilter = ref('')
const page = ref(1)
const pageSize = 15

/** 动作标识 → 标签与 tag 类型 */
const ACTION_MAP = {
  'confession.hide': { label: '隐藏表白', type: 'warning' },
  'confession.show': { label: '恢复表白', type: 'success' },
  'confession.delete': { label: '删除表白', type: 'danger' },
  'confession.pin': { label: '置顶表白', type: 'danger' },
  'confession.unpin': { label: '取消置顶', type: 'info' },
  'comment.delete': { label: '删除评论', type: 'danger' },
  'user.ban': { label: '封禁用户', type: 'danger' },
  'user.unban': { label: '解封用户', type: 'success' },
  'user.role': { label: '变更角色', type: 'warning' },
  'user.create': { label: '创建用户', type: 'primary' },
  'user.delete': { label: '删除用户', type: 'danger' },
  'user.resetPwd': { label: '重置密码', type: 'warning' },
  'settings.update': { label: '修改设置', type: 'primary' },
  'audit.clear': { label: '清空日志', type: 'info' }
}
const actionOptions = Object.entries(ACTION_MAP).map(([value, v]) => ({ value, label: v.label }))
const labelOf = (a) => ACTION_MAP[a]?.label || a
const tagType = (a) => ACTION_MAP[a]?.type || 'info'

const filtered = computed(() =>
  audit.all.filter((l) => {
    if (actionFilter.value && l.action !== actionFilter.value) return false
    const kw = keyword.value.trim().toLowerCase()
    if (kw) {
      const hit = l.operator.toLowerCase().includes(kw) || l.detail.toLowerCase().includes(kw)
      if (!hit) return false
    }
    return true
  })
)

const paged = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

function exportLogs() {
  exportCsv(
    'lovewall-审计日志',
    ['时间', '操作人', '动作', '摘要'],
    filtered.value.map((l) => [
      formatDateTime(l.createdAt),
      l.operator,
      labelOf(l.action),
      l.detail
    ])
  )
  ElMessage.success(`已导出 ${filtered.value.length} 条日志`)
}

function clearAll() {
  audit.clear()
  audit.log('audit.clear', '清空了全部操作日志')
  ElMessage.success('操作日志已清空')
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.log-table {
  border-radius: 10px;
  overflow: hidden;
}
.operator {
  display: flex;
  align-items: center;
  gap: 8px;
}
.op-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail {
  color: var(--text-2);
  font-size: 13px;
}
.pager-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  flex-wrap: wrap;
}
@media (max-width: 768px) {
  .pager-row {
    justify-content: center;
  }
  .toolbar-right {
    margin-left: 0;
    width: 100%;
  }
}
</style>