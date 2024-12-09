<template>
    <ion-select @selected="optionSelected" v-model="selected" placeholder="Select One" v-if="source">
        <ion-select-option v-for="item in source.getFeatures()" :key="item.getId()">{{ item.get('nr')
            }}</ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue';
import { ref } from 'vue';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';

const selected = ref<string>('');

const props = defineProps({
    source: VectorSource
})

const emit = defineEmits(['selected']);

const optionSelected = (e: CustomEvent) => {
    selected.value = e.detail.value;
    const feature = props.source?.getFeatureById(selected.value);
    emit('selected', feature);
}

</script>