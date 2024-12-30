<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Coordinates</ion-title>
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
              <th>Easting</th>
              <th>Northing</th>
              <th>Height</th>
              <th></th>
            </tr>
            <tr v-for="item in measureStore.points" :key="item.nr">
              <td>{{ item.nr }}</td>
              <td>{{ format(item.getCoordinateComponents('x')) }}</td>
              <td>{{ format(item.getCoordinateComponents('y')) }}</td>
              <td>{{ format(item.getCoordinateComponents('z')) }}</td>
              <td>
                <ion-button @click="removePoint(item.nr)">
                  <ion-icon :icon="trash"></ion-icon>
                </ion-button>
              </td>
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
import { useMeasureStore, useSettingStore, useStore } from '@/store';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons, IonFab, IonFabButton, IonIcon, IonButton } from '@ionic/vue';
import { add } from 'ionicons/icons';
import { alertController } from '@ionic/vue';
import { Point } from '@/types/Point';
import { trash } from 'ionicons/icons';
import { format } from '@/utils';


const measureStore = useMeasureStore();
const settingStore = useSettingStore();
const store = useStore();

const addPoint = () => {
  const pos = store.getPosition()
  const acc = store.getAccuracy()
  console.log(pos, acc)
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
        name: 'easting',
        type: 'number',
        placeholder: pos ? pos[0].toFixed(3) : 'Easting',
        label: 'Easting'
      },
      {
        name: 'northing',
        type: 'number',
        placeholder: pos ? pos[1].toFixed(3) : 'Northing',
        label: 'Northing'
      },
      {
        name: 'height',
        type: 'number',
        placeholder: pos && 2 in pos ? pos[2].toFixed(3) : 'Height',
        label: 'Height'
      },
      {
        name: 'local',
        type: 'checkbox',
        label: 'Aktuelle Position verwenden'
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
          if (val.nr && !(val.nr in measureStore.points)) {
            let p = new Point(val.nr, val.description)
            if (val.local && pos) {
              p.addCoordinate({
                source: 'gps',
                epsg: settingStore.getEpsg(),
                x: pos[0],
                y: pos[1],
                z: pos[2],
                accuracy: acc ?? 5
              });
            }
            if (val.easting && val.northing) {
              p.addCoordinate({
                source: 'manual',
                epsg: settingStore.getEpsg(),
                x: parseFloat(val.easting),
                y: parseFloat(val.northing),
                z: parseFloat(val.height),
                accuracy: 0
              });
            }
            measureStore.addPoint(p);
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


const removePoint = (nr: string) => {
  alertController.create({
    header: 'Delete Point',
    message: 'Do you really want to delete point ' + nr + '?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'DELETE',
        handler: () => {
          if (!measureStore.removePoint(nr)) {
            alertController.create({
              header: 'Error',
              message: 'Point is in use by measurements.',
              buttons: ['OK']
            }).then(alert => {
              alert.present();
            });
          }
        }
      }
    ],
  }).then(alert => {
    alert.present();
  });
}
</script>

<style scoped>
table {
  width: 100%;
  border: 1px solid black;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 8px;
  text-align: center;
}
</style>