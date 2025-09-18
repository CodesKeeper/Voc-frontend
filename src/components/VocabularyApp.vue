<template>
    <div class="vocabulary-app" :class="{ 'dark-theme': isDarkTheme }">
        <nav class="nav-bar" style="top: 0;">
            <div class="nav-bar-content">
                <div class="tabs">
                <button 
                    v-for="tab in tabs"
                    :key="tab.id"
                    :class="{ active: currentTab === tab.id }"
                    @click="currentTab = tab.id"
                >
                    {{ tab.name }}
                </button>
                </div>
                <div class="controls">
                <div class="import-export-buttons">
                    <button class="import-export-btn">
                        <RouterLink to="/convert">格式转换</RouterLink>
                    </button>
                    <ExportBtn :allWords="allWords" :masteredWords="masteredWords" :difficultWords="difficultWords"/>
                    <ImportBtn @import-all-data="handleImport"/>
                </div>
                <div class="sort-controls">
                    <CustomSelect
                        v-model="sortMethods[currentTab]"
                        :options="sortOptions"
                        placeholder="排序方式"
                        @change="handleSort"
                    />
                
                    <button class="blur-toggle-btn" @click="toggleBlurAll" title="切换模糊状态">
                        {{ isCurrentTabMostlyBlurred ? '清晰' : '模糊' }}
                    </button>
                </div>
                <div class="search-control">
                    <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索单词..."
                    class="search-input"
                    @keyup.enter="handleSearch"
                    />
                    <button class="search-btn" @click="handleSearch">搜索</button>
                </div>
                <ThemeToggle />
                <!-- <transition name="fade">
                    <div class="word-count" v-if="$route.path === '/' && wordCount > 0">
                    📚 当前标签页单词数：{{ wordCount }}
                    </div>
                </transition> -->
                </div>
            </div>
        </nav>
        <div class="word-table">
            <div class="word-table-container">
                <!-- 表格头部保持固定 -->
                <div class="table-header">
                    <div class="header-cell">单词</div>
                    <div class="header-cell">释义</div>
                    <div class="header-cell">助记</div>
                    <div class="header-cell">操作</div>
                </div>

                <!-- 虚拟滚动容器 -->
                <RecycleScroller class="virtual-scroller" :items="currentWords" :item-size="60" key-field="id">
                    <!-- 每个单词项的模板 -->
                    <template #default="{ item: word }">
                        <div class="word-row">
                            <div class="word-cell">{{ word.word }}</div>
                            <div class="meaning-cell" :class="{ 'blurred': word.isBlurred }" @click="toggleWordBlur(word)">
                                {{ word.meaning }}
                            </div>
                            <div class="note-cell">
                                <input type="text" v-model="word.note" placeholder="添加助记..." class="note-input">
                            </div>
                            <div class="action-cell">
                                <template v-if="currentTab === 'all'">
                                    <button @click="moveWord(word, 'mastered')" title="移到熟记" class="action-btn"><span>❌</span></button>
                                    <button @click="moveWord(word, 'multiMeaning')" title="移到多义" class="action-btn">🔀</button>
                                    <button @click="moveWord(word, 'difficult')" title="移到难记" class="action-btn">★</button>
                                </template>
                                <template v-else-if="currentTab === 'mastered'">
                                    <button @click="moveWord(word, 'difficult')" title="移到难记" class="action-btn">★</button>
                                    <button @click="moveWord(word, 'multiMeaning')" title="移到多义" class="action-btn">🔀</button>
                                    <button @click="moveWord(word, 'all')" title="移回全部" class="action-btn">↩</button>
                                </template>
                                <template v-else-if="currentTab === 'multiMeaning'">
                                    <button @click="moveWord(word, 'mastered')" title="移到熟记" class="action-btn"><span>❌</span></button>
                                    <button @click="moveWord(word, 'difficult')" title="移到难记" class="action-btn">★</button>
                                    <button @click="moveWord(word, 'all')" title="移回全部" class="action-btn">↩</button>
                                </template>
                                <template v-else>
                                    <button @click="moveWord(word, 'mastered')" title="移到熟记" class="action-btn"><span>❌</span></button>
                                    <button @click="moveWord(word, 'multiMeaning')" title="移到多义" class="action-btn">🔀</button>
                                    <button @click="moveWord(word, 'all')" title="移回全部" class="action-btn">↩</button>
                                </template>
                            </div>
                        </div>
                    </template>
                </RecycleScroller>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import CustomSelect from './CustomSelect.vue';
