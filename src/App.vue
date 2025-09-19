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
    <div id="app">
        <RouterView v-slot="{ Component }">
            <component 
            :is="Component" 
            :updateWordCount="updateWordCount"
            />
        </RouterView>
    
    </div>
</template>

<style>
#app {
    width: 100%;
    min-height: 100vh;
    transition: background-color 0.3s;
}

.virtual-scroller {
  height: 600px; /* 固定滚动区域高度 */
  width: 100%;
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
    /* margin-top: 85px;
    margin-left: 80px; */
    cursor: default;
    min-width: 180px;
    justify-content: center;
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
