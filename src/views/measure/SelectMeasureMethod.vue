<template>
    <div>
        <ion-list>
            <ion-item>
                <ion-label>Theodolite</ion-label>
                <ion-button
                    @click="store.setActiveMeasurement(); store.setMeasureMethod('theo_setup')">Setup</ion-button>
                <ion-button @click="store.setMeasureMethod('theo_measure')"
                    v-bind:disabled="store.getActiveMeasurement()?.type !== 'theodolite'">Measure</ion-button>
                <ion-button @click="store.setMeasureMethod('theo_stakeout')"
                    v-bind:disabled="store.getActiveMeasurement()?.type !== 'theodolite'">Stake
                    out</ion-button>
            </ion-item>
            <ion-item>
                <ion-label>Level</ion-label>
                <ion-button @click="store.setMeasureMethod('level')">Level</ion-button>
            </ion-item>
            <ion-item>
                <ion-label>Tape/Prism</ion-label>
                <ion-button @click="store.setMeasureMethod('prism')">Prism</ion-button>
            </ion-item>
        </ion-list>
        <ion-title>Measurements</ion-title>
        <ion-list>
            <ion-item v-for="measure, i in measureStore.getMeasurements()" :key="i">
                <ion-toggle aligment="start" :checked="store.getActiveMeasurement() == measure"
                    @ionChange="(d) => { d.detail.checked ? store.setActiveMeasurement(measure) : store.setActiveMeasurement() }">{{
    measure.getName()
    +
    ' ' +
    measure.getShortInfo() }}</ion-toggle>
                <ion-button @click="reactivateMeasure(measure)"><ion-icon name="hammer-outline"></ion-icon></ion-button>
                <ion-button @click="deleteMeasure(measure)"><ion-icon name="trash-outline"></ion-icon></ion-button>
            </ion-item>
            <!-- v-bind:style="() ? 'color: black' : 'color: grey'" -->
        </ion-list>
    </div>
</template>


<script setup lang="ts">
import { useMeasureStore, useStore } from '@/store';
import { IonList, IonItem, IonLabel, IonButton, IonIcon, IonTitle, alertController, IonToggle } from '@ionic/vue';
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