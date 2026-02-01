<template>
  <div class="function-wrapper">
    <el-row :gutter="20" style="height: 100%">

      <el-col :span="9" :xs="24">
        <el-card class="box-card input-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span><el-icon><EditPen /></el-icon> 参数配置</span>
            </div>
          </template>

          <el-tabs v-model="activeTab" class="generator-tabs" @tab-change="handleTabChange">
            <el-tab-pane label="中小" name="sme" />
            <el-tab-pane label="财代" name="fiscal" />
          </el-tabs>

          <el-form label-position="top" size="large">
            <el-form-item label="生成器类型">
              <el-select v-model="generatorType" placeholder="请选择" style="width: 100%">
                <template v-if="activeTab === 'sme'">
                  <el-option label="中小业绩统计" value="tradeKpiPayment" />
                  <el-option label="中小客户盘点" value="customerReviewExpire" />
                </template>
                <template v-else>
                  <el-option label="财代业绩统计" value="csOrderPayment" />
                  <el-option label="财代账套到期" value="csBoardAuthMonthly" />
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="选择模式">
              <el-radio-group v-model="selectionMode">
                <el-radio value="region">按地区</el-radio>
                <el-radio value="customerManager">按客户经理ID</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="selectionMode === 'region'" label="目标区域代码 (Region Code)">
              <el-select
                  v-model="regionCode"
                  placeholder="请选择地区"
                  clearable
                  style="width: 100%"
              >
                <el-option
                  v-for="item in currentRegionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <template v-if="selectionMode === 'customerManager'">
              <el-form-item label="客户经理ID (Customer Manage ID)">
                <el-input
                    v-model="customerManageId"
                    placeholder="请输入客户经理ID"
                    clearable
                >
                  <template #prefix><el-icon><User /></el-icon></template>
                </el-input>
              </el-form-item>
            </template>

            <el-form-item label="结束月份 (End Date Month)">
              <el-date-picker
                  v-model="endDateMonth"
                  type="month"
                  placeholder="选择月份 (yyyy-MM)"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="生成数量">
              <el-input-number v-model="count" :min="1" :max="100" style="width: 100%" />
            </el-form-item>

            <el-form-item label="直接执行入库 (Execute Insert)">
              <el-radio-group v-model="executeInsert">
                <el-radio :value="true">是 (True)</el-radio>
                <el-radio :value="false">否 (False)</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item style="margin-top: 30px">
              <el-button
                  type="primary"
                  :loading="loading"
                  @click="handleGenerate"
                  style="width: 100%; height: 45px; font-size: 16px"
              >
                <el-icon style="margin-right: 8px"><VideoPlay /></el-icon>
                开始执行
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="15" :xs="24">
        <el-card class="box-card result-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span><el-icon><Monitor /></el-icon> 执行结果控制台</span>
              <el-tag v-if="result" :type="result.success ? 'success' : 'danger'" effect="dark">
                {{ result.success ? 'SUCCESS' : 'ERROR' }}
              </el-tag>
            </div>
          </template>

          <el-empty
              v-if="!result && !loading"
              description="请在左侧配置参数并点击执行"
              :image-size="120"
          />

          <div v-else-if="loading" class="loading-wrapper">
            <el-skeleton :rows="5" animated />
          </div>

          <div v-else class="result-content">
            <div class="stat-row">
              <div class="stat-item">
                <div class="label">生成总数</div>
                <div class="value">{{ result.generatedCount || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="label">成功入库</div>
                <div class="value green">{{ result.successInsertCount || 0 }}</div>
              </div>
            </div>

            <el-alert
                :title="result.message"
                :type="result.success ? 'success' : 'error'"
                show-icon
                :closable="false"
                style="margin: 20px 0"
            />

            <div v-if="result.sqls && result.sqls.length" class="code-section">
              <el-collapse v-model="activeCollapseNames">
                <el-collapse-item name="sqlContent">
                  <template #title>
                    <div class="collapse-title">
                      <div class="title-left">
                        <el-icon style="margin-right: 5px"><Document /></el-icon>
                        <span>查看生成的 SQL 语句 (共 {{ result.sqls.length }} 条)</span>
                      </div>
                      <el-button
                          type="primary"
                          link
                          size="small"
                          class="copy-btn"
                          @click.stop="handleCopySql"
                          style="margin-right: 20px"
                      >
                        <el-icon style="margin-right: 4px"><CopyDocument /></el-icon>
                        一键复制
                      </el-button>
                    </div>
                  </template>

                  <el-input
                      :model-value="joinedSqls"
                      type="textarea"
                      :rows="15"
                      readonly
                      resize="none"
                      class="custom-textarea"
                  />
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  EditPen, Location, VideoPlay, Monitor, Document, CopyDocument, User
} from '@element-plus/icons-vue'
import { generateData } from '@/api/generator'

// --- 状态管理 ---
const activeTab = ref('sme')
const selectionMode = ref('region')
const generatorType = ref('tradeKpiPayment')
const regionCode = ref('')
const customerManageId = ref('')
const endDateMonth = ref('')
const count = ref(1)
const executeInsert = ref(false)
const loading = ref(false)
const result = ref(null)

// 监听选择模式变化，清空互斥参数
watch(selectionMode, (newMode) => {
  if (newMode === 'region') {
    customerManageId.value = ''
  } else if (newMode === 'customerManager') {
    regionCode.value = ''
  }
})

// 地区选项数据
const regionOptionsMap = {
  sme: [
    { label: '河北大区 (004012022)', value: '004012022' },
    { label: '广东大区 (004012020)', value: '004012020' },
    { label: '上海中小 (004012003)', value: '004012003' },
    { label: '广州中小 (004012004)', value: '004012004' },
    { label: '杭州中小 (004012005)', value: '004012005' },
    { label: '成都中小 (004012006)', value: '004012006' },
  ],
  fiscal: [
    { label: '河北大区 (004011006)', value: '004011006' },
    { label: '浙江大区 (004011009)', value: '004011009' },
    { label: '上海财代 (004011003)', value: '004011003' },
    { label: '广州财代 (004011004)', value: '004011004' },
    { label: '杭州财代 (004011005)', value: '004011005' },
    { label: '成都财代 (004011006)', value: '004011006' },
  ]
}

// 折叠面板控制
const activeCollapseNames = ref([])

// --- 计算属性 ---
const currentRegionOptions = computed(() => {
  return regionOptionsMap[activeTab.value] || []
})

const joinedSqls = computed(() => {
  if (!result.value || !result.value.sqls) return ''
  return result.value.sqls.join(';\n\n') + ';'
})

// --- 方法 ---
const handleTabChange = (name) => {
  // 切换 tab 时重置部分参数，并根据 tab 设置默认生成器类型
  if (name === 'sme') {
    generatorType.value = 'tradeKpiPayment'
  } else {
    generatorType.value = 'csOrderPayment'
  }
  regionCode.value = ''
  customerManageId.value = ''
  endDateMonth.value = ''
  result.value = null
}

const handleGenerate = async () => {
  // 校验
  if (selectionMode.value === 'region' && !regionCode.value) {
    ElMessage.warning('请选择地区代码')
    return
  }
  if (selectionMode.value === 'customerManager' && !customerManageId.value) {
    ElMessage.warning('请输入客户管理ID')
    return
  }

  loading.value = true
  result.value = null
  activeCollapseNames.value = []

  // 构建请求参数
  const params = {
    generatorName: generatorType.value,
    count: count.value,
    regionCode: regionCode.value || '',
    executeInsert: executeInsert.value
  }

  // 拓展字段：当存在客户管理ID或结束月份时，传入 extraParams
  if (customerManageId.value || endDateMonth.value) {
    params.extraParams = {
      customerManageId: customerManageId.value || '',
      endDateMonth: endDateMonth.value || ''
    }
  }

  try {
    const res = await generateData(params)
    
    result.value = res

    if (res.success) {
      ElMessage.success('执行成功')
    } else {
      ElMessage.error('执行失败: ' + res.message)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCopySql = async () => {
  if (!joinedSqls.value) return
  
  try {
    await navigator.clipboard.writeText(joinedSqls.value)
    ElMessage.success('复制成功')
  } catch (err) {
    console.error('Failed to copy: ', err)
    ElMessage.error('复制失败，请手动选择复制')
  }
}
</script>

<style scoped>
.function-wrapper {
  height: 100%;
}

.generator-tabs {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

/* 卡片通用样式 */
.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 8px;
}
:deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}
.card-header .el-icon {
  margin-right: 6px;
  vertical-align: middle;
}

/* 结果区样式 */
.result-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stat-row {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}
.stat-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  flex: 1;
  text-align: center;
}
.stat-item .label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 5px;
}
.stat-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.stat-item .value.green {
  color: #67c23a;
}

/* 代码区域样式优化 */
.code-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
.collapse-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 15px;
  font-weight: bold;
  color: #606266;
}

.title-left {
  display: flex;
  align-items: center;
}

.copy-btn {
  font-weight: normal;
  margin-left: 10px;
}

.copy-btn:hover {
  opacity: 0.8;
}

:deep(.el-collapse) {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
:deep(.el-collapse-item__header) {
  padding-left: 15px;
  background-color: #f5f7fa;
}
:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

:deep(.custom-textarea .el-textarea__inner) {
  background-color: #282c34;
  color: #abb2bf;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  border: none;
  border-radius: 0;
}
</style>
