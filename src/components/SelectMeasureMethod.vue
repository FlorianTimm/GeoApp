<template>
    <ion-button @click="winkelprisma">Winkelprisma</ion-button>
    <ion-button @click="nivellier">Nivellier</ion-button>
    <ion-button @click="theodolit">Theodolit</ion-button>
</template>


<script setup lang="ts">

import router from '@/router';
import { IonButton } from '@ionic/vue';

const props = defineProps({
    source: Object,
});

const winkelprisma = () => {
    console.log('winkelprisma');
    router.push('winkelprisma');
};

const nivellier = () => {
    console.log('nivellier');
    router.push('nivellier');
};

const theodolit = () => {
    console.log('theodolit');
    router.push('theodolit');
};

</script>