import ThemeToggle from './ThemeToggle.vue';
import { RouterLink, RouterView, useRouter } from 'vue-router'
import ExportBtn from './ExportBtn.vue';
import ImportBtn from './ImportBtn.vue';
import { debounce } from 'lodash';
// import initialWords from "../../data.json"

// 在 setup 中创建路由实例
const router = useRouter();  // 关键：定义 router 变量


const props = defineProps({
  updateWordCount: {
    type: Function,
    required: true
  }
});

// 状态管理
const allWords = ref([]);
window.allWords = allWords;
const masteredWords = ref([]);
const multiMeaningWords = ref([]);
const difficultWords = ref([]);
const currentTab = ref('all');
const sortMethods = ref({
    all: 'import',
    mastered: 'addTime',
    multiMeaning: 'addTime',
    difficult: 'addTime'
});
const isDarkTheme = ref(false);
const searchQuery = ref('');

// 标签页配置
const tabs = [
    { id: 'all', name: '全部' },
    { id: 'mastered', name: '熟记' },
    { id: 'multiMeaning', name: '多义' },
    { id: 'difficult', name: '难记' }
];

// 排序选项
const sortOptions = [
    { value: 'alphabet', label: '字母' },
    { value: 'import', label: 'ID' },
    { value: 'addTime', label: '时间' },
    { value: 'random', label: '随机' }
];

// 从后端加载最新数据1.0
const loadDataFromBackend = async () => {
  try {
    // 调用Flask后端API
    const response = await fetch('http://localhost:5000/api/words');
    
    if (!response.ok) {
      throw new Error(`加载失败: ${response.statusText}`);
    }
    
    const data = await response.json();

    // 初始化数据（确保结构正确）
    allWords.value = data.allWords || [];
    masteredWords.value = data.masteredWords || [];
    multiMeaningWords.value = data.multiMeaningWords || [];
    difficultWords.value = data.difficultWords || [];
    
    console.log('数据加载成功');
  } catch (err) {
    console.error('加载数据失败:', err);
    alert('加载数据失败，请在PyCharm中启动服务器！');
    // 可选：加载失败时使用默认数据
    allWords.value = [
    //   { id: 1, word: 'example', meaning: '例子', isBlurred: false, note: '' }
    ];
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadDataFromBackend();
});

