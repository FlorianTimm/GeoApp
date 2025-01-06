<template>

  <ion-page>
    <ion-menu content-id="main-content" side="start">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu Content</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item button @click="exportJSON()">
            <ion-label>Export JSON</ion-label>
          </ion-item>
          <ion-item button @click="importJSON()">
            <ion-label>Import JSON</ion-label>
          </ion-item>
          <ion-item button href="/settings">
            <ion-label>Settings</ion-label>
          </ion-item>
          <ion-item button @click="resetMeasures()">
            <ion-label style="color:red">Delete data</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-split-pane content-id="main-content" ref="splitPane">
      <ion-content id="main-content">
        <ion-tabs>
          <ion-router-outlet></ion-router-outlet>
          <ion-tab-bar slot="bottom">
            <ion-tab-button tab="tab1" href="/tabs/tab1">
              <ion-icon aria-hidden="true" :icon="triangle" />
              <ion-label>Measurement</ion-label>
            </ion-tab-button>

            <ion-tab-button tab="tab2" href="/tabs/tab2">
              <ion-icon aria-hidden="true" :icon="reader" />
              <ion-label>Coordinates</ion-label>
            </ion-tab-button>
            <ion-tab-button tab="tab3" href="/tabs/tab3" v-if="!store.sideMap">
              <ion-icon aria-hidden="true" :icon="map" />
              <ion-label>Map</ion-label>
            </ion-tab-button>
          </ion-tab-bar>
        </ion-tabs>
      </ion-content>
      <ion-menu side=end content-id="main.content">
        <MapPage></MapPage>
      </ion-menu>
    </ion-split-pane>

  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonSplitPane, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet, IonMenu, IonTitle, IonContent, IonToolbar, IonHeader, IonItem, IonList } from '@ionic/vue';
import { triangle, map, reader } from 'ionicons/icons';
import { alertController } from '@ionic/vue';
import { useMeasureStore, useStore } from '@/store';
import MapPage from '@/views/tabs/MapPage.vue';
import { onMounted, ref, watch } from 'vue';
import router from '@/router';

const store = useStore();

onMounted(() => {
  const splitPane = document.querySelector('ion-split-pane');
  console.log(splitPane);
  if (splitPane) {
    splitPane.addEventListener('ion-split-pane-visible', (event: Event) => {
      const e = event as CustomEvent;
      store.sideMap = e.detail.visible;
      if (store.sideMap && router.currentRoute.value.path === '/tabs/tab3') {
        router.push('/tabs/tab1');
      }
    });
  }
});




const resetMeasures = () => {
  alertController.create({
    header: 'Delete data',
    message: 'Do you really want to delete all data?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'DELETE',
        handler: (val) => {
          const measureStore = useMeasureStore();
          measureStore.truncate();
        }
      }
    ],
  }).then(alert => {
    alert.present();
  });
};

const exportJSON = () => {
  const measureStore = useMeasureStore();
  const data = measureStore.export();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'measurements.json';
  a.click();
  URL.revokeObjectURL(url);
};

const importJSON = () => {
  if (useMeasureStore().getMeasurements().length > 0
    || Object.keys(useMeasureStore().getPoints()).length > 0) {
    alertController.create({
      header: 'Import data',
      message: 'Do you really want to import data? This will delete all existing data!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Export first, then Import',
          handler: () => {
            exportJSON();
            importData();
          }
        },
        {
          text: 'Import, delete existing data',
          handler: () => {
            importData();
          }
        }
      ],
    }).then(alert => {
      alert.present();
    });
  } else {
    importData();
  }
}
const importData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const measureStore = useMeasureStore();
        measureStore.import(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };
  input.click();
};
</script>

<style scoped>
ion-split-pane {
  --side-width: 50%;
  --side-min-width: 40%;
  --side-max-width: 70%;
}
</style>
