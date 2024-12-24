<template>
  <ion-menu content-id="main-content" side="end">
    <ion-header>
      <ion-toolbar>
        <ion-title>Menu Content</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button @click="optionSelected('theodolit')">
          <ion-label>Theodolit</ion-label>
        </ion-item>
        <ion-item button @click="optionSelected('winkelprisma')">
          <ion-label>Winkelprisma</ion-label>
        </ion-item>
        <ion-item button @click="optionSelected('nivellier')">
          <ion-label>Nivellier</ion-label>
        </ion-item>
        <ion-item button nav="/tabs/tab3" routerDirection="root">
          <ion-label>Map</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
  <ion-page id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="#" @click="optionSelected('')" v-if="selected"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>
      <SelectMeasureMethod v-if="!selected" @select="optionSelected" />
      <Theodolit v-if="selected == 'theodolit'" v-bind:source="source" />
      <Winkelprisma v-if="selected == 'winkelprisma'" v-bind:source="source" />
      <Nivellier v-if="selected == 'nivellier'" v-bind:source="source" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonMenu, IonMenuButton } from '@ionic/vue';
import SelectMeasureMethod from '@/views/SelectMeasureMethod.vue';
import { ref } from 'vue';
import VectorSource from 'ol/source/Vector';
import Theodolit from '@/views/Theodolit.vue';
import Winkelprisma from '@/views/Winkelprisma.vue';
import Nivellier from '@/views/Nivellier.vue';
import { Point } from 'ol/geom';
import { Feature } from 'ol';

let selected = ref<string>('');
let title = ref<string>('Tab 1');

const optionSelected = (option: string) => {
  selected.value = option;
  title.value = option.charAt(0).toUpperCase() + option.slice(1);
  if (option == '') {
    title.value = 'Tab 1';
  }
}

defineProps({
  source: VectorSource<Feature<Point>>
})
</script>


