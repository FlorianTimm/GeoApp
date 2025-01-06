<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Map</ion-title>
        <ion-buttons slot="end">
          <ion-toggle v-model="settingStore.geolocation">Geolocation</ion-toggle>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" id="map-content">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>

      <Map ref="map" v-model=addingPoints />
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="addPoint()" :color="addingPoints ? 'success' : 'light'">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-fab slot="fixed" vertical="bottom" horizontal="start">
        <ion-fab-button>
          <ion-icon :icon="mapOutline"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button :color="settingStore.geolocation ? 'success' : 'light'"
            @click="settingStore.geolocation = !settingStore.geolocation">
            <ion-icon :icon="locate"></ion-icon>
          </ion-fab-button>
          <ion-fab-button :color="settingStore.showMeasurements ? 'success' : 'light'"
            @click="settingStore.showMeasurements = !settingStore.showMeasurements">
            <ion-icon :icon="analytics"></ion-icon>
          </ion-fab-button>
          <ion-fab-button @click="zoomToExtent()">
            <ion-icon :icon="globe"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonToggle, IonIcon, IonFab, IonFabButton, actionSheetController, IonFabList } from '@ionic/vue';
import Map from '@/components/Map.vue';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { useSettingStore } from '@/store';
import { addIcons } from 'ionicons';
import { mapOutline, add, locate, analytics, globe } from 'ionicons/icons';
import { ref } from 'vue';


addIcons({
  "map-outline": mapOutline,
  "add": add,
});

defineProps({
  source: VectorSource<Feature<Point>>,
});

const settingStore = useSettingStore();
const map = ref()
const addingPoints = ref<boolean>(false);

const addPoint = () => {
  console.log('add point')
  addingPoints.value = !addingPoints.value;
}

const zoomToExtent = () => {
  map.value.zoomToExtent()
}

const slideToLocation = () => {
  map.value.slideToLocation()
}


</script>
