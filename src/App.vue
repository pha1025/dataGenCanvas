<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>📊 客户经理数据生成器</span>
        </div>
      </template>

      <div class="input-section">
        <el-input
            v-model="regionCode"
            placeholder="请输入地区代码 (例如: 004012022)"
            style="width: 300px; margin-right: 10px;"
            clearable
        />
        <el-button type="primary" :loading="loading" @click="fetchData">
          生成并查询
        </el-button>
      </div>

      <div v-if="result" class="result-section">
        <el-alert
            v-if="result.success"
            title="生成成功"
            type="success"
            show-icon
            :closable="false"
        />
        <el-alert
            v-else
            :title="result.message"
            type="error"
            show-icon
            :closable="false"
        />

        <div v-if="result.sqls && result.sqls.length > 0" style="margin-top: 20px;">
          <h3>生成的 SQL 语句：</h3>
          <el-input
              v-model="result.sqls[0]"
              :rows="5"
              type="textarea"
              readonly
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// --- 状态定义 ---
const regionCode = ref('') // 用户输入的地区代码
const loading = ref(false) // 加载状态
const result = ref(null)   // 后端返回的数据

// --- 你的后端地址 (记得最后不要带斜杠，或者根据你 Controller 修改) ---
const API_BASE_URL = 'https://smartruledatagen.onrender.com'

// --- 核心方法 ---
const fetchData = async () => {
  if (!regionCode.value) {
    ElMessage.warning('请输入地区代码')
    return
  }

  loading.value = true
  result.value = null

  try {
    // 发送 POST 请求
    const response = await axios.post(`${API_BASE_URL}/api/datagen/generate`, {
      generatorName: "tradeKpiPayment", // 根据你的接口要求硬编码或做成下拉框
      count: 1,
      regionCode: regionCode.value,
      executeInsert: false
    })

    result.value = response.data

    if (result.value.success) {
      ElMessage.success('查询成功')
    } else {
      ElMessage.error(result.value.message || '查询失败')
    }

  } catch (error) {
    console.error(error)
    ElMessage.error('网络请求错误: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.app-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
}
.input-section {
  display: flex;
  margin-bottom: 20px;
}
.result-section {
  margin-top: 20px;
}
</style>