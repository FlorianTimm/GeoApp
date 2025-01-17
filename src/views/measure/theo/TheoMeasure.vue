<template>
    <span v-if="measure">
        <ion-list>
            <ion-item v-if="store.getMeasureMethod() === 'theo_setup'">
                <ion-label>Point {{ measure.measures.length + 1 }}</ion-label>
            </ion-item>
            <ion-item>
                <PointNumberSelect v-model="point" :filterPoints :points-without-coordinates
                    :newPoint="store.getMeasureMethod() !== 'theo_setup'" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Horizontal direction</ion-label>
                <GonInput v-model="hz" :placeholder="format(placeholder.hz, 4)" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Vertical angle</ion-label>
                <GonInput v-model="v" :placeholder="format(placeholder.v, 4)" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Distance</ion-label>
                <IonInput v-model="s" type="number" :placeholder="format(placeholder.distance, 3)" />
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

        <ion-grid :fixed="true" v-if="store.getMeasureMethod() === 'theo_setup'">
            {{
            }}
            <ion-row
                v-if="measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) => v.sourceId == measure?.id)?.x">
                <ion-col>
                    X:
                </ion-col>
                <ion-col>
                    {{ format(measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) => v.sourceId ==
                        measure?.id)?.x, 3) }}
                </ion-col>
                <ion-col>
                    &pm;{{ format(measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) =>
                        v.sourceId == measure?.id)?.x_s, 3) }}
                </ion-col>
            </ion-row>
            <ion-row
                v-if="measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) => v.sourceId == measure?.id)?.y">
                <ion-col>
                    Y:
                </ion-col>
                <ion-col>
                    {{ format(measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) => v.sourceId ==
                        measure?.id)?.y, 3) }}
                </ion-col>
                <ion-col>
                    &pm;{{ format(measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) =>
                        v.sourceId == measure?.id)?.y_s, 3) }}
                </ion-col>
            </ion-row>
            <ion-row
                v-if="measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) => v.sourceId == measure?.id)?.z">
                <ion-col>
                    Z:
                </ion-col>
                <ion-col>
                    {{ format(measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) => v.sourceId ==
                        measure?.id)?.z, 3) }}
                </ion-col>
                <ion-col>
                    &pm;{{ format(measureStore.getPoint(measure.pointNumber)?.getCoordinate(undefined, (v) =>
                        v.sourceId == measure?.id)?.z_s, 3) }}
                </ion-col>
            </ion-row>
            <ion-row v-if="measure.orientation">
                <ion-col>
                    Ori:
                </ion-col>
                <ion-col>
                    {{ format(measure.orientation, 4) }}
                </ion-col>
                <ion-col>
                    &pm;{{ format(measure.orientationAccuracy, 4) }}
                </ion-col>
            </ion-row>
        </ion-grid>
        <p />
        <ion-grid :fixed="true" class="measures">
            <ion-row v-if="measure.orientation">
                <ion-col>
                    <ion-toggle v-model="settingStore.errorInCm">Show error in cm</ion-toggle>
                    <p />
                </ion-col>
            </ion-row>
            <ion-row v-for="item, i in measure.measures" :key="item.nr">
                <ion-col>
                    <ion-toggle @ionChange="coordToggled" v-model="item.active">Point {{ item.nr }}</ion-toggle>
                </ion-col>
                <ion-col>

                    <ion-row v-if="item.hz !== undefined">Hz: {{ format(item.hz, 4) }}</ion-row>
                    <ion-row v-if="item.v !== undefined">V: {{ format(item.v, 4) }}</ion-row>
                    <ion-row v-if="item.distance !== undefined">S: {{ format(item.distance, 3) }} </ion-row>

                </ion-col>
                <ion-col v-if="measure.orientation && settingStore.errorInCm">
                    <ion-row v-if="item.hz !== undefined">
                        {{ measure.getHzErrorInCm(i) !== undefined ? formatWithSign(measure.getHzErrorInCm(i), 1) +
                            '&nbsp;cm'
                            : '-' }}
                    </ion-row>
                    <ion-row v-if="item.v !== undefined">
                        {{ measure.getVErrorInCm(i) !== undefined ? formatWithSign(measure.getHzErrorInCm(i), 1) +
                            '&nbsp;cm'
                            : '-' }}
                    </ion-row>
                    <ion-row v-if="item.distance !== undefined">
                        {{ item.distance_v !== undefined ? formatWithSign(item.distance_v * 100, 1) + '&nbsp;cm' : '-'
                        }}
                    </ion-row>
                </ion-col>

                <ion-col v-if="measure.orientation && !settingStore.errorInCm">
                    <ion-row v-if="item.hz !== undefined">
                        {{ item.hz_v !== undefined ? + formatWithSign(item.hz_v, 4) + '&nbsp;g' : '-' }}
                    </ion-row>
                    <ion-row v-if="item.v !== undefined">
                        {{ item.v_v !== undefined ? + formatWithSign(item.v_v, 4) + '&nbsp;g' : '-' }}
                    </ion-row>
                    <ion-row v-if="item.distance !== undefined">

                    </ion-row>
                </ion-col>

                <ion-col size="auto">
                    <ion-button @click="removePoint(i)">
                        <ion-icon :icon="trash"></ion-icon>
                    </ion-button>
                </ion-col>
            </ion-row>
        </ion-grid>

    </span>
