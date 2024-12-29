<template>
    <span v-if="!measure">
        <ion-list>
            <ion-item>
                <ion-label label-placement="stacked">Point</ion-label>
                <PointNumberSelect v-model="nr" newPoint />
            </ion-item>
            <ion-item>
                <ion-input label-placement="stacked" label='Description' v-model="description" type="text"></ion-input>
            </ion-item>
            <ion-item>
                <ion-input label-placement="stacked" label='instrument height [m]' v-model="ih"
                    type="number"></ion-input>
            </ion-item>
            <ion-item>
                <ion-label>2. Lage</ion-label>
                <ion-toggle v-model="second" position="end"></ion-toggle>
            </ion-item>
            <ion-item>
                <ion-input label-placement="stacked" label='angle accuracy ["]' v-model="accuracy" type="number"
                    v-bind:placeholder="second ? '1' : '3'"></ion-input>
            </ion-item>
        </ion-list>

        <div class="ion-padding">
            <ion-button expand="block" @click="start" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="!nr">Next</ion-button>
        </div>
    </span>
    <span v-if="measure">
        <br>
        <ion-list>
            <ion-item>
                <ion-label>Point {{ measure.measures.length + 1 }}</ion-label>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Point</ion-label>
                <PointNumberSelect v-model="point" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Horizontal direction</ion-label>
                <GonInput v-model="hz" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Vertical angle</ion-label>
                <IonInput v-model="v" type="number" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Distance</ion-label>
                <IonInput v-model="s" type="number" />
            </ion-item>
        </ion-list>

        <div class="ion-padding">
            <ion-button expand="block" @click="addPoint" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="!point || !hz">Next</ion-button>
        </div>
        <div class="ion-padding">
            <ion-button expand="block" @click="calc" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="measure.measures.length < 3">Calculate Position</ion-button>
        </div>

        <table>
            <tbody>
                <tr>
                    <th>Point</th>
                    <th>Hz</th>
                    <th>V</th>
                </tr>
                <tr v-for="item in measure.measures" :key="item.nr">
                    <td>{{ item.nr }}</td>
                    <td>{{ item.hz }}</td>
                    <td>{{ item.v }}</td>
                    <td>{{
    (azimuth({
        x: measureStore.getPoint(measure?.pointNumber)?.getCoordinate()?.x ?? 0,
        y: measureStore.getPoint(measure?.pointNumber)?.getCoordinate()?.y ?? 0
    },
        {
            x: measureStore.getPoint(item.nr)?.getCoordinate()?.x ?? 0,
            y: measureStore.getPoint(item.nr)?.getCoordinate()?.y ?? 0
        }) ?? 0) -
    (measure.orientation ?? 1)
                    }}
                    </td>
                </tr>
            </tbody>
        </table>
        Orientation: {{ measure.orientation }}
    </span>
</template>

<script setup lang="ts">
import { IonButton, IonList, IonItem, IonLabel, IonInput, IonToggle } from '@ionic/vue';
import { ref } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import GonInput from '@/components/GonInput.vue';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { useMeasureStore } from '@/store';
import { azimuth } from "@/utils";

const point = ref<Point>();
const ih = ref<number>();
const hz = ref<number>();
const v = ref<number>();
const th = ref<number>();
const accuracy = ref<number>();
const nr = ref<Point>();
const s = ref<number>();
const description = ref<string>();
const second = ref<boolean>();

let measure = ref<TheodoliteMeasure>();
const measureStore = useMeasureStore();

const addPoint = () => {
    if (!measure.value || !point.value || !hz.value) {
        return;
    }
    measure.value.addMeasure({
        nr: point.value.nr,
        lage: 1,
        hz: hz.value,
        v: v.value,
        targetHeight: th.value,
        distance: s.value
    });
    point.value = undefined;
    hz.value = undefined;
    v.value = undefined;
    s.value = undefined;
}

const start = () => {
    console.log(nr.value, description.value, second.value);
    if (!nr.value) {
        return;
    }
    measure.value = new TheodoliteMeasure(
        nr.value.nr,
        description.value,
        second.value,
        accuracy.value ?? (second.value ? 1 : 3),
        ih.value ?? 0
    );
    measureStore.addMeasurement(measure.value);
}

const calc = () => {
    console.log('calc');
}
</script>