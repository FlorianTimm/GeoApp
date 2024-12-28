<template>
    <span v-if="!measure">
        <ion-list>
            <ion-item>
                <ion-input label-placement="stacked" label='Point' v-model="nr" type="text"></ion-input>
            </ion-item>
            <ion-item>
                <ion-input label-placement="stacked" label='Description' v-model="description" type="text"></ion-input>
            </ion-item>
            <ion-item>
                <ion-label>2. Lage</ion-label>
                <ion-toggle v-model="second" position="end"></ion-toggle>
            </ion-item>
            <ion-item>
                <ion-input label-placement="stacked" label='angle accuracy ["]' v-model="accuracy" type="number"
                    v-bind:placeholder="second ? '1' : '3'"></ion-input>
            </ion-item>
            <ion-item v-if="settingStore.geolocation">
                <ion-label>GPS as first guess</ion-label>
                <ion-toggle v-model="gps" position="end"></ion-toggle>
            </ion-item>
        </ion-list>

        <div class="ion-padding">
            <ion-button expand="block" @click="start" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="!nr">Next</ion-button>
        </div>
    </span>
    <span v-if="measure">
        Point {{ measure.measures.length + 1 }}<br>
        <ion-list>
            <ion-item>
                <ion-label position="stacked">Point</ion-label>
                <PointNumberSelect v-model="point" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Direction</ion-label>
                <GonInput v-model="gon" />
            </ion-item>
        </ion-list>

        <div class="ion-padding">
            <ion-button expand="block" @click="addPoint" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="!point || !gon">Next</ion-button>
            <ion-button expand="block" @click="calc" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="measure.measures.length < 3">Calculate Position</ion-button>
        </div>

        <table>
            <tbody>
                <tr>
                    <th>Point</th>
                    <th>Direction</th>
                </tr>
                <tr v-for="item in measure.measures" :key="item.nr">
                    <td>{{ item.nr }}</td>
                    <td>{{ item.v }}</td>
                </tr>
            </tbody>
        </table>
    </span>
</template>

<script setup lang="ts">
import { IonButton, IonList, IonItem, IonLabel, IonInput, IonToggle } from '@ionic/vue';
import { ref } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import GonInput from '@/components/GonInput.vue';
import { TheoResectionMeasure } from '@/types/TheoResectionMeasure';
import { useMeasureStore, useSettingStore } from '@/store';
import { alertController } from '@ionic/vue';

const point = ref<Point>();
const gon = ref<number>();
const gps = ref<boolean>(true);
const accuracy = ref<number>();
const nr = ref<string>();
const description = ref<string>();
const second = ref<boolean>();

let measure = ref<TheoResectionMeasure>();
const measureStore = useMeasureStore();
const settingStore = useSettingStore();

const addPoint = () => {
    if (!measure.value || !point.value || !gon.value) {
        return;
    }
    measure.value.addMeasure(point.value, gon.value);
    point.value = undefined;
    gon.value = undefined;
}

const start = () => {
    console.log(nr.value, description.value, second.value);
    if (!nr.value) {
        return;
    }
    if (nr.value in measureStore.points) {
        alertController.create({
            header: 'Fehler',
            message: 'Punktnummer leer oder bereits vergeben.',
            buttons: ['OK']
        }).then(alert => {
            alert.present();
        });
    }
    measure.value = new TheoResectionMeasure(
        nr.value,
        description.value,
        second.value,
        accuracy.value ?? (second.value ? 1 : 3),
        settingStore.geolocation ? gps.value : false
    );
    measureStore.addMeasurement(measure.value);
}

const calc = () => {
    console.log('calc');
}
</script>