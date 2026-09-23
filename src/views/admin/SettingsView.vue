<template>
  <div class="settings-page">
    <el-card shadow="never" class="panel">
      <template #header>
        <div class="panel-title"><el-icon><Setting /></el-icon>注册功能开关</div>
      </template>

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
        <el-tag v-if="captchaEnabled" type="warning" effect="light" round>图形验证码</el-tag>
        <span v-if="captchaEnabled" class="arrow">→</span>
        <el-tag type="success" effect="light" round>完成注册</el-tag>
      </div>
      <div v-if="!emailEnabled && !captchaEnabled" class="muted-tip">当前注册未启用任何附加验证，仅有基础表单校验。</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
settings.init()

const emailEnabled = ref(settings.emailVerificationEnabled)
const captchaEnabled = ref(settings.captchaEnabled)
const sensitiveEnabled = ref(settings.sensitiveFilterEnabled)
const switching = ref(false)

function onSwitch(type, val) {
  switching.value = true
  try {
    if (type === 'email') {
      settings.setEmailVerification(val)
      ElMessage.success(val ? '已开启注册邮箱验证' : '已关闭注册邮箱验证')
    } else if (type === 'captcha') {
      settings.setCaptcha(val)
      ElMessage.success(val ? '已开启注册图形验证码' : '已关闭注册图形验证码')
    } else {
      settings.setSensitiveFilter(val)
      ElMessage.success(val ? '已开启敏感词过滤' : '已关闭敏感词过滤')
    }
  } finally {
    switching.value = false
  }
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
  color: #303133;
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
  color: #303133;
  margin-bottom: 4px;
}
.setting-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.7;
}
.flow-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.arrow {
  color: #c0c4cc;
  font-size: 14px;
}
.muted-tip {
  margin-top: 12px;
  font-size: 13px;
  color: #c0c4cc;
}
</style>
