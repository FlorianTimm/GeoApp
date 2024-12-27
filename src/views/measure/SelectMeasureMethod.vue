<template>
    <ion-list>
        <ion-item>
            <ion-label>Theodolite</ion-label>
            <ion-button id="theo_setup">Setup</ion-button>
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
        <ion-item>
            <span v-for="measure in measureStore.getMeasurements()">{{ measure.type }}</span>
        </ion-item>
    </ion-list>
    <ion-action-sheet trigger="theo_setup" header="Setup Theodolite" :buttons="theoSetupOptions"></ion-action-sheet>

</template>


<script setup lang="ts">
import { useMeasureStore, useStore } from '@/store';
import { IonList, IonItem, IonLabel, IonButton, IonActionSheet } from '@ionic/vue';

const theoSetupOptions = [
    {
        text: 'on Point',
        handler: () => {
            store.setMeasureMethod('theo_onpoint')
        }
    },
    {
        text: 'Resection',
        handler: () => {
            store.setMeasureMethod('theo_resection')
        }
    },
    {
        text: 'Free Station',
        handler: () => {
            store.setMeasureMethod('theo_freestation')
        }
    }
]

const measureStore = useMeasureStore();
const store = useStore();

</script>