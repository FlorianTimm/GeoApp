import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/tabs/TabsPage.vue';
import VectorSource from "ol/source/Vector";
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { reactive } from 'vue';

let source = reactive(new VectorSource());
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
        component: () => import('@/views/tabs/MeasurementPage.vue'),
        props: props
      },
      {
        path: 'tab2',
        component: () => import('@/views/tabs/CoordinatesListPage.vue'),
        props: props
      },
      {
        path: 'tab3',
        component: () => import('@/views/tabs/MapPage.vue'),
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
