<template>
    <div class="custom-select" :class="{ 'open': isOpen }">
      <div class="selected" @click="toggleDropdown">
        {{ selectedOption ? selectedOption.label : placeholder }}
        <span class="arrow">▼</span>
      </div>
      <div class="options" v-if="isOpen">
        <div 
          v-for="option in options" 
          :key="option.value"
          class="option"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: '请选择'
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'change']);
  
  const isOpen = ref(false);
  const isDarkTheme = document.body.classList.contains('dark-theme');
  
  const selectedOption = computed(() => {
    return props.options.find(option => option.value === props.modelValue);
  });
  
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };
  
  const selectOption = (option) => {
    emit('update:modelValue', option.value);
    emit('change', option.value);
    isOpen.value = false;
  };
  
  const handleClickOutside = (event) => {
    const select = event.target.closest('.custom-select');
    if (!select) {
      isOpen.value = false;
    }
  };
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
  </script>
  
  <style scoped>
  .custom-select {
    position: relative;
    width: 100%;
    min-width: 120px;
    user-select: none;
    font-size: 1em;
  }
  
  .selected {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--input-bg-color);
    color: var(--text-color);
    cursor: pointer;
  }
  
  .arrow {
    margin-left: 8px;
    font-size: 0.8em;
    transition: transform 0.2s;
  }
  
  .open .arrow {
    transform: rotate(180deg);
  }
  
  .options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 4px 4px;
    background-color: #fff;
    z-index: 10;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .option {
    padding: 8px 12px;
    cursor: pointer;
    color: var(--select-option-text);
    background-color: #fff;
  }
  
  .option:hover {
    background-color: var(--select-hover-bg);
  }
  
  /* 暗黑主题样式 */
  .dark-theme .options,
  .dark-theme .option {
    background-color: #2c2c2c;
  }
  
  .dark-theme .option:hover {
    background-color: #3c3c3c;
  }
  </style>