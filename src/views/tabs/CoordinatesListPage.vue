<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 2</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
        </ion-toolbar>
      </ion-header>

      <div>
        <table v-if="source">
          <tbody>
            <tr>
              <th>Name</th>
              <th>Latitude</th>
              <th>Longitude</th>
            </tr>
            <tr v-for="item in source.getFeatures()" :key="item.getId()">
              <td>{{ item.get('nr') }}</td>
              <td>{{ (item.getGeometry() as Point)?.getCoordinates()[0] }}</td>
              <td>{{ (item.getGeometry() as Point)?.getCoordinates()[1] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton } from '@ionic/vue';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import { Feature } from 'ol';

defineProps({
  source: VectorSource<Feature<Point>>
})
</script>
