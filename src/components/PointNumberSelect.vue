<template>
    <ion-input :label :labelPlacement id="select_point" :value=model?.nr :placeholder readonly></ion-input>
    <ion-button id="new_point" slot="end" v-if="newPoint">
        <ion-icon :icon="add"></ion-icon>
    </ion-button>
    <PointDialog v-if="newPoint" ref="newPointDialog" trigger="new_point" @confirm="addPointClose" />
    <PointSelectDialog trigger='select_point' v-model="model" :newPoint @new="newPointOpen" />
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

defineProps({
    newPoint: Boolean,
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