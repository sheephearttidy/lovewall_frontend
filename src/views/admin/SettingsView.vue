<template>
  <div class="settings-page">
    <el-card shadow="never" class="panel">
      <template #header>
        <div class="panel-title"><el-icon><Setting /></el-icon>注册功能开关</div>
      </template>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">邀请码注册</div>
          <div class="setting-desc">开启后，新用户注册时必须输入有效的邀请码才能完成注册，每个邀请码仅可使用一次</div>
        </div>
        <el-switch
          v-model="inviteCodeEnabled"
          size="large"
          :loading="switching"
          @change="(val) => onSwitch('inviteCode', val)"
        />
      </div>

      <el-divider />

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">注册邮箱验证</div>
          <div class="setting-desc">开启后，新用户注册时必须填写邮箱并输入邮箱验证码完成验证（验证码 5 分钟有效，60 秒内不可重发）</div>
        </div>
        <el-switch
          v-model="emailEnabled"
          size="large"
          :loading="switching"
          @change="(val) => onSwitch('email', val)"
        />
      </div>

      <el-divider />

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">注册图形验证码</div>
          <div class="setting-desc">开启后，新用户注册时需要输入图形验证码（点击图片可刷新），防止恶意批量注册</div>
        </div>
        <el-switch
          v-model="captchaEnabled"
          size="large"
          :loading="switching"
          @change="(val) => onSwitch('captcha', val)"
        />
      </div>

      <el-divider />

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">敏感词过滤</div>
          <div class="setting-desc">开启后，表白与评论中的敏感词将自动替换为 *（内置演示词库，生产环境建议替换为服务端词库或第三方审核 API）</div>
        </div>
        <el-switch
          v-model="sensitiveEnabled"
          size="large"
          :loading="switching"
          @change="(val) => onSwitch('sensitive', val)"
        />
      </div>

      <el-divider />

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">发布频率限制</div>
          <div class="setting-desc">为保障内容质量，已内置频率限制：每用户发布表白间隔 60 秒、发表评论间隔 30 秒（始终生效，无需开关）</div>
        </div>
        <el-tag effect="plain" round>内置</el-tag>
      </div>

      <el-alert
        class="mt"
        type="info"
        :closable="false"
        show-icon
        title="演示模式说明"
        description="当前为本地 Mock 环境：邮箱验证码不会真实发送邮件，将以页面通知形式直接显示验证码；图形验证码在前端本地生成并校验。接入真实后端后，请将两项验证逻辑迁移至服务端。"
      />
    </el-card>

    <el-card v-if="inviteCodeEnabled" shadow="never" class="panel mt">
      <template #header>
        <div class="panel-title"><el-icon><Ticket /></el-icon>邀请码管理</div>
      </template>

      <div class="invite-toolbar">
        <el-input-number v-model="generateCount" :min="1" :max="50" size="default" />
        <el-button type="primary" @click="generateCodes">批量生成</el-button>
        <el-tag effect="plain" round type="info">共 {{ inviteCodes.length }} 个，可用 {{ availableCount }} 个</el-tag>
      </div>

      <el-table :data="inviteCodes" stripe size="small" class="invite-table" empty-text="暂无邀请码">
        <el-table-column prop="code" label="邀请码" width="140">
          <template #default="{ row }">
            <code class="invite-code">{{ row.code }}</code>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.used ? 'info' : 'success'" effect="light" round size="small">
              {{ row.used ? '已使用' : '可用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用人" min-width="120">
          <template #default="{ row }">
            <span v-if="row.usedBy" class="used-by">{{ row.usedBy }}</span>
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="使用时间" width="170">
          <template #default="{ row }">
            {{ row.usedAt ? formatDateTime(row.usedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="deleteCode(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="panel mt">
      <template #header>
        <div class="panel-title"><el-icon><InfoFilled /></el-icon>当前注册流程</div>
      </template>
      <div class="flow-steps">
        <el-tag effect="plain" round>用户名 / 昵称</el-tag>
        <span class="arrow">→</span>
        <el-tag v-if="emailEnabled" type="danger" effect="light" round>邮箱 + 验证码</el-tag>
        <span v-if="emailEnabled" class="arrow">→</span>
        <el-tag effect="plain" round>设置密码</el-tag>
        <span class="arrow">→</span>
        <el-tag v-if="inviteCodeEnabled" type="primary" effect="light" round>邀请码</el-tag>
        <span v-if="inviteCodeEnabled" class="arrow">→</span>
        <el-tag v-if="captchaEnabled" type="warning" effect="light" round>图形验证码</el-tag>
        <span v-if="captchaEnabled" class="arrow">→</span>
        <el-tag type="success" effect="light" round>完成注册</el-tag>
      </div>
      <div v-if="!emailEnabled && !captchaEnabled && !inviteCodeEnabled" class="muted-tip">当前注册未启用任何附加验证，仅有基础表单校验。</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettingsStore } from '@/stores/settings'
import { useAuditStore } from '@/stores/audit'
import { formatDateTime } from '@/utils/format'

const settings = useSettingsStore()
const audit = useAuditStore()
settings.init().catch(() => {})

const SETTING_NAMES = {
  email: '注册邮箱验证',
  captcha: '注册图形验证码',
  sensitive: '敏感词过滤',
  inviteCode: '邀请码注册'
}

const emailEnabled = ref(settings.emailVerificationEnabled)
const captchaEnabled = ref(settings.captchaEnabled)
const sensitiveEnabled = ref(settings.sensitiveFilterEnabled)
const inviteCodeEnabled = ref(settings.inviteCodeEnabled)
const switching = ref(false)

const inviteCodes = ref(settings.getInviteCodes())
const generateCount = ref(5)

const availableCount = computed(() => inviteCodes.value.filter((c) => !c.used).length)

async function onSwitch(type, val) {
  switching.value = true
  try {
    if (type === 'email') {
      await settings.setEmailVerification(val)
    } else if (type === 'captcha') {
      await settings.setCaptcha(val)
    } else if (type === 'inviteCode') {
      settings.setInviteCode(val)
    } else {
      await settings.setSensitiveFilter(val)
    }
    audit.log('settings.update', `将「${SETTING_NAMES[type]}」设为${val ? '开启' : '关闭'}`)
    ElMessage.success(`已${val ? '开启' : '关闭'}${SETTING_NAMES[type]}`)
  } catch (e) {
    ElMessage.error(e.message || '设置更新失败')
  } finally {
    switching.value = false
  }
}

function generateCodes() {
  const added = settings.addInviteCodes(generateCount.value)
  inviteCodes.value = settings.getInviteCodes()
  audit.log('inviteCode.generate', `生成了 ${added.length} 个邀请码`)
  ElMessage.success(`已生成 ${added.length} 个邀请码`)
}

function deleteCode(row) {
  ElMessageBox.confirm(`确定删除邀请码 ${row.code}？`, '删除确认', { type: 'warning' })
    .then(() => {
      settings.deleteInviteCode(row.id)
      inviteCodes.value = settings.getInviteCodes()
      audit.log('inviteCode.delete', `删除邀请码 ${row.code}`)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}
</script>

<style scoped>
.panel {
  border-radius: 12px;
}
.mt {
  margin-top: 16px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text-1);
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 4px 0;
}
.setting-info {
  flex: 1;
  min-width: 0;
}
.setting-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 4px;
}
.setting-desc {
  font-size: 13px;
  color: var(--text-3);
  line-height: 1.7;
}
.flow-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.arrow {
  color: var(--text-4);
  font-size: 14px;
}
.muted-tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-4);
}
.invite-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.invite-table {
  width: 100%;
}
.invite-code {
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--el-color-primary);
}
.used-by {
  font-size: 12px;
  color: var(--text-3);
}
.muted {
  color: var(--text-4);
}
@media (max-width: 768px) {
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .invite-table {
    overflow-x: auto;
  }
}
@media (max-width: 480px) {
  .invite-toolbar {
    gap: 8px;
  }
}
</style>