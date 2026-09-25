<template>
  <div class="manage-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索内容 / 收件人 / 署名"
        clearable
        :prefix-icon="Search"
        class="search-input"
      />
      <el-select v-model="statusFilter" clearable placeholder="状态筛选" style="width: 130px">
        <el-option label="正常" value="normal" />
        <el-option label="已隐藏" value="hidden" />
      </el-select>
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
    <el-table
      :data="paged"
      @selection-change="(rows) => (selection = rows)"
      stripe
      style="width: 100%"
    >
      <el-table-column type="selection" width="46" />
      <el-table-column prop="id" label="ID" width="110" show-overflow-tooltip />
      <el-table-column label="内容" min-width="220">
        <template #default="{ row }">
          <div class="text-ellipsis-2 cell-content">{{ row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="To" prop="to" width="130" show-overflow-tooltip />
      <el-table-column label="From" prop="from" width="90" />
      <el-table-column label="点赞" width="70" align="center">
        <template #default="{ row }">
          <el-tag type="danger" effect="plain" round>{{ row.likes.length }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评论" width="70" align="center">
        <template #default="{ row }">
          <el-tag type="info" effect="plain" round>{{ row.comments.length }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="64" align="center">
        <template #default="{ row }">
          <span v-if="row.images.length">{{ row.images.length }} 张</span>
          <span v-else class="muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="置顶" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.pinned" type="danger" effect="light" round size="small">📌 置顶</el-tag>
          <span v-else class="muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="84" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'normal' ? 'success' : 'info'">
            {{ row.status === 'normal' ? '正常' : '已隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="150">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="showDetail(row)">详情</el-button>
          <el-button link :type="row.pinned ? 'info' : 'danger'" @click="togglePinned(row)">
            {{ row.pinned ? '取消置顶' : '置顶' }}
          </el-button>
          <el-button link :type="row.status === 'normal' ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 'normal' ? '隐藏' : '恢复' }}
          </el-button>
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
        :page-sizes="[8, 16, 32]"
        layout="total, sizes, prev, pager, next"
        @size-change="pageSize = $event"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="表白详情" width="560px">
      <template v-if="detail">
        <div class="detail-item"><span class="dl">ID</span>{{ detail.id }}</div>
        <div class="detail-item"><span class="dl">收件人</span>{{ detail.to }}</div>
        <div class="detail-item"><span class="dl">署名</span>{{ detail.from }}</div>
        <div class="detail-item"><span class="dl">发布时间</span>{{ formatDateTime(detail.createdAt) }}</div>
        <div class="detail-item">
          <span class="dl">状态</span>
          <el-tag :type="detail.status === 'normal' ? 'success' : 'info'">
            {{ detail.status === 'normal' ? '正常' : '已隐藏' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="dl">置顶</span>
          <template v-if="detail.pinned">
            <el-tag type="danger" effect="light" round size="small">📌 已置顶</el-tag>
            <span class="muted" style="margin-left: 8px">{{ formatDateTime(detail.pinnedAt) }}</span>
          </template>
          <span v-else class="muted">否</span>
        </div>
        <div class="detail-item"><span class="dl">内容</span>{{ detail.content }}</div>
        <div v-if="detail.images.length" class="detail-images">
          <el-image
            v-for="(img, i) in detail.images"
            :key="i"
            :src="img"
            fit="cover"
            class="detail-img"
            :preview-src-list="detail.images"
            :initial-index="i"
            preview-teleported
          />
        </div>
        <el-divider content-position="left">评论（{{ detail.comments.length }}）</el-divider>
        <div v-for="cm in detail.comments" :key="cm.id" class="detail-comment">
          <b>{{ cm.nickname }}</b>
          <span v-if="cm.replyToNickname" class="reply-inline"> 回复 @{{ cm.replyToNickname }}</span>：{{ cm.content }}
          <span class="muted">（{{ timeAgo(cm.createdAt) }}）</span>
        </div>
        <div v-if="!detail.comments.length" class="muted">暂无评论</div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useWallStore } from '@/stores/wall'
import { useAuditStore } from '@/stores/audit'
import { formatDateTime, timeAgo } from '@/utils/format'
import { exportCsv } from '@/utils/csv'

const wall = useWallStore()
const audit = useAuditStore()
wall.init().catch(() => {})

const keyword = ref('')
const statusFilter = ref('')
const selection = ref([])
const page = ref(1)
const pageSize = ref(8)
const detailVisible = ref(false)
const detail = ref(null)

const filtered = computed(() => {
  let list = wall.confessions
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (c) =>
        c.content.toLowerCase().includes(kw) ||
        c.to.toLowerCase().includes(kw) ||
        c.from.toLowerCase().includes(kw)
    )
  }
  if (statusFilter.value) {
    list = list.filter((c) => c.status === statusFilter.value)
  }
  // 置顶优先，其余按时间倒序
  return list.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt)
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function showDetail(row) {
  detail.value = row
  detailVisible.value = true
}

async function togglePinned(row) {
  try {
    const pinned = await wall.togglePinned(row.id)
    audit.log(pinned ? 'confession.pin' : 'confession.unpin', `${pinned ? '置顶' : '取消置顶'}表白「${row.to}」(${row.id})`)
    ElMessage.success(pinned ? '已置顶，前台将优先展示' : '已取消置顶')
  } catch (e) {
    ElMessage.warning(e.message)
  }
}

async function toggleStatus(row) {
  const next = row.status === 'normal' ? 'hidden' : 'normal'
  await ElMessageBox.confirm(
    `确定要${next === 'hidden' ? '隐藏' : '恢复'}这条表白吗？`,
    '提示',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  await wall.setConfessionStatus(row.id, next)
  audit.log(next === 'hidden' ? 'confession.hide' : 'confession.show', `${next === 'hidden' ? '隐藏' : '恢复'}表白「${row.to}」(${row.id})`)
  ElMessage.success(next === 'hidden' ? '已隐藏' : '已恢复')
}

async function removeOne(row) {
  await ElMessageBox.confirm('删除后无法恢复，确定删除这条表白吗？', '警告', {
    type: 'error',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await wall.removeConfession(row.id)
  audit.log('confession.delete', `删除表白「${row.to}」(${row.id})`)
  ElMessage.success('删除成功')
}

async function batchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 条表白吗？删除后无法恢复。`, '警告', {
    type: 'error',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await wall.removeConfessions(selection.value.map((r) => r.id))
  audit.log('confession.delete', `批量删除 ${selection.value.length} 条表白`)
  selection.value = []
  ElMessage.success('批量删除成功')
}

function exportRows() {
  exportCsv(
    'lovewall-表白数据',
    ['ID', '收件人', '署名', '内容', '点赞数', '评论数', '状态', '置顶', '发布时间'],
    filtered.value.map((c) => [
      c.id, c.to, c.from, c.content, c.likeCount ?? c.likes?.length ?? 0, c.commentCount ?? c.comments?.length ?? 0,
      c.status === 'normal' ? '正常' : '已隐藏', c.pinned ? '是' : '否', formatDateTime(c.createdAt)
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
.muted {
  color: var(--text-4);
  font-size: 12px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  flex-wrap: wrap;
}
.detail-item {
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--text-1);
  line-height: 1.7;
}
.dl {
  display: inline-block;
  width: 70px;
  color: var(--text-3);
}
.detail-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 8px 0 4px;
}
.detail-img {
  width: 110px;
  height: 110px;
  border-radius: 8px;
  cursor: zoom-in;
}
.detail-comment {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.8;
}
.reply-inline {
  color: var(--hero-title);
}
@media (max-width: 768px) {
  .pagination {
    justify-content: center;
  }
}
</style>