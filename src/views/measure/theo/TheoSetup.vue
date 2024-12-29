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
                <GonInput v-model="v" />
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
            <ion-button expand="block" @click="ready()" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="!(measure.orientation ?? false)">Ready</ion-button>
        </div>

        <table>
            <tbody>
                <tr>
                    <th>Point</th>
                    <th>Hz</th>
                    <th>V</th>
                    <th>Hz (calc)</th>
                </tr>
                <tr v-for="item, i in measure.measures" :key="item.nr">
                    <td>{{ item.nr }}</td>
                    <td>{{ format(item.hz, 4) }}</td>
                    <td>{{ format(item.v, 4) }}</td>
                    <td>{{
                        format(gonBetween0And400((azimuth({
                            x: measureStore.getPoint(measure?.pointNumber)?.getCoordinate()?.x ?? 0,
                            y: measureStore.getPoint(measure?.pointNumber)?.getCoordinate()?.y ?? 0
                        },
                            {
                                x: measureStore.getPoint(item.nr)?.getCoordinate()?.x ?? 0,
                                y: measureStore.getPoint(item.nr)?.getCoordinate()?.y ?? 0
                        }) ?? 0) -
                        (measure.orientation ?? 0)), 4)
                        }}
                    </td>
                    <td>
                        <ion-button @click="removePoint(i)">
                            <ion-icon :icon="trash"></ion-icon>
                        </ion-button>
                    </td>
                </tr>
            </tbody>
        </table>
        Orientation: {{ format(measure.orientation ?? 0, 4) }}
    </span>
</template>

<script setup lang="ts">
import { IonButton, IonList, IonItem, IonLabel, IonInput, IonToggle, alertController } from '@ionic/vue';
import { ref } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import GonInput from '@/components/GonInput.vue';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { useMeasureStore, useStore } from '@/store';
import { azimuth, gonBetween0And400 } from "@/utils";
import { trash } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { format } from '@/utils';

addIcons({
    'trash': trash
})

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


const measureStore = useMeasureStore();
const store = useStore();
let measure = ref<TheodoliteMeasure>();


const actMeasure = store.getActiveMeasurement()
if (actMeasure && actMeasure.type === 'theodolite') {
    measure.value = actMeasure as TheodoliteMeasure;
    console.log(measure.value);
}


const addPoint = () => {
    if (!measure.value || !point.value || !hz.value) {
        return;
    }
    measure.value.addMeasure({
        nr: point.value.nr,
        lage: 1,
        hz: hz.value,
        v: typeof v.value === 'string' ? parseFloat(v.value) : v.value,
        targetHeight: typeof th.value === 'string' ? parseFloat(th.value) : th.value,
        distance: typeof s.value === 'string' ? parseFloat(s.value) : s.value,
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
        (typeof accuracy.value === 'string' ? parseFloat(accuracy.value) : accuracy.value) ?? (second.value ? 1 : 3),
        (typeof ih.value === 'string' ? parseFloat(ih.value) : ih.value) ?? 0
    );
    measureStore.addMeasurement(measure.value);
    store.setActiveMeasurement(measure.value);
}

const removePoint = (i: number) => {
    if (!measure.value) {
        return;
    }
    alertController.create({
        header: 'Delete Point',
        message: 'Do you really want to delete this point?',
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel'
            },
            {
                text: 'Delete',
                handler: () => {
                    measure?.value?.removeMeasure(i);
                }
            }
        ]
    }).then(alert => {
        alert.present();
    });
}

const ready = () => {
    store.setMeasureMethod('');
}
</script>