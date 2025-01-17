<template>
    <ion-list>
        <ion-item>
            <ion-label placement='stacked'>Point</ion-label>
            <PointNumberSelect v-model="point" />
        </ion-item>
        <ion-item>
            <ion-input label-placement='stacked' label='Target Height' v-model="target_height"
                :readonly="point?.getHeight() === undefined"></ion-input>
        </ion-item>
        <ion-item>
            <ion-input label-placement='stacked' label='Distance' v-model="value.distance" readonly></ion-input>
        </ion-item>
        <ion-item>
            <ion-input label-placement='stacked' label='Horizontal Direction' v-model="value.hz" readonly></ion-input>
        </ion-item>
        <ion-item>
            <ion-input label-placement='stacked' label='Vertical Angle' v-model="value.v" readonly></ion-input>
        </ion-item>
    </ion-list>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import { useStore } from '@/store';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { IonList, IonItem, IonLabel, IonInput } from '@ionic/vue';
import { stakeOut } from '@/types/GeoCalculations/StakeOut';

const point = ref<Point>();
const target_height = ref<number>(0);
const store = useStore();
const value = ref<{
    distance?: number;
    hz?: number;
    v?: number;
}>({
    distance: undefined,
    hz: undefined,
    v: undefined
});


watch([point, target_height], (data) => {
    const [point, target_height] = data;
    console.log(point);
    if (!point) {
        console.error('no point');
        return;
    }
    if (!store.getActiveMeasurement()) {
        console.error('no active measurement');
        return;
    }
    if (store.getActiveMeasurement()?.type !== 'theodolite') {
        console.error('active measurement is not theodolite');
        return;
    }

    value.value = stakeOut((<TheodoliteMeasure>store.getActiveMeasurement()), point, target_height);
});
</script>