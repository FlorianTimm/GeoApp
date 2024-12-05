<template>
    <ion-select v-model="selected" placeholder="Select One" v-if="source">
        <ion-select-option v-for="item in source.getFeatures()">item.get('nr')</ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import VectorSource from 'ol/source/Vector';

const selected = ref<string>('');

defineProps({
    source: VectorSource
})
</script>