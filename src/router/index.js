import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue')
    },
    {
      path: '/image-generation',
      name: 'image-generation',
      component: () => import('../views/ImageGenerationView.vue')
    },
    {
      path: '/image-recognition',
      name: 'image-recognition',
      component: () => import('../views/ImageRecognitionView.vue')
    }
  ]
})

export default router
