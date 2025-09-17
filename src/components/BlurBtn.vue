<script setup>
import { computed } from 'vue';

// 添加模糊切换按钮
const toggleBlurAll = () => {
    let currentWords;
    switch (currentTab.value) {
        case 'mastered':
            currentWords = masteredWords.value;
            break;
        case 'difficult':
            currentWords = difficultWords.value;
            break;
        default:
            currentWords = allWords.value;
    }
    
    // 获取当前大多数单词的模糊状态
    const blurredCount = currentWords.filter(w => w.isBlurred).length;
    const shouldBlur = blurredCount <= currentWords.length / 2;
    
    // 根据当前状态设置所有单词的模糊状态
    currentWords.forEach(word => {
        word.isBlurred = shouldBlur;
    });
};


// 计算当前标签页中的单词是否大多数处于模糊状态
const isCurrentTabMostlyBlurred = computed(() => {
    let words;
    switch (currentTab.value) {
        case 'mastered':
            words = masteredWords.value;
            break;
        case 'difficult':
            words = difficultWords.value;
            break;
        default:
            words = allWords.value;
    }
    
    const blurredCount = words.filter(w => w.isBlurred).length;
    return blurredCount > words.length / 2;
});
</script>

<template>
<button class="blur-toggle-btn" @click="toggleBlurAll" title="切换模糊状态">
    {{ isCurrentTabMostlyBlurred ? '清晰' : '模糊' }}
</button>
</template>

<style scoped>

</style>