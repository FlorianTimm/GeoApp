<template>
    <ion-input :label :labelPlacement :id="'select_point' + uuid" :value=model?.nr :placeholder readonly />
    <ion-button :id="'new_point' + uuid" slot="end" v-if="newPoint">
        <ion-icon :icon="add"></ion-icon>
    </ion-button>

    <PointDialog v-if="newPoint" ref="newPointDialog" :trigger="'new_point' + uuid" @confirm="addPointClose" />
    <PointSelectDialog :trigger="'select_point' + uuid" v-model="model" :filterPoints :newPoint
        :points-without-coordinates @new="newPointOpen" />
</template>

<script setup lang="ts">
import { Point } from "@/types/Point";
import PointSelectDialog from './PointSelectDialog.vue';
import { IonInput, IonIcon, IonButton } from "@ionic/vue";
import { PropType, watch, ref } from "vue";
import { useMeasureStore } from "@/store";
import PointDialog from "./PointDialog.vue";
import { add } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
    'add': add
})

const model = defineModel<Point>();

const newPointDialog = ref<InstanceType<typeof PointDialog>>();

const uuid = Math.random().toString(36).substring(7);

defineProps({
    newPoint: Boolean,
    filterPoints: {
        type: Array<string>,
        default: []
    },
    pointsWithoutCoordinates: {
        type: Boolean,
        default: true
    },
    placeholder: {
        type: String,
        default: 'select point'
    },
    label: {
        type: String,
        default: 'Point'
    },
    labelPlacement: {
        type: String as PropType<'stacked' | 'fixed' | 'start' | 'end' | 'floating'>,
        default: 'stacked'
    }
})


const store = useMeasureStore();

watch(store.points, (points) => {
    if (!model.value) {
        return;
    }
    if (!(model.value?.nr in points)) {
        model.value = undefined;
    }
});

const newPointOpen = () => {
    model.value = undefined;
    newPointDialog.value?.newPoint();
}

const addPointClose = (point: Point) => {
    model.value = point;
    emit('input', point);
}

const emit = defineEmits(['input']);
</script>