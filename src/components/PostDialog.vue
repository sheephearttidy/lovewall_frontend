<template>
  <el-dialog
    v-model="visible"
    title="✍️ 写下你的表白"
    width="540px"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="84px">
      <el-form-item label="收件人" prop="to">
        <el-input v-model="form.to" placeholder="TA 的名字或称呼，如：图书馆三楼的男生" maxlength="20" show-word-limit />
      </el-form-item>

      <el-form-item label="表白内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="把藏在心底的话写下来…"
        />
      </el-form-item>

      <el-form-item label="便签颜色">
        <div class="color-swatches">
          <span
            v-for="c in WALL_COLORS"
            :key="c.key"
            class="swatch"
            :class="{ active: form.color === c.key }"
            :style="{ background: c.bg, borderColor: c.header }"
            @click="form.color = c.key"
          >
            <span class="swatch-dot" :style="{ background: c.header }"></span>
            {{ c.label }}
            <el-icon v-if="form.color === c.key" class="check"><Check /></el-icon>
          </span>
        </div>
      </el-form-item>

      <el-form-item label="上传图片">
        <div class="upload-wrap">
          <el-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            accept="image/*"
            :auto-upload="false"
            :limit="3"
            :on-change="onChange"
            :on-remove="syncImages"
            :on-exceed="onExceed"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多 3 张，单张不超过 5MB，上传后自动压缩</div>
        </div>
      </el-form-item>

      <el-form-item label="是否匿名">
        <el-switch v-model="form.anonymous" active-text="匿名发布" inactive-text="使用昵称署名" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">💌 发布表白</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useWallStore } from '@/stores/wall'
import { WALL_COLORS } from '@/constants/colors'
import { fileToCompressedBase64 } from '@/utils/image'

const visible = defineModel({ type: Boolean, default: false })
const emit = defineEmits(['posted'])

const auth = useAuthStore()
const wall = useWallStore()

const formRef = ref()
const fileList = ref([])
const images = ref([])
const submitting = ref(false)

const form = reactive({
  to: '',
  content: '',
  color: 'pink',
  anonymous: false
})

const rules = {
  to: [{ required: true, message: '请填写收件人', trigger: 'blur' }],
  content: [
    { required: true, message: '请填写表白内容', trigger: 'blur' },
    { min: 2, message: '内容至少 2 个字符', trigger: 'blur' }
  ]
}

const signature = computed(() => (form.anonymous ? '匿名' : auth.currentUser?.nickname || '匿名'))

watch(visible, (val) => {
  if (val) {
    form.to = ''
    form.content = ''
    form.color = 'pink'
    form.anonymous = false
    fileList.value = []
    images.value = []
  }
})

async function onChange(file, list) {
  if (file.raw) {
    if (!file.raw.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件')
      fileList.value = list.filter((f) => f.uid !== file.uid)
      return
    }
    if (file.raw.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过 5MB')
      fileList.value = list.filter((f) => f.uid !== file.uid)
      return
    }
    try {
      file.url = await fileToCompressedBase64(file.raw)
    } catch {
      ElMessage.error('图片处理失败，请更换图片')
      fileList.value = list.filter((f) => f.uid !== file.uid)
      return
    }
  }
  syncImages()
}

function syncImages() {
  images.value = fileList.value.map((f) => f.url).filter(Boolean)
}

function onExceed() {
  ElMessage.warning('最多上传 3 张图片')
}

async function submit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    const { filtered } = wall.addConfession({
      to: form.to,
      content: form.content,
      from: signature.value,
      color: form.color,
      images: [...images.value]
    })
    ElMessage.success(
      filtered > 0
        ? `表白发布成功（已过滤 ${filtered} 处敏感词），祝你心想事成 💗`
        : '表白发布成功，祝你心想事成 💗'
    )
    visible.value = false
    emit('posted')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.swatch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1.5px solid;
  border-radius: 14px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.swatch:hover {
  transform: translateY(-1px);
}
.swatch.active {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--el-color-primary);
}
.swatch-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.check {
  font-size: 12px;
  color: var(--el-color-primary);
}
.upload-wrap {
  width: 100%;
}
.upload-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 6px;
}
</style>
