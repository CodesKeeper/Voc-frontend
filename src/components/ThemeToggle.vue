<template>
  <button class="theme-toggle" @click="toggleTheme">
    <span v-if="isDarkTheme">🌙</span>
    <span v-else>🌞</span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isDarkTheme = ref(false);

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('darkTheme', isDarkTheme.value);
};

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('darkTheme');
  if (savedTheme === 'true') {
    isDarkTheme.value = true;
    document.body.classList.add('dark-theme');
  }
});
</script>

<style scoped>
.theme-toggle {
  /* padding: 8px; */
  border: none;
  border-radius: 8px;
  background-color: transparent;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background-color: var(--button-hover-bg);
}
</style>