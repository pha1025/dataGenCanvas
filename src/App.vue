<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside-menu">
      <div class="logo-area">
        <el-icon :size="24" color="#409eff"><ElementPlus /></el-icon>
        <span class="logo-text">Data Master</span>
      </div>

      <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          @select="handleMenuSelect"
      >
        <el-menu-item index="generator">
          <el-icon><Cpu /></el-icon>
          <span>看板数据生成器</span>
        </el-menu-item>
        <el-menu-item index="history">
          <el-icon><List /></el-icon>
          <span>生成记录 (演示)</span>
        </el-menu-item>
        <el-menu-item index="settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon size="20" style="cursor: pointer"><Fold /></el-icon>
          <el-breadcrumb separator="/" style="margin-left: 20px">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </el-header>

      <el-main class="main-body">

        <div v-if="activeMenu === 'generator'" class="function-wrapper">
          <el-row :gutter="20" style="height: 100%">

            <el-col :span="9" :xs="24">
              <el-card class="box-card input-card" shadow="never">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><EditPen /></el-icon> 参数配置</span>
                  </div>
                </template>

                <el-form label-position="top" size="large">
                  <el-form-item label="生成器类型">
                    <el-select v-model="generatorType" placeholder="请选择" style="width: 100%">
                      <el-option label="交易KPI支付数据 (TradeKPI)" value="tradeKpiPayment" />
                      <el-option label="客户基础信息 (Customer)" value="customerInfo" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="目标区域代码 (Region Code)">
                    <el-input
                        v-model="regionCode"
                        placeholder="例如: 004012022"
                        clearable
                    >
                      <template #prefix><el-icon><Location /></el-icon></template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="生成数量">
                    <el-input-number v-model="count" :min="1" :max="100" style="width: 100%" />
                  </el-form-item>

                  <el-form-item style="margin-top: 30px">
                    <el-button
                        type="primary"
                        :loading="loading"
                        @click="fetchData"
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
                            <el-icon style="margin-right: 5px"><Document /></el-icon>
                            <span>查看生成的 SQL 语句 (共 {{ result.sqls.length }} 条)</span>
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

        <div v-else class="placeholder-page">
          <el-empty description="该模块功能正在开发中..." />
        </div>

      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  ElementPlus, Cpu, List, Setting, Fold,
  EditPen, Location, VideoPlay, Monitor, Document
} from '@element-plus/icons-vue'

// --- 状态管理 ---
const activeMenu = ref('generator')
const generatorType = ref('tradeKpiPayment')
const regionCode = ref('')
const count = ref(1)
const loading = ref(false)
const result = ref(null)

// 折叠面板控制：默认为空数组，表示“全部收起”
const activeCollapseNames = ref([])

// --- 计算属性 ---

// 1. 页面标题
const pageTitle = computed(() => {
  const map = {
    generator: '数据生成器',
    history: '生成记录',
    settings: '系统设置'
  }
  return map[activeMenu.value]
})

// 2. 拼接所有 SQL (修复只显示一条的问题)
const joinedSqls = computed(() => {
  if (!result.value || !result.value.sqls) return ''
  // 使用换行符 + 分隔符将数组拼接成字符串
  return result.value.sqls.join(';\n\n') + ';'
})

// --- 你的后端地址 ---
const API_BASE_URL = 'https://smartruledatagen.onrender.com'

// --- 方法 ---
const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const fetchData = async () => {
  if (!regionCode.value) {
    ElMessage.warning('请输入地区代码')
    return
  }
  loading.value = true
  result.value = null
  // 重置折叠状态，每次新查询都默认收起
  activeCollapseNames.value = []

  try {
    const response = await axios.post(`${API_BASE_URL}/api/datagen/generate`, {
      generatorName: generatorType.value,
      count: count.value,
      regionCode: regionCode.value,
      executeInsert: false
    })
    result.value = response.data

    if (result.value.success) {
      ElMessage.success('执行成功')
    } else {
      ElMessage.error('执行失败: ' + result.value.message)
    }
  } catch (error) {
    ElMessage.error('网络错误: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 全局布局 */
.layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 侧边栏样式 */
.aside-menu {
  background-color: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
}
.logo-text {
  margin-left: 10px;
}
.el-menu-vertical {
  border-right: none;
  flex: 1;
}

/* 顶部 Header */
.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}
.header-left, .header-right {
  display: flex;
  align-items: center;
}

/* 主内容区 */
.main-body {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.function-wrapper {
  height: 100%;
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
  font-weight: bold;
  color: #606266;
}

/* 修复折叠面板的边框，让它看起来更像一个整体代码块 */
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

/* 自定义 Textarea 样式 */
:deep(.custom-textarea .el-textarea__inner) {
  background-color: #282c34;
  color: #abb2bf;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  border: none;
  border-radius: 0; /* 去掉圆角，与折叠面板无缝衔接 */
}

.placeholder-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
}
</style>