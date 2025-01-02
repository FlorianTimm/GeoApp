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
                <ion-button @click="editPoint(item)">
                  <ion-icon :icon="pencil"></ion-icon>
                </ion-button>
                <ion-button @click="removePoint(item.nr)">
                  <ion-icon :icon="trash"></ion-icon>
                </ion-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button id="new_point">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <PointDialog ref="point_dialog" trigger="new_point" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useMeasureStore } from '@/store';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons, IonFab, IonFabButton, IonIcon, IonButton } from '@ionic/vue';
import { alertController } from '@ionic/vue';
import { trash, pencil, add } from 'ionicons/icons';
import { format } from '@/utils';
import PointDialog from '@/components/PointDialog.vue';
import { addIcons } from 'ionicons';
import { Point } from '@/types/Point';
import { ref } from 'vue';

addIcons({
  "add": add,
  "trash": trash,
  "pencil": pencil,
});

const measureStore = useMeasureStore();

const point_dialog = ref<InstanceType<typeof PointDialog>>()

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

const editPoint = (point: Point) => {
  console.log('edit point', point);
  point_dialog.value?.editPoint(point);
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