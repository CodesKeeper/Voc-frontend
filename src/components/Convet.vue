<template>
    <div class="container">
        <textarea v-model="rawInput" placeholder="粘贴你的单词列表在这里..." class="input-area"></textarea>
        <button @click="convertWords" class="convert-btn">转换</button>

        <div v-if="convertedWords.length > 0" class="results">
            <h3>转换结果 (共 {{ convertedWords.length }} 个单词)</h3>
            <h3>紧凑格式输出:</h3>
            <pre class="json-output">{{ compactOutput }}</pre>
            <button @click="copyToClipboard" class="copy-btn">复制到剪贴板</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const rawInput = ref(``)

const convertedWords = ref([])

const convertWords = () => {
    const lines = rawInput.value.split('\n').filter(line => line.trim())
    convertedWords.value = lines.map((line, index) => {
        const [word, meaning] = line.split('\t')
        return {
        id: index + 1,
        word: word.trim(),
        meaning: meaning.trim().replace(/\|/g, ' | '),
        note: '',
        isBlurred: false
        }
    })
}

const toggleBlur = (word) => {
  word.isBlurred = !word.isBlurred
}

const compactOutput = computed(() => {
    return `[${convertedWords.value.map(word => 
        `{ id: ${word.id}, word: '${word.word}', meaning: '${word.meaning.replace(/'/g, "\\'")}', note: '', isBlurred: ${word.isBlurred} }`
    ).join(',\n')}]`
})

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(compactOutput.value)
        alert('已复制到剪贴板！')
    } catch (err) {
        console.error('复制失败:', err)
    }
}
</script>

<style scoped>
    .container {
        width: 1250px;
        margin: 0 auto;
        margin-top: 50px;
        background-color: var(--page-bg-color);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(90, 89, 89, 0.1);
    }

    .input-area {
        width: 98%;
        height: 280px;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        background-color: var(--button-bg-color);
    }
    
    .json-output {
        padding: 15px;
        border-radius: 4px;
        overflow-x: auto;
        max-height: 300px;
        overflow-y: auto;
        background-color: var(--button-bg-color);
    }

    .convert-btn, .copy-btn {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 15px;
        /* margin: 10px 0; */
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }
    
    .convert-btn:hover, .copy-btn:hover {
        background-color: #45a049;
    }
    
    .word-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }
    
    .word-card {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .word-card:hover {
        background-color: #e9e9e9;
        transform: translateY(-2px);
    }
    
    .word {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 5px;
        color: #2c3e50;
    }
    
    .meaning {
        color: #666;
        margin-bottom: 5px;
    }
    
    .blurred {
        filter: blur(5px);
        color: transparent;
        text-shadow: 0 0 8px rgba(136, 133, 133, 0.5);
    }
    
    .note {
        color: #999;
        font-size: 14px;
    }
</style>