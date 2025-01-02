<template>
    <PointNumberSelect v-model="point1" />
    {{ point1?.get2DCoordinate() ?? 'nicht ausgewählt' }}
    <PointNumberSelect v-model="point2" />
    {{ point2?.get2DCoordinate() ?? 'nicht ausgewählt' }}
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
                    <PointNumberSelect v-model="point.point" newPoint />
                </td>
                <td><ion-input v-model="point.ordinate" aria-label="Ordinate" type="number"></ion-input></td>
                <td><ion-input v-model="point.abscissa" aria-label="Abszisse" type="number"></ion-input></td>
            </tr>
            <tr>
                <td>
                    <PointNumberSelect v-model="point_new" newPoint />
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
import { ref } from 'vue';
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import { getDistance } from 'ol/sphere';
import { PrismMeasure } from '@/types/PrismMeasure';
import { IonInput, IonIcon } from '@ionic/vue';
import { add } from 'ionicons/icons';
import { IonButton } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { Point } from "@/types/Point";
import { distance } from '@/utils';
import { CoordinateEntry2D } from '@/types/CoordinateEntry';

addIcons({
    'add': add
})

const point1 = ref<Point>();
const point2 = ref<Point>();

const measure = ref<PrismMeasure>();

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