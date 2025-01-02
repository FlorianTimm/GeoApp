<template>
    <span>
        <span v-if="!measure">
            <ion-list>
                <ion-item>
                    <PointNumberSelect label='Point' label-placement="stacked" v-model="nr" newPoint />
                </ion-item>
                <ion-item>
                    <ion-input label-placement="stacked" label='Description' v-model="description"
                        type="text"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label-placement="stacked" label='instrument height [m]' v-model="ih"
                        type="number"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-toggle v-model="second">2. Lage</ion-toggle>
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
        <TheoMeasureForm v-if="measure" />
    </span>
</template>

<script setup lang="ts">
import { IonButton, IonList, IonItem, IonLabel, IonInput, IonToggle } from '@ionic/vue';
import { ref } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { useMeasureStore, useStore } from '@/store';
import TheoMeasureForm from './TheoMeasure.vue'


const ih = ref<number>();
const nr = ref<Point>();
const accuracy = ref<number>();
const description = ref<string>();
const second = ref<boolean>();


const measureStore = useMeasureStore();
const store = useStore();
let measure = ref<TheodoliteMeasure>();


const actMeasure = store.getActiveMeasurement()
if (actMeasure && actMeasure.type === 'theodolite') {
    measure.value = actMeasure as TheodoliteMeasure;
    console.log(measure.value);
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
        (typeof accuracy.value === 'string' ? parseFloat(accuracy.value) : accuracy.value) ?? (second.value ? 1 : 3),
        (typeof ih.value === 'string' ? parseFloat(ih.value) : ih.value) ?? 0
    );
    measureStore.addMeasurement(measure.value);
    store.setActiveMeasurement(measure.value);
}

</script>