<template>
    <ion-select @ionChange="optionSelected($event)" v-bind:placeholder="placeholder" v-if="source" :value>
        <ion-select-option v-for="item in source.getFeatures()" :value="item">
            {{ item.get('nr') }}
        </ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';


const props = defineProps({
    source: VectorSource<Feature<Point>>,
    value: Feature,
    placeholder: {
        type: String,
        default: 'Punkt auswählen'
    }
})

const emit = defineEmits(['input']);

const optionSelected = (e: CustomEvent) => {
    emit('input', e.detail.value);
}

</script>