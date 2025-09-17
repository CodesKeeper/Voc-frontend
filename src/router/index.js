import { createRouter, createWebHistory } from 'vue-router'
import VocabularyApp from '../components/VocabularyApp.vue'
import Convet from '../components/Convet.vue'

const routes = [
    {
        path: '/',
        name: 'Vocabulary',
        component: VocabularyApp
    },
    {
        path: '/Convert',
        name: 'Convert',
        component: Convet
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router