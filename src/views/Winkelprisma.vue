<template>
    <PointNumberSelect :source v-model="point1" />
    {{ point1?.getGeometry()?.getCoordinates() ?? 'nicht ausgewählt' }}
    <PointNumberSelect :source v-model="point2" />
    {{ point2?.getGeometry()?.getCoordinates() ?? 'nicht ausgewählt' }}
    <br /><br />
    <span v-if="point1 && point2">
        {{ lengthP(point1, point2) }}
    </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VectorSource from 'ol/source/Vector';
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { getDistance } from 'ol/sphere';

const point1 = ref<Feature<Point>>();
const point2 = ref<Feature<Point>>();

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
</script>