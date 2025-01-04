<template>
    <span v-if="measure">
        <ion-list>
            <ion-item v-if="store.getMeasureMethod() === 'theo_setup'">
                <ion-label>Point {{ measure.measures.length + 1 }}</ion-label>
            </ion-item>
            <ion-item>
                <PointNumberSelect v-model="point" :newPoint="store.getMeasureMethod() !== 'theo_setup'" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Horizontal direction</ion-label>
                <GonInput v-model="hz" :placeholder="format(placeholder.hz)" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Vertical angle</ion-label>
                <GonInput v-model="v" :placeholder="format(placeholder.v)" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Distance</ion-label>
                <IonInput v-model="s" type="number" :placeholder="format(placeholder.distance)" />
            </ion-item>
        </ion-list>

        <div class="ion-padding">
            <ion-button expand="block" @click="addPoint" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="!point || !hz">{{ store.getMeasureMethod() === 'theo_setup' ?
                'Next' : 'Save' }}</ion-button>
        </div>
        <div class="ion-padding" v-if="store.getMeasureMethod() === 'theo_setup'">
            <ion-button expand="block" @click="ready()" class="ion-text-wrap ion-no-margin"
                v-bind:disabled="!(measure.orientation ?? false)">Ready</ion-button>
        </div>

        <ion-list>
            <ion-item v-for="item, i in measure.measures" :key="item.nr">
                <ion-grid>
                    <ion-row>
                        <ion-col>
                            <ion-row>
                                <ion-toggle @ionChange="coordToggled" v-model="item.active">Point {{ item.nr
                                    }}</ion-toggle>
                            </ion-row>
                            <ion-row>
                                <ion-col v-if="item.hz">Hz: {{ format(item.hz, 4) }}</ion-col>
                                <ion-col v-if="item.v">V: {{ format(item.v, 4) }}</ion-col>
                                <ion-col v-if="item.distance">S: {{ format(item.distance, 3) }}</ion-col>
                                <!--
                                <ion-col>
                                </ion-col>
                                -->
                            </ion-row>
                            <ion-row v-if="measure.orientation">
                                <ion-col v-if="item.hz">{{
                                    format(gonBetweenMinus200And200((azimuth({
                                    x: measureStore.getPoint(measure?.pointNumber)?.getCoordinate()?.x ?? 0,
                                    y: measureStore.getPoint(measure?.pointNumber)?.getCoordinate()?.y ?? 0
                                    },
                                    {
                                    x: measureStore.getPoint(item.nr)?.getCoordinate()?.x ?? 0,
                                    y: measureStore.getPoint(item.nr)?.getCoordinate()?.y ?? 0
                                    }) ?? 0) -
                                    (measure.orientation ?? 0) - item.hz), 4)
                                    }}</ion-col>
                                <ion-col v-if="item.v">V: {{ format(0, 4) }}</ion-col>
                                <ion-col v-if="item.distance">S: {{ format(0, 3) }}</ion-col>
                            </ion-row>
                        </ion-col>
                        <ion-col size="auto">
                            <ion-button @click="removePoint(i)">
                                <ion-icon :icon="trash"></ion-icon>
                            </ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-item>
        </ion-list>

        Orientation: {{ format(measure.orientation ?? 0, 4) }}
    </span>
</template>

<script setup lang="ts">
import { IonButton, IonList, IonItem, IonLabel, IonInput, alertController, IonGrid, IonCol, IonToggle, IonRow } from '@ionic/vue';
import { ref } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import GonInput from '@/components/GonInput.vue';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { useMeasureStore, useStore } from '@/store';
import { azimuth, gonBetween0And400, gonBetweenMinus200And200 } from "@/utils";
import { trash } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { format } from '@/utils';
import { watch } from 'vue';


const hz = ref<number>();
const v = ref<number>();
const th = ref<number>();
const s = ref<number>();
const point = ref<Point>();
const placeholder = ref<{ v?: number, hz?: number, distance?: number }>({});


addIcons({
    'trash': trash
})

const measureStore = useMeasureStore();
const store = useStore();
let measure = ref<TheodoliteMeasure>();

const actMeasure = store.getActiveMeasurement()
if (actMeasure && actMeasure.type === 'theodolite') {
    measure.value = actMeasure as TheodoliteMeasure;
    console.log(measure.value);
}

watch(point, (point) => {
    if (!point || !measure.value) {
        return;
    }
    placeholder.value = measure.value.stakeOut(point, th.value);
})

const addPoint = () => {
    if (!measure.value || !point.value || !hz.value) {
        return;
    }
    measure.value.addMeasure({
        nr: point.value.nr,
        active: true,
        lage: 1,
        hz: typeof hz.value === 'string' ? parseFloat(hz.value) : v.value,
        v: typeof v.value === 'string' ? parseFloat(v.value) : v.value,
        targetHeight: typeof th.value === 'string' ? parseFloat(th.value) : th.value,
        distance: typeof s.value === 'string' ? parseFloat(s.value) : s.value,
    });
    point.value = undefined;
    hz.value = undefined;
    v.value = undefined;
    s.value = undefined;
    placeholder.value = {};

    if (store.getMeasureMethod() === 'theo_setup') {
        // adjust

    }
}


const coordToggled = (e: CustomEvent) => {
    measure.value?.calculate()
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
