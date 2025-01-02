<template>
    <ion-input :label :labelPlacement id="select_point" :value=model?.nr :placeholder readonly></ion-input>

    <PointSelectDialog trigger='select_point' v-model="model" :newPoint />
</template>

<script setup lang="ts">
import { Point } from "@/types/Point";
import PointSelectDialog from './PointSelectDialog.vue';
import { IonInput } from "@ionic/vue";
import { PropType, watch } from "vue";
import { useMeasureStore } from "@/store";

const model = defineModel<Point>();

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


const emit = defineEmits(['input']);
</script>