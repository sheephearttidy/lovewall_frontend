<template>
  <div class="manage-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索评论内容 / 评论人"
        clearable
        :prefix-icon="Search"
        class="search-input"
      />
      <div class="spacer"></div>
      <el-button :disabled="!filtered.length" @click="exportRows">
        <el-icon><Download /></el-icon>
        <span>导出 CSV</span>
      </el-button>
      <el-button type="danger" plain :disabled="!selection.length" @click="batchDelete">
        批量删除{{ selection.length ? `（${selection.length}）` : '' }}
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="paged" @selection-change="(rows) => (selection = rows)" stripe style="width: 100%">
      <el-table-column type="selection" width="46" />
      <el-table-column prop="id" label="评论ID" width="120" show-overflow-tooltip />
      <el-table-column label="评论内容" min-width="220">
        <template #default="{ row }">
          <div class="text-ellipsis-2 cell-content">{{ row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="所属表白" min-width="180">
        <template #default="{ row }">
          <div class="text-ellipsis-2 cell-content muted-2">To：{{ row.confessionTo }} | {{ row.confessionContent }}</div>
        </template>
      </el-table-column>
      <el-table-column label="评论人" prop="nickname" width="100" />
      <el-table-column label="时间" width="150">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button link type="danger" @click="removeOne(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="filtered.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="pageSize = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useWallStore } from '@/stores/wall'
import { useAuditStore } from '@/stores/audit'
import { formatDateTime } from '@/utils/format'
import { exportCsv } from '@/utils/csv'

const wall = useWallStore()
const audit = useAuditStore()
wall.init().catch(() => {})

const keyword = ref('')
const selection = ref([])
const page = ref(1)
const pageSize = ref(10)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return wall.allComments
  return wall.allComments.filter(
    (cm) => cm.content.toLowerCase().includes(kw) || cm.nickname.toLowerCase().includes(kw)
  )
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

async function removeOne(row) {
  await ElMessageBox.confirm('删除后无法恢复，确定删除这条评论吗？', '警告', {
    type: 'error',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await wall.removeComment(row.id)
  audit.log('comment.delete', `删除评论「${row.content.slice(0, 20)}…」(${row.id})`)
  ElMessage.success('删除成功')
}

async function batchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 条评论吗？删除后无法恢复。`, '警告', {
    type: 'error',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await wall.removeComments(selection.value.map((r) => r.id))
  audit.log('comment.delete', `批量删除 ${selection.value.length} 条评论`)
  selection.value = []
  ElMessage.success('批量删除成功')
}

function exportRows() {
  exportCsv(
    'lovewall-评论数据',
    ['评论ID', '内容', '所属表白', '评论人', '时间'],
    filtered.value.map((cm) => [
      cm.id, cm.content, `To：${cm.confessionTo}`, cm.nickname, formatDateTime(cm.createdAt)
    ])
  )
  ElMessage.success(`已导出 ${filtered.value.length} 条数据`)
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
  width: min(260px, 100%);
}
.spacer {
  flex: 1;
}
.cell-content {
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.6;
}
.muted-2 {
  color: var(--text-3);
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  flex-wrap: wrap;
}
@media (max-width: 768px) {
  .pagination {
    justify-content: center;
  }
}
</style>