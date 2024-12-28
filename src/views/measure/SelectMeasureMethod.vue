<template>
    <ion-list>
        <ion-item>
            <ion-label>Theodolite</ion-label>
            <ion-button @click="store.setMeasureMethod('theo_setup')">Setup</ion-button>
            <ion-button @click="store.setMeasureMethod('theo_measure')"
                v-bind:disabled="!measureStore.isTheoSetup()">Measure</ion-button>
            <ion-button @click="store.setMeasureMethod('theo_stakeout')"
                v-bind:disabled="!measureStore.isTheoSetup()">Stake
                out</ion-button>
        </ion-item>
        <ion-item>
            <ion-label>Nivellier</ion-label>
            <ion-button @click="store.setMeasureMethod('level')">Nivellier</ion-button>
        </ion-item>
        <ion-item>
            <ion-label>Maßband/Winkelprisma</ion-label>
            <ion-button @click="store.setMeasureMethod('prism')">Winkelprisma</ion-button>
        </ion-item>
        <ion-item v-for="measure in measureStore.getMeasurements()">
            <ion-label>{{ measure.type }}</ion-label>
        </ion-item>
    </ion-list>
</template>


<script setup lang="ts">
import { useMeasureStore, useStore } from '@/store';
import { IonList, IonItem, IonLabel, IonButton, IonActionSheet } from '@ionic/vue';

const measureStore = useMeasureStore();
const store = useStore();

</script>