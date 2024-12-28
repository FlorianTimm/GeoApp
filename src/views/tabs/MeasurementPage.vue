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
      <Theodolit v-if="store.getMeasureMethod() == 'theo_measure'" />
      <TheoResection v-if="store.getMeasureMethod() == 'theo_resection'" />
      <Winkelprisma v-if="store.getMeasureMethod() == 'prism'" />
      <Nivellier v-if="store.getMeasureMethod() == 'level'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonMenuButton } from '@ionic/vue';
import SelectMeasureMethod from '@/views/measure/SelectMeasureMethod.vue';
import Theodolit from '@/views/measure/theo/Theodolit.vue';
import TheoResection from '@/views/measure/theo/TheoResection.vue';
import Winkelprisma from '@/views/measure/Winkelprisma.vue';
import Nivellier from '@/views/measure/Nivellier.vue';
import { useStore, MeasureMethodType } from '@/store';

type TitleMap = Record<MeasureMethodType, string>;

const title: TitleMap = {
  '': 'Select Method',
  theo_measure: 'Measurement',
  theo_freestation: 'Free Station',
  theo_resection: 'Resection',
  theo_onpoint: 'Setup on Point',
  theo_stakeout: 'Stakeout',
  level: 'Level',
  prism: 'Prism',
};

const store = useStore();
</script>
