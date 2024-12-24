<template>
    <PointNumberSelect :source v-model="point" />
</template>

<script setup lang="ts">

import { ref } from 'vue';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import PointNumberSelect from '@/components/PointNumberSelect.vue';

const point = ref<Feature<Point>>();

defineProps({
    source: VectorSource<Feature<Point>>
})
</script>