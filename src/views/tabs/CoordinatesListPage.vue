<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Coordinates</ion-title>
        <ion-buttons slot="start">
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
        <ion-list>
          <ion-item v-for="item in measureStore.points" :key="item.nr">
            <ion-grid>
              <ion-row>
                <ion-col size="2">{{ item.nr }}</ion-col>
                <ion-col>
                  <ion-row v-if="item.getCoordinateComponents('x') !== null">
                    <ion-col>Y:</ion-col>
                    <ion-col class="right">{{ format(item.getCoordinateComponents('x')) }}</ion-col>
                  </ion-row>
                  <ion-row v-if="item.getCoordinateComponents('y') !== null">
                    <ion-col>X:</ion-col>
                    <ion-col class="right">{{ format(item.getCoordinateComponents('y')) }}</ion-col>
                  </ion-row>
                  <ion-row v-if="item.getCoordinateComponents('z') !== null">
                    <ion-col>Z:</ion-col>
                    <ion-col class="right">{{ format(item.getCoordinateComponents('z')) }}</ion-col>
                  </ion-row>
                </ion-col>
                <ion-col size="auto">
                  <ion-button @click="editPoint(item)">
                    <ion-icon :icon="pencil"></ion-icon>
                  </ion-button>
                  <ion-button @click="removePoint(item.nr)">
                    <ion-icon :icon="trash"></ion-icon>
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-item>
        </ion-list>
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
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonMenuButton, IonButtons, IonFab, IonFabButton, IonIcon, IonButton,
  IonGrid, IonRow, IonCol, IonList, IonItem
} from '@ionic/vue';
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
.right {
  text-align: right;
}
</style>