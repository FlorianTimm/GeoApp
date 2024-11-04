<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Map</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>

      <Map :source=source />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import Map from '@/components/Map.vue';
import VectorSource from 'ol/source/Vector';

export default {
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    Map,
  },
  props: {
    source: VectorSource,
  },
  mounted() {
    console.log(this.source);
  },
};

</script>
