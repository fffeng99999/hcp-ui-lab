import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/experiments',
    children: [
      {
        path: 'experiments',
        name: 'Experiments',
        component: () => import('@/views/Experiments/index.vue'),
        meta: { title: '实验列表', icon: '🧪' }
      },
      {
        path: 'experiments/generate',
        name: 'ExperimentGenerate',
        component: () => import('@/views/Experiments/Generate.vue'),
        meta: { title: '实验生成', icon: '✨' }
      },
      {
        path: 'experiments/:id/config',
        name: 'ExperimentConfig',
        component: () => import('@/views/Experiments/Config.vue'),
        meta: { title: '实验配置', icon: '⚙️' }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/Tasks/index.vue'),
        meta: { title: '任务管理', icon: '📋' }
      },
      {
        path: 'tasks/:id/results',
        name: 'TaskResults',
        component: () => import('@/views/Experiments/Result.vue'),
        meta: { title: '实验结果', icon: '📊' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/System/NotFound.vue'),
    meta: { title: 'Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} - HCP Lab` : 'HCP Lab'
})

export default router
