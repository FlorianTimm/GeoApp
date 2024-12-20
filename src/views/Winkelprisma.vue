<template>
    <PointNumberSelect :source v-model="point1" />
    {{ point1?.getGeometry()?.getCoordinates() ?? 'nicht ausgewählt' }}
    <PointNumberSelect :source v-model="point2" />
    {{ point2?.getGeometry()?.getCoordinates() ?? 'nicht ausgewählt' }}
    <br /><br />

    <ion-input :value="measure?.distance" label="Länge" type="number"
        :placeholder="(point1 && point2) ? lengthP(point1, point2).toString() : ''"></ion-input>
    <table>
        <tbody>
            <tr>
                <th>Punkt</th>
                <th>Ordinate</th>
                <th>Abszisse</th>
            </tr>
            <tr v-if=measure v-for="point, i in measure.points" :key="i">
                <td>
                    <PointNumberSelect :source v-model="point.point" />
                </td>
                <td><ion-input v-model="point.ordinate" aria-label="Ordinate" type="number"></ion-input></td>
                <td><ion-input v-model="point.abscissa" aria-label="Abszisse" type="number"></ion-input></td>
            </tr>
            <tr>
                <td>
                    <PointNumberSelect :source v-model="point_new" />
                </td>
                <td>
                    <ion-input v-model="ordinate_new" label="Ordinate" type="number"
                        label-placement="floating"></ion-input>
                </td>
                <td>
                    <ion-input v-model="abscissa_new" label="Abszisse" type="number"
                        label-placement="floating"></ion-input>
                </td>
                <td>
                    <ion-button :disabled="!(point_new && abscissa_new && ordinate_new)" @click="addPoint()"><ion-icon
                            name="add" aria-hidden="true"></ion-icon></ion-button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import VectorSource from 'ol/source/Vector';
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { getDistance } from 'ol/sphere';
import { WinkelprismaMeasure } from '@/types';
import { IonInput } from '@ionic/vue';
import { add } from 'ionicons/icons';
import { IonButton } from '@ionic/vue';
import { addIcons } from 'ionicons';

addIcons({
    'add': add
})

const point1 = ref<Feature<Point>>();
const point2 = ref<Feature<Point>>();

const measure = ref<WinkelprismaMeasure>();

const point_new = ref<Feature<Point>>();
const abscissa_new = ref<number>();
const ordinate_new = ref<number>();

defineProps({
    source: VectorSource<Feature<Point>>
})

const lengthP = (point1: Feature<Point>, point2: Feature<Point>): number => {
    const coords1 = point1?.getGeometry()?.getCoordinates();
    const coords2 = point2?.getGeometry()?.getCoordinates();
    if (!coords1 || !coords2) {
        return 0;
    }
    return getDistance(coords1, coords2);

}

const addPoint = () => {
    if (point_new.value && abscissa_new.value && ordinate_new.value) {
        console.log('new point', point_new.value, abscissa_new.value, ordinate_new.value);
        if (!measure.value) {
            measure.value = new WinkelprismaMeasure();
        }
        measure.value.points.push({
            point: point_new.value,
            abscissa: abscissa_new.value,
            ordinate: ordinate_new.value
        });
        point_new.value = undefined;
        abscissa_new.value = undefined;
        ordinate_new.value = undefined;
    }
}
</script>