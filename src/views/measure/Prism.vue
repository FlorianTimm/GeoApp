<template>
    <ion-list>
        <ion-item>
            <PointNumberSelect label="Start-Point" v-model="point1" ref="startpoint" />
        </ion-item>
        <ion-item>
            <PointNumberSelect label="End-Point" v-model="point2" ref="endpoint" />
        </ion-item>
        <ion-item>
            <ion-input label-placement="stacked" v-model="distanceNew" label="Distance" type="number"
                :placeholder="(point1 && point2) ? format(lengthP(point1, point2)) : ''"></ion-input>
        </ion-item>

    </ion-list>

    <ion-grid>
        <ion-row>
            <ion-col>Point</ion-col>
            <ion-col>Ordinate</ion-col>
            <ion-col>Abszisse</ion-col>
        </ion-row>
        <ion-row v-if=measure v-for="point, i in measure.points" :key="i">
            <ion-col>
                {{ point.point }}
            </ion-col>
            <ion-col>
                <ion-input v-model="point.ordinate" aria-label="Ordinate" type="number"
                    label-placement="stacked"></ion-input>
            </ion-col>
            <ion-col>
                <ion-input v-model="point.abscissa" aria-label="Abszisse" type="number"
                    label-placement="stacked"></ion-input>
            </ion-col>
            <ion-col>
                <ion-button @click="removePoint(i)"><ion-icon name="trash" aria-hidden="true"></ion-icon></ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col size="auto">
                <PointNumberSelect v-model="point_new" newPoint />
            </ion-col>
            <ion-col>
                <ion-input v-model="ordinate_new" label="Ordinate" type="number" label-placement="stacked"
                    :placeholder="(point_new ? format(measure?.stakeOut(point_new.nr)?.ordinate) : '') ?? ''"></ion-input>
            </ion-col>
            <ion-col>
                <ion-input v-model="abscissa_new" label="Abszisse" type="number" label-placement="stacked"
                    :placeholder="(point_new ? format(measure?.stakeOut(point_new.nr)?.abscissa) : '') ?? ''"></ion-input>
            </ion-col>
            <ion-col>
                <ion-button :disabled="!(point_new && abscissa_new && ordinate_new)" @click="addPoint()"><ion-icon
                        name="add" aria-hidden="true"></ion-icon></ion-button>
            </ion-col>
        </ion-row>
    </ion-grid>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import { PrismMeasure } from '@/types/PrismMeasure';
import { add, trash } from 'ionicons/icons';
import { IonButton } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { Point } from "@/types/Point";
import { distance } from '@/utils';
import { CoordinateEntry2D } from '@/types/CoordinateEntry';
import { IonInput, IonList, IonItem, IonIcon, IonGrid, IonCol, IonRow } from '@ionic/vue';
import { useMeasureStore, useStore } from '@/store';
import { format } from '@/utils';

addIcons({
    'add': add,
    'trash': trash
})

const store = useStore();
const measureStore = useMeasureStore();

const measure = ref<PrismMeasure>();

const point1 = ref<Point>();
const point2 = ref<Point>();
const distanceNew = ref<number>();

const actMeasure = store.getActiveMeasurement()
if (actMeasure && actMeasure.type === 'prism') {
    measure.value = actMeasure as PrismMeasure;
    console.log(measure.value);
    point1.value = measure.value.start ? measureStore.getPoint(measure.value.start) : undefined;
    point2.value = measure.value.end ? measureStore.getPoint(measure.value.end) : undefined;
    distanceNew.value = measure.value?.distance;
}
if (!actMeasure || actMeasure.type !== 'prism') {
    store.setActiveMeasurement(new PrismMeasure());
    measure.value = store.getActiveMeasurement() as PrismMeasure;
    measureStore.addMeasurement(measure.value);
    distanceNew.value = measure.value?.distance;
}

watch(point1, (m) => {
    if (!measure.value) {
        return;
    }
    measure.value.start = point1.value?.nr;
})
watch(point2, (m) => {
    if (!measure.value) {
        return;
    }
    measure.value.end = point2.value?.nr;
})
watch(distanceNew, (m) => {
    if (!measure.value) {
        return;
    }
    console.log('distance', distanceNew.value);
    let n: number | undefined = parseFloat('' + distanceNew.value);
    if (isNaN(n)) {
        n = undefined;
    }
    measure.value.distance = n
})
watch(measure, (m) => {
    if (!measure.value) {
        return;
    }
    point1.value = measure.value.start ? measureStore.getPoint(measure.value.start) : undefined;
    point2.value = measure.value.end ? measureStore.getPoint(measure.value.end) : undefined;
    distanceNew.value = measure.value.distance;
})


const point_new = ref<Point>();
const abscissa_new = ref<number>();
const ordinate_new = ref<number>();

const lengthP = (point1: Point, point2: Point): number => {
    const coords1 = point1?.getCoordinate();
    const coords2 = point2?.getCoordinate();
    if (!coords1 || !coords2) {
        return 0;
    }

    return distance(<CoordinateEntry2D>coords1, <CoordinateEntry2D>coords2);

}

const addPoint = () => {
    if (point_new.value && abscissa_new.value && ordinate_new.value) {
        console.log('new point', point_new.value, abscissa_new.value, ordinate_new.value);
        if (!measure.value) {
            measure.value = new PrismMeasure();
        }
        measure.value.addPoint(point_new.value.nr, ordinate_new.value, abscissa_new.value);
        point_new.value = undefined;
        abscissa_new.value = undefined;
        ordinate_new.value = undefined;
    }
}

const removePoint = (i: number) => {
    if (measure.value) {
        measure.value.points.splice(i, 1);
    }
}
</script>