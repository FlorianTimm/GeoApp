<template>
    <ion-input :aria-label v-model="model" type="number" max="400" min="0" :placeholder />
</template>

<script setup lang="ts">
import { gonBetween0And400 } from '@/utils';
import { IonInput } from '@ionic/vue';
import { watch } from 'vue';

const model = defineModel<string | number>();
/*
watch(model, (value) => {
    if (value === undefined || value === null || value === '') {
        return
    }
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    model.value = gonBetween0And400(value);
});*/

defineProps({
    ariaLabel: String,
    placeholder: String
});
</script>