// 保存数据到后端1.0
const saveToBackend = async () => {
  // 收集当前所有状态数据
  const state = {
    allWords: allWords.value,
    masteredWords: masteredWords.value,
    multiMeaningWords: multiMeaningWords.value,
    difficultWords: difficultWords.value,
    sortMethods: sortMethods.value
  };

  try {
    const response = await fetch('http://localhost:5000/api/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state), // 转换为JSON字符串
    });

    if (!response.ok) {
      throw new Error(`保存失败: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('数据保存成功:', result.message);
  } catch (err) {
    console.error('保存数据失败:', err);
  }
};

// 防抖处理：避免频繁操作导致多次请求（300ms内合并）
const debouncedSave = debounce(saveToBackend, 1000);

// 添加模糊切换按钮
const toggleBlurAll = () => {
    let currentWords;
    switch (currentTab.value) {
        case 'mastered':
            currentWords = masteredWords.value;
            break;
        case 'multiMeaning':
            currentWords = multiMeaningWords.value;
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
    
    debouncedSave();
};

// 用于强制重新计算随机排序的时间戳
const randomSeed = ref(Date.now());

// 计算当前标签页中的单词是否大多数处于模糊状态
const isCurrentTabMostlyBlurred = computed(() => {
    let words;
    switch (currentTab.value) {
        case 'mastered':
            words = masteredWords.value;
            break;
        case 'multiMeaning':
            words = multiMeaningWords.value;
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

// 计算当前显示的单词列表
const currentWords = computed(() => {
    // 确保所有依赖的响应式数据都被正确追踪
    const tab = currentTab.value;
    const query = searchQuery.value.trim().toLowerCase();
    const sortMethod = sortMethods.value[tab];
    const seed = randomSeed.value;

    // 根据当前标签页选择单词列表
    let words;
    switch (tab) {
        case 'mastered':
            words = [...masteredWords.value];
            break;
        case 'multiMeaning':
            words = [...multiMeaningWords.value];
            break;
        case 'difficult':
            words = [...difficultWords.value];
            break;
        default:
            words = [...allWords.value];
    }

    // 应用搜索过滤
    if (query) {
        words = words.filter(word => 
            word.word.toLowerCase().includes(query) || 
            (word.meaning && word.meaning.toLowerCase().includes(query))
        );
    }
    
    // 应用排序
    switch (sortMethod) {
        case 'import':
            return words.sort((a, b) => a.id - b.id);
        case 'alphabet':
            return words.sort((a, b) => a.word.localeCompare(b.word));
        case 'addTime':
            // 按添加时间排序：有时间戳的在前，按时间戳降序；没有时间戳的在后，按ID排序
            return words.sort((a, b) => {
                const aTime = a.addedToCategory || 0;
                const bTime = b.addedToCategory || 0;
                
                // 如果都有时间戳，按时间戳降序（新的在前）
                if (aTime && bTime) {
                    return bTime - aTime;
                }
                // 如果只有a有时间戳，a在前
                if (aTime && !bTime) {
                    return -1;
                }
                // 如果只有b有时间戳，b在前
                if (!aTime && bTime) {
                    return 1;
                }
                // 如果都没有时间戳，按ID排序
                return a.id - b.id;
            });
        case 'random':
            // 使用Fisher-Yates洗牌算法进行随机排序
            for (let i = words.length - 1; i > 0; i--) {
                const j = Math.floor((Math.random() * seed) % (i + 1));
                [words[i], words[j]] = [words[j], words[i]];
            }
            return words;
        default:
            return words;
    }
    
});

// 切换单个单词的模糊状态
const toggleWordBlur = (word) => {
    // 直接切换单词的模糊状态
    word.isBlurred = !word.isBlurred;
    
    debouncedSave();
};

// 移动单词到不同标签页
const moveWord = (word, target) => {
    const removeFromArray = (arr, id) => {
        const index = arr.findIndex(w => w.id === id);
        if (index !== -1) {
        return arr.splice(index, 1)[0];
        }
        return null;
    };

    let sourceArray;
    let targetArray;

    switch (currentTab.value) {
        case 'all':
            sourceArray = allWords.value;
            if (target === 'mastered') {
                targetArray = masteredWords.value;
            } else if (target === 'multiMeaning') {
                targetArray = multiMeaningWords.value;
            } else {
                targetArray = difficultWords.value;
            }
            break;
        case 'mastered':
            sourceArray = masteredWords.value;
            if (target === 'difficult') {
                targetArray = difficultWords.value;
            } else if (target === 'multiMeaning') {
                targetArray = multiMeaningWords.value;
            } else {
                targetArray = allWords.value;
            }
            break;
        case 'multiMeaning':
            sourceArray = multiMeaningWords.value;
            if (target === 'mastered') {
                targetArray = masteredWords.value;
            } else if (target === 'difficult') {
                targetArray = difficultWords.value;
            } else {
                targetArray = allWords.value;
            }
            break;
        case 'difficult':
            sourceArray = difficultWords.value;
            if (target === 'mastered') {
                targetArray = masteredWords.value;
            } else if (target === 'multiMeaning') {
                targetArray = multiMeaningWords.value;
            } else {
                targetArray = allWords.value;
            }
            break;
    }

    const movedWord = removeFromArray(sourceArray, word.id);
    if (movedWord) {
        const updatedWord = {
            ...movedWord,
            isBlurred: movedWord.isBlurred
        };
        
        // 如果是从"全部"移动到其他分类，添加时间戳
        if (currentTab.value === 'all' && target !== 'all') {
            updatedWord.addedToCategory = Date.now();
        }
        // 如果是从其他分类移回"全部"，清除时间戳
        else if (currentTab.value !== 'all' && target === 'all') {
            delete updatedWord.addedToCategory;
        }
        // 如果是在分类之间移动（比如从熟记移动到难记或多义），更新时间戳
        else if (currentTab.value !== 'all' && target !== 'all') {
            updatedWord.addedToCategory = Date.now();
        }
        
        // 根据是否有时间戳决定插入位置
        if (updatedWord.addedToCategory && target !== 'all') {
            // 有时间戳的插入到开头（最新的在最上面）
            targetArray.unshift(updatedWord);
        } else {
            // 没有时间戳的添加到末尾
            targetArray.push(updatedWord);
        }
    }
    
    debouncedSave();
};

// 处理排序变化
const handleSort = () => {
    // 如果是随机排序，更新随机种子
    if (sortMethods.value[currentTab.value] === 'random') {
        randomSeed.value = Date.now();
    }

    debouncedSave();
};

// 监听当前标签页单词数量变化
watch(
    currentWords,
    (newWords) => {
        // console.log('currentWords changed, new length:', newWords.length); // 添加日志
        if (props.updateWordCount) {
        props.updateWordCount(newWords.length);
        } else {
        //   console.warn('updateWordCount prop is not available'); // 添加警告日志
        }
    },
    { 
        immediate: true, // 立即执行
        deep: true // 深度监听
    }
);

// 监听单词数组的深层变化（包括note修改）
// 替换原有的watch，只监听note字段变化
watch(
  () => [
    // 只提取所有单词的note字段组成依赖数组
    ...allWords.value.map(w => w.note),
    ...masteredWords.value.map(w => w.note),
    ...multiMeaningWords.value.map(w => w.note),
    ...difficultWords.value.map(w => w.note)
  ],
  () => {
    debouncedSave();
  },
  { deep: false } // 无需深层监听，因为依赖数组已直接关联note
);

// 导入组件更新父组件数据
const handleImport = (data) => {
    allWords.value = data.allWords;
    masteredWords.value = data.masteredWords;
    multiMeaningWords.value = data.multiMeaningWords || [];
    difficultWords.value = data.difficultWords;
};

// // 处理备注输入事件
// const handleNoteInput = (word) => {
//   // 找到单词在数组中的位置并更新（确保响应式生效）
//   const updateWordInArray = (array) => {
//     const index = array.findIndex(w => w.id === word.id);
//     if (index !== -1) {
//       array[index] = { ...word };  // 强制更新响应式数据
//     }
//   };

//   // 检查单词属于哪个数组并更新
//   updateWordInArray(allWords.value);
//   updateWordInArray(masteredWords.value);
//   updateWordInArray(difficultWords.value);

//   // 触发保存
//   debouncedSave();
// };

</script>

<style>
/* 现代滚动条样式 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--page-bg-color);
}

::-webkit-scrollbar-thumb {
    background: var(--primary-light);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--button-text-color);
}
a {
    text-decoration: none;
    color: var(--button-text-color);
}
</style>

<style scoped>

.word-table-container {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: var(--page-bg-color);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
  align-items: center;
  text-align: center;
  height: 40px;
  padding: 5px;
}

.header-cell {
  /* 设置flex比例，总和为8（2+3+2+1） */
  /* 单词列占2份 */
  &:nth-child(1) {
    flex: 1.5;
  }
  /* 释义列占3份（最宽，因为内容可能最多） */
  &:nth-child(2) {
    flex: 3.5;
  }
  /* 备注列占2份 */
  &:nth-child(3) {
    flex: 3.5;
  }
  /* 操作列占1.5份（增加宽度以适应三个按钮） */
  &:nth-child(4) {
    flex: 1.5;
  }
}

.header-cell, .word-cell, .meaning-cell, .note-cell, .action-cell {
  /* padding: 12px 16px; */
  box-sizing: border-box;
    /* flex: 1; */
}

.header-cell {
  font-weight: bold;
  border-right: 1px solid #e0e0e0;
}

.header-cell:last-child {
  border-right: none;
}

.virtual-scroller {
  height: 800px; /* 固定滚动区域高度 */
  width: 100%;
}


.word-row {
  display: flex;
  border: 1px solid var(--border-color);
  height: 60px; /* 与item-size保持一致 */
  align-items: center;
  text-align: center;
}

.word-cell {
    flex: 1.5;
}

.meaning-cell {
    flex: 3.5;
}

.note-cell {
    flex: 3.5;
}

.action-cell {
    flex: 1.5;
}


.word-row:last-child {
  border-bottom: none;
}

.blurred {
  color: transparent;
  text-shadow: 0 0 8px #888;
}

.blurred:hover {
  cursor: pointer;
}

.note-input {
  width: 100%;
  padding: 6px 8px;
  background-color: var(--button-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-sizing: border-box;
  color: var(--button-text-color); 
  caret-color: var(--text-color); /* 输入框中光标颜色 */
}

.note-input::placeholder {
  color: var(--text-color); /* 输入框中提示文本颜色 */
}



.action-btn {
  margin: 0 4px;
  padding: 4px 8px;
  border: none;
  background: var(--button-bg-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #888;
}

span {
    font-size: 9.1px;
}

/* 控制区域样式 */
.controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.sort-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.search-control {
    caret-color: var(--text-color);
}

.search-input::placeholder {
    color: var(--text-color);
}


/* 模糊切换按钮 */
.blur-toggle-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background-color: var(--button-bg-color);
    color: var(--button-text-color);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1.05rem;
    white-space: nowrap;
}

.blur-toggle-btn:hover {
    background-color: var(--primary-hover-color);
    color: #ffffff;
}

.vocabulary-app {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 65px;
    background-color: var(--page-bg-color);
}

.word-table {
    margin-top: 10px;
    background-color: var(--table-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 现代简约导航栏 */
.nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-xl);
    background: linear-gradient(
        to right,
        var(--nav-bg-color),
        color-mix(in srgb, var(--nav-bg-color), white 10%)
    );
    box-shadow: var(--shadow-md);
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    }

/* 现代卡片式单词表 */
.word-table {
    background-color: var(--table-bg-color);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
}

.word-table:hover {
    box-shadow: var(--shadow-md);
}

/* 现代按钮样式 */
button {
    background-color: var(--button-bg-color);
    color: var(--button-text-color);
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 1.05rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

button:hover {
    background-color: var(--primary-hover-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -2px rgba(0, 0, 0, 0.1);
    color: #ffffff;
}

/* 现代输入框 */
input, select {
    background-color: var(--button-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

input:focus, select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color), transparent 70%);
}

/* 导航栏内容容器 */
.nav-bar-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    flex-wrap: wrap;
    gap: 10px;
}

/* 现代标签页 */
.tabs {
    display: flex;
    gap: 8px;
    padding: 10px;
    background-color: var(--tab-bg-color);
    border-radius: 10px;
    font-size: 40px;
    flex-shrink: 0;
}

.tabs button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background-color: transparent;
    color: var(--text-light);
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    box-shadow: none;
    white-space: nowrap;
}

/* 激活状态的标签页样式 */
.tabs button.active {
    background-color: var(--primary-color, #007bff);
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
    transform: translateY(-1px);
}

/* 标签页悬浮状态 */
.tabs button:hover:not(.active) {
    background-color: color-mix(in srgb, var(--primary-color, #007bff), transparent 85%);
    color: var(--primary-color, #007bff);
}

.controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.theme-toggle {
    padding: 8px;
    border: none;
    border-radius: 4px;
    background-color: transparent;
    cursor: pointer;
    font-size: 1.2em;
}

/* 列宽设置 - 1:1:3:1 比例 */
th:nth-child(1), td:nth-child(1) { width: 15%; } /* 单词列 */
th:nth-child(2), td:nth-child(2) { width: 35%; } /* 释义列 */
th:nth-child(3), td:nth-child(3) { width: 40%; }    /* 备注列 */
/* 操作列样式 */
th:nth-child(4), td:nth-child(4) { 
    width: 10%;
    text-align: center;
}

/* 确保按钮组居中 */
td:nth-child(4) .actions {
    justify-content: center;
    margin: 0 auto;
}

th {
    background-color: var(--button-bg-color);
    color: var(--text-color);
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    text-align: center;
}

td {
    padding: 10px;
    color: var(--text-color);
    border-bottom: 1px solid var(--border-color);
    transition: all 0.2s ease;
    text-align: center;
    background-color: var(--table-bg-color); /* 确保背景色 */
}

/* 确保备注输入框文字可见 */
td input {
    color: var(--text-color);
}

/* 行悬浮效果 */
    tr:hover td {
    background-color: color-mix(in srgb, var(--table-bg-color), var(--primary-color) 3%);
}

/* 美化操作按钮 */
.actions button {
    padding: 6px 12px;
    margin: 0 4px;
    border-radius: 6px;
    font-size: 1rem;
    color: var(--button-text-color);
    background-color: transparent;
    border: 1px solid var(--border-color);
}

.actions button:hover {
    color: var(--primary-color);
    border-color: var(--primary-color);
    background-color: color-mix(in srgb, var(--primary-color), transparent 90%);
}

/* 备注输入框样式 */
td input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--input-bg-color);
    color: var(--text-color);
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

td input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color), transparent 90%);
}
/* 模糊效果优化 */
.blurred {
    filter: blur(5px);  /* 减小模糊半径 */
    cursor: pointer;
    transition: filter 0.1s ease;
    user-select: none;
}

/* 下拉菜单美化 */
.custom-select {
    position: relative;
    min-width: 80px;
}

td input {
    width: 100%;
    padding: 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
}

.actions {
    justify-content: center;
    gap: 8px;
    width: 100%;
}

.actions button {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--button-bg-color);
    color: var(--text-color);
}

.import-export-buttons {
    display: flex;
    gap: 8px;
}

.blurred {
    filter: blur(5px);
    transition: filter 0.3s;
}

/* 导航栏样式优化 */
.nav-bar {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px var(--nav-shadow-color);
    transition: background-color 0.3s, box-shadow 0.3s;
}

.search-btn{
    margin-left: 10px;
}

/* 响应式设计 - 小屏幕优化 */
@media (max-width: 1024px) {
    .nav-bar-content {
        flex-direction: column;
        gap: 15px;
        padding: 15px 10px;
    }
    
    .tabs {
        order: 1;
        width: 100%;
        justify-content: center;
    }
    
    .controls {
        order: 2;
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .vocabulary-app {
        padding-top: 120px; /* 增加顶部间距适应更高的导航栏 */
    }
}

@media (max-width: 768px) {
    .nav-bar-content {
        padding: 10px 5px;
    }
    
    .tabs button {
        padding: 8px 12px;
        font-size: 0.9rem;
    }
    
    .controls {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
    
    .import-export-buttons,
    .sort-controls,
    .search-control {
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .vocabulary-app {
        padding-top: 160px; /* 进一步增加顶部间距 */
        padding-left: 10px;
        padding-right: 10px;
    }
    
    .word-table-container {
        overflow-x: auto; /* 添加水平滚动 */
        min-width: 600px; /* 设置最小宽度 */
    }
    
    .action-btn {
        margin: 0 1px;
        padding: 2px 4px;
        font-size: 0.8rem;
    }
    
    .note-input {
        padding: 4px 6px;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .tabs {
        gap: 4px;
        padding: 8px;
    }
    
    .tabs button {
        padding: 6px 8px;
        font-size: 0.8rem;
    }
    
    .action-btn {
        margin: 0;
        padding: 2px 3px;
        font-size: 0.7rem;
    }
    
    .word-row {
        height: 50px;
    }
    
    .virtual-scroller {
        height: 600px;
    }
    
    .vocabulary-app {
        padding-top: 180px;
    }
}
</style>
