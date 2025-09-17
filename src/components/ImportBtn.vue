<script setup>
import { ref } from 'vue';

const emits = defineEmits(['import-all-data']);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref(''); // 'success' 或 'error'

// 显示通知并自动关闭
const showAutoCloseNotification = (message, type) => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  
  // 3秒后自动关闭
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// 导入数据
const importAllData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // 验证数据格式
        if (!data.allWords || !data.masteredWords || !data.difficultWords) {
          showAutoCloseNotification('导入失败：文件格式不正确', 'error');
          return;
        }
        
        emits('import-all-data', data);
        showAutoCloseNotification('数据导入成功！', 'success');
      } catch (error) {
        showAutoCloseNotification(`导入失败：${error.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};
</script>

<template>
  <div class="import-btn-container">
    <button class="import-export-btn" @click="importAllData">全部导入</button>
    
    <!-- 自动关闭的通知组件 -->
    <div 
      class="auto-notification" 
      :class="notificationType"
      v-if="showNotification"
    >
      {{ notificationMessage }}
    </div>
  </div>
</template>

<style scoped>
.auto-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
}

.success {
  background-color: #52c41a; /* 成功绿色 */
}

.error {
  background-color: #ff4d4f; /* 错误红色 */
}

/* 动画效果 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>

