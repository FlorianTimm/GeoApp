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
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Latitude</th>
              <th>Longitude</th>
            </tr>
            <tr v-for="item in store.points" :key="item.nr">
              <td>{{ item.nr }}</td>
              <td>{{ item.getLat() }}</td>
              <td>{{ item.getLon() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useMeasureStore, Point } from '@/store';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons } from '@ionic/vue';

const store = useMeasureStore();


</script>
