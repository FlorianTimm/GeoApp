<template>
    <ion-list>
        <ion-item>
            <ion-label>Theodolite</ion-label>
            <ion-button @click="store.setActiveMeasurement(); store.setMeasureMethod('theo_setup')">Setup</ion-button>
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
    </ion-list>
    <ion-title>Measurements</ion-title>
    <ion-list>
        <ion-item v-for="measure in measureStore.getMeasurements()">
            <ion-label v-bind:style="(store.getActiveMeasurement() == measure) ? 'color: black' : 'color: grey'">{{
                measure.getName()
                +
                ' ' +
                measure.getShortInfo() }}</ion-label>
            <ion-button @click="reactivateMeasure(measure)"><ion-icon name="hammer-outline"></ion-icon></ion-button>
            <ion-button @click="deleteMeasure(measure)"><ion-icon name="trash-outline"></ion-icon></ion-button>
        </ion-item>
    </ion-list>
</template>


<script setup lang="ts">
import { useMeasureStore, useStore } from '@/store';
import { IonList, IonItem, IonLabel, IonButton, IonIcon, IonTitle, alertController } from '@ionic/vue';
import { Measurement } from '@/types/Measurement';
import { addIcons } from 'ionicons';
import { hammerOutline, trashOutline } from 'ionicons/icons';

const measureStore = useMeasureStore();
const store = useStore();

addIcons({
    'hammer-outline': hammerOutline,
    'trash-outline': trashOutline
})


const reactivateMeasure = (measure: Measurement) => {
    console.log(measure);
    switch (measure.type) {
        case 'theodolite':
            store.setMeasureMethod('theo_setup');
            break;
        case 'level':
            store.setMeasureMethod('level');
            break;
        case 'prism':
            store.setMeasureMethod('prism');
            break;
    }
    store.setActiveMeasurement(measure);
}

const deleteMeasure = (measure: Measurement) => {
    alertController.create({
        header: 'Delete Measurement',
        message: 'Do you really want to delete this measurement ' + measure.getLongInfo() + '?',
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel'
            },
            {
                text: 'Delete',
                handler: () => {
                    measureStore.removeMeasurement(measure);
                }
            }
        ]
    }).then(alert => alert.present());
}

</script>