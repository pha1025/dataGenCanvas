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
          router
      >
        <el-menu-item index="/generator">
          <el-icon><Cpu /></el-icon>
          <span>看板数据生成器</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <el-icon><List /></el-icon>
          <span>生成记录 (演示)</span>
        </el-menu-item>
        <el-menu-item index="/settings">
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
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElementPlus, Cpu, List, Setting, Fold } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  return route.meta.title || 'Dashboard'
})
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

/* 简单的过渡动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
