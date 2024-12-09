<template>
    <ion-grid>
        <ion-row>
            <ion-col>
                <ion-button @click="$emit('select', 'winkelprisma')">Winkelprisma</ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                <ion-button @click="$emit('select', 'nivellier')">Nivellier</ion-button>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                <ion-button @click="$emit('select', 'theodolit')">Theodolit</ion-button>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>


<script setup lang="ts">
import { IonButton, IonCol, IonRow, IonGrid } from '@ionic/vue';

defineProps({
    source: Object,
});

const emit = defineEmits(['select']);

</script>