<template>
    <ion-select v-model="selected" placeholder="Select One" v-if="source">
        <ion-select-option v-for="item in source.getFeatures()">item.get('nr')</ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue';
import { ref } from 'vue';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';

const selected = ref<string>('');

defineProps({
    source: VectorSource<Feature<Point>>
})
</script>