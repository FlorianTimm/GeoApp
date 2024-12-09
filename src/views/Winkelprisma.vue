<template>
    <PointNumberSelect :source="source" @selected="pnrSelected" />
    {{ selected?.get('nr') }}
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue';
import { ref } from 'vue';
import VectorSource from 'ol/source/Vector';
import PointNumberSelect from '@/components/PointNumberSelect.vue';
import { Feature } from 'ol';

const selected = ref<Feature | null>(null);

defineProps({
    source: VectorSource
})

const pnrSelected = (feature: Feature) => {
    console.log('pnrSelected', feature);
    selected.value = feature;
}

</script>