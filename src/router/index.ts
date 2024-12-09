import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import VectorSource from "ol/source/Vector";
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

let source = new VectorSource();
let f = new Feature(new Point([10.0, 53.5]));
f.set('nr', '100');
f.set('description', 'This is my point');
source.addFeature(f);

let props = {
  source: source
}

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
        component: () => import('@/views/Tab1Page.vue'),
        props: props
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue'),
        props: props
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue'),
        props: props
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
