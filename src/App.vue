<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, watch, onMounted } from 'vue'
import ThemeToggle from './components/ThemeToggle.vue'

const wordCount = ref(0)

// 监听路由变化和单词数量变化
const updateWordCount = (count) => {
//   console.log('Updating word count:', count); // 添加日志
  if (typeof count === 'number' && !isNaN(count)) {
    wordCount.value = count;
  } else {

  }
}

</script>

<template>
  <div id="app" style="display:flex">
    <header class="app-header">
      <nav class="app-nav">
        <div class="nav-content">
          <div class="nav-left">
            <RouterLink to="/" class="nav-link">单词速记</RouterLink>
          </div>
          <!-- <div class="nav-center">
            
          </div>
          <div class="nav-right">
            <ThemeToggle />
          </div> -->
        </div>
      </nav>
    </header>
    <main class="app-main" style="margin-left: 330px; width: 60%">
      <RouterView v-slot="{ Component }">
        <component 
          :is="Component" 
          :updateWordCount="updateWordCount"
        />
      </RouterView>
    </main>
    <transition name="fade">
        <div class="word-count" v-if="$route.path === '/' && wordCount > 0">
        📚 当前标签页单词数：{{ wordCount }}
        </div>
    </transition>
  </div>
</template>

<style>
#app {
    width: 100%;
    min-height: 100vh;
    transition: background-color 0.3s;
}

.app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;.word-table-container {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-cell, .word-cell, .meaning-cell, .note-cell, .action-cell {
  padding: 12px 16px;
  flex: 1;
  box-sizing: border-box;
}

.header-cell {
  font-weight: bold;
  border-right: 1px solid #e0e0e0;
}

.header-cell:last-child {
  border-right: none;
}

.virtual-scroller {
  height: 600px; /* 固定滚动区域高度 */
  width: 100%;
}
    z-index: 100;
}

.app-nav {
    background-color: var(--nav-bg-color);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.nav-content {
    /* display: flex; */
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 24px;
    height: 60px;
    box-sizing: border-box;
}

.nav-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-link {
  margin: 5px;
  padding: 8px 12px;
  text-decoration: none;
  color: var(--text-color);
  border-radius: 4px;
  transition: all 0.3s ease;
  background-color: var(--button-bg-color);
}

.nav-link:hover {
  background-color: var(--primary-hover-color);
}

.nav-link.router-link-active {
  background-color: var(--primary-color);
  color: white;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.word-count {
    width: 220px;
    height: 20px;
    padding: 8px 16px;
    border-radius: 8px;
    background-color: var(--primary-color);
    color: white;
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-top: 85px;
    margin-left: 80px;
    cursor: default;
    min-width: 180px;
    justify-content: center;
}

/* 主内容区域样式 */
.app-main {
  min-height: calc(100vh - 70px);
}

body {
  margin: 0;
  padding: 0;
  transition: background-color 0.3s;
}

body.dark-theme {
  background-color: #1a1a1a;
  color: #ffffff;
}

.import-export-btn {
    margin-right: 10px;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--button-bg-color);
    color: var(--button-text-color);
    transition: background-color 0.3s;
    white-space: nowrap;
}

.import-export-btn:hover {
    background-color: var(--primary-hover-color);
    color: white;
}
</style>