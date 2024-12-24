<template>

</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonContent, IonMenu } from '@ionic/vue';

defineProps({
    contentId: String,
});

const exportJson = () => {
    console.log('Exporting JSON');
}
</script>