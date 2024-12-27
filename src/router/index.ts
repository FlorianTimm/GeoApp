import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/tabs/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/tabs/MeasurementPage.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/tabs/CoordinatesListPage.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/tabs/MapPage.vue')
      }
    ]
  },
  {
    path: '/settings',
    component: () => import('@/views/SettingsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