</template>

<script setup lang="ts">
import { IonButton, IonList, IonItem, IonLabel, IonInput, alertController, IonGrid, IonCol, IonToggle, IonRow } from '@ionic/vue';
import { ref } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import GonInput from '@/components/GonInput.vue';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { useMeasureStore, useStore, useSettingStore } from '@/store';
import { azimuth, gonBetween0And400, gonBetweenMinus200And200 } from "@/utils";
import { trash } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { format, formatWithSign } from '@/utils';
import { watch } from 'vue';
import { stakeOut } from '@/types/GeoCalculations/StakeOut';


const hz = ref<number>();
const v = ref<number>();
const th = ref<number>();
const s = ref<number>();
const point = ref<Point>();
const placeholder = ref<{ v?: number, hz?: number, distance?: number }>({});
const coord = ref<{}>({});
const filterPoints = ref<string[]>([]);
const pointsWithoutCoordinates = ref<boolean>(true);

addIcons({
    'trash': trash
})

const measureStore = useMeasureStore();
const settingStore = useSettingStore();
const store = useStore();
let measure = ref<TheodoliteMeasure>();

const actMeasure = store.getActiveMeasurement()
if (actMeasure && actMeasure.type === 'theodolite') {
    measure.value = actMeasure as TheodoliteMeasure;
    console.log(measure.value);
    //filterPoints.value = measure.value.measures.map(m => m.nr);
    filterPoints.value = [measure.value.pointNumber]
    pointsWithoutCoordinates.value = store.getMeasureMethod() !== 'theo_setup';
}


watch(point, (point) => {
    if (!point || !measure.value) {
        return;
    }
    placeholder.value = stakeOut(measure.value, point, th.value);
    coord.value = measureStore.getPoint(measure.value?.pointNumber)?.getCoordinate() ?? {}
})

const addPoint = () => {
    if (!measure.value || !point.value || !hz.value) {
        return;
    }
    measure.value.addMeasure({
        nr: point.value.nr,
        active: true,
        usedForSetup: store.getMeasureMethod() === 'theo_setup',
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
        measure.value?.calculateSetup()
    } else {
        measure.value?.calculate()
    }
}


const coordToggled = (e: CustomEvent) => {
    if (store.getMeasureMethod() === 'theo_setup') {
        measure.value?.calculateSetup()
    } else {
        measure.value?.calculate()
    }

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

<style scoped>
ion-grid.measures>ion-row {
    border-bottom: 1px solid black;
}
</style>