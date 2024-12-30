<template>
  <ion-page>
    <ion-menu content-id="map-content" menuId="mapMenu" side="start">
      <ion-header>
        <ion-toolbar>
          <ion-title>Map Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item>
            <ion-toggle v-model="settingStore.geolocation">Geolocation</ion-toggle>
          </ion-item>
          <ion-item>
            <ion-toggle v-model="settingStore.showMeasurements">Show measurements</ion-toggle>
          </ion-item>
          <ion-item button @click="map.zoomToExtent();">
            <ion-label>Zoom to extent</ion-label>
          </ion-item>
          <ion-item button @click="map.slideToLocation();">
            <ion-label>to last gps position</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="mapMenu"><ion-icon name="map-outline"></ion-icon></ion-menu-button>
        </ion-buttons>
        <ion-title>Map</ion-title>
        <ion-buttons slot="secondary">
          <ion-toggle v-model="settingStore.geolocation">Geolocation</ion-toggle>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" id="map-content">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>

      <Map ref="map" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons, IonToggle, IonMenu, IonList, IonItem, IonIcon, IonLabel } from '@ionic/vue';
import Map from '@/components/Map.vue';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { useSettingStore } from '@/store';
import { addIcons } from 'ionicons';
import { mapOutline } from 'ionicons/icons';
import { ref } from 'vue';

addIcons({
  "map-outline": mapOutline
});

defineProps({
  source: VectorSource<Feature<Point>>,
});

const settingStore = useSettingStore();
const map = ref()



</script>
