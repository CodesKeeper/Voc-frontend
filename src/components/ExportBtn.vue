<!-- <script setup>
import { ref } from 'vue';

const props = defineProps({
    allWords: {
        type: Array,
        required: true
    },
    masteredWords: {
        type: Array,
        required: true
    },
    difficultWords: {
        type: Array,
        required: true
    }
});

// 导出所有数据为JSON文件
const exportAllData = () => {
    const data = {
        allWords: props.allWords,
        masteredWords: props.masteredWords,
        difficultWords: props.difficultWords,
        version: '1.0',
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `单词学习记录_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
</script>

<template>
    <button class="import-export-btn" @click="exportAllData">全部导出</button>
</template> -->


<script setup>
import { ref } from 'vue';

const props = defineProps({
    allWords: {
        type: Array,
        required: true
    },
    masteredWords: {
        type: Array,
        required: true
    },
    difficultWords: {
        type: Array,
        required: true
    }
});

const errorMessage = ref('');
const showNotification = ref(false);

// 显示自动关闭的通知
const showAutoCloseNotification = (message) => {
    errorMessage.value = message;
    showNotification.value = true;
    setTimeout(() => {
        showNotification.value = false;
    }, 3000);
};

// 导出所有数据为JSON文件
const exportAllData = async () => {
    try {
        // 检查浏览器是否支持文件系统API
        if (!window.showSaveFilePicker) {
            showAutoCloseNotification('您的浏览器不支持选择保存路径，请使用最新版Chrome、Edge或Opera浏览器');
            // 降级处理：使用传统下载方式
            exportWithTraditionalMethod();
            return;
        }

        // 准备文件名
        const fileName = `单词学习记录_${new Date().toISOString().slice(0, 10)}.json`;
        
        // 显示文件保存对话框，让用户选择路径和文件名
        const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
                {
                    description: 'JSON文件',
                    accept: {
                        'application/json': ['.json'],
                    },
                },
            ],
        });

        // 准备要导出的数据
        const data = {
            allWords: props.allWords,
            masteredWords: props.masteredWords,
            difficultWords: props.difficultWords,
            version: '1.0',
            exportedAt: new Date().toISOString()
        };

        // 将数据写入用户选择的文件
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();

        showAutoCloseNotification('文件已成功导出');
    } catch (err) {
        // 处理用户取消选择或其他错误
        if (err.name !== 'AbortError') {
            showAutoCloseNotification(`导出失败: ${err.message}`);
            console.error('导出错误:', err);
        }
    }
};

// 传统下载方式（用于不支持File System Access API的浏览器）
const exportWithTraditionalMethod = () => {
    const data = {
        allWords: props.allWords,
        masteredWords: props.masteredWords,
        difficultWords: props.difficultWords,
        version: '1.0',
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `单词学习记录_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
</script>

<template>
    <div class="export-btn-container">
        <button class="import-export-btn" @click="exportAllData">全部导出</button>
        
        <!-- 通知提示 -->
        <div 
            class="notification" 
            v-if="showNotification"
        >
            {{ errorMessage }}
        </div>
    </div>
</template>

<style scoped>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    background-color: #1890ff;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
}

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
