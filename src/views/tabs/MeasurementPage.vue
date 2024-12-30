<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="#" @click="store.setMeasureMethod('')"
            v-if="store.getMeasureMethod() != ''"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title[store.getMeasureMethod()] }}</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>
      <SelectMeasureMethod v-if="store.getMeasureMethod() == ''" />
      <TheoMeasure v-if="store.getMeasureMethod() == 'theo_measure'" />
      <TheoSetup v-if="store.getMeasureMethod() == 'theo_setup'" />
      <TheoStakeOut v-if="store.getMeasureMethod() == 'theo_stakeout'" />
      <Prism v-if="store.getMeasureMethod() == 'prism'" />
      <Level v-if="store.getMeasureMethod() == 'level'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonMenuButton } from '@ionic/vue';
import SelectMeasureMethod from '@/views/measure/SelectMeasureMethod.vue';
import TheoSetup from '@/views/measure/theo/TheoSetup.vue';
import TheoMeasure from '../measure/theo/TheoMeasure.vue';
import TheoStakeOut from '@/views/measure/theo/TheoStakeOut.vue';
import Prism from '@/views/measure/Prism.vue';
import Level from '@/views/measure/Level.vue';
import { useStore, MeasureMethodType } from '@/store';

type TitleMap = Record<MeasureMethodType, string>;

const title: TitleMap = {
  '': 'Select Method',
  theo_measure: 'Measurement',
  theo_setup: 'Setup',
  theo_stakeout: 'Stakeout',
  level: 'Level',
  prism: 'Prism',
};

const store = useStore();
</script>
