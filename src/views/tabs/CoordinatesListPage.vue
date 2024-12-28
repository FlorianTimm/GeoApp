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
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="addPoint()">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useMeasureStore } from '@/store';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons, IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { add } from 'ionicons/icons';
import { alertController } from '@ionic/vue';
import { Point } from '@/types/Point';

const store = useMeasureStore();

const addPoint = () => {
  alertController.create({
    header: 'Neuer Punkt',
    message: 'Bitte geben Sie die Informationen für den neuen Punkt ein.',
    inputs: [
      {
        name: 'nr',
        type: 'number',
        placeholder: 'Punktnummer'
      },
      {
        name: 'description',
        type: 'text',
        placeholder: 'Beschreibung'
      },
      {
        name: 'lat',
        type: 'number',
        placeholder: 'Latitude'
      },
      {
        name: 'lon',
        type: 'number',
        placeholder: 'Longitude'
      }
    ],
    buttons: [
      {
        text: 'Abbrechen',
        role: 'cancel'
      },
      {
        text: 'Speichern',
        handler: (val) => {
          if (val.nr && !(val.nr in store.points)) {
            let p = new Point(val.nr, val.description)
            if (val.local) {
              //TODO: get current position
            }
            if (val.lat && val.lon) {
              p.addCoordinate('EPSG:3857', val.lat, val.lon);
            }
            store.addPoint(p);
            return true;
          }
          alertController.create({
            header: 'Fehler',
            message: 'Punktnummer leer oder bereits vergeben.',
            buttons: ['OK']
          }).then(alert => {
            alert.present();
          });
          return false;
        }
      }
    ],
  }).then(alert => {
    alert.present();
  });
};

</script>
