<template>
    <ion-input :aria-label v-model="model" type="number" />
</template>

<script setup lang="ts">
import { IonInput } from '@ionic/vue';

const model = defineModel({
    type: Number
});

defineProps({
    ariaLabel: String
});
</script>