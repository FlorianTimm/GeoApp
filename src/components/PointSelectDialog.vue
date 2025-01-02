<template>
    <ion-modal ref="modal" :trigger @willDismiss="onWillDismiss" @didPresent="onOpened">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cancel()">Cancel</ion-button>
                </ion-buttons>
                <ion-title>Select Point</ion-title>
                <ion-buttons slot="end">
                    <ion-button :strong="true" @click="confirm()">Confirm</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list>
                <ion-item v-if="newPoint" id="new_point">New Point</ion-item>
                <ion-item v-for="item in points" :value="item" @click="selectPoint(item)"
                    :color="item.nr == model?.nr ? 'primary' : undefined">
                    {{ item.nr }}
                </ion-item>
            </ion-list>
            <PointDialog ref="new_point_dialog" trigger="new_point" @confirm="addPoint" />
        </ion-content>
    </ion-modal>

</template>

<script lang="ts" setup>
import {
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonItem,
    IonList,
} from '@ionic/vue';
import { OverlayEventDetail } from '@ionic/core/components';
import { ref } from 'vue';
import { useMeasureStore } from '@/store';
import { storeToRefs } from 'pinia';
import { Point } from '@/types/Point';
import PointDialog from './PointDialog.vue';

const store = useMeasureStore();
const { points, measurements } = storeToRefs(store);

const modal = ref<InstanceType<typeof IonModal>>()

const model = defineModel<Point>();

let oldValue: Point | undefined;

defineProps({
    trigger: {
        type: String,
        default: false,
    },
    newPoint: Boolean
});

const selectPoint = (point: Point) => {
    model.value = point;
    confirm();
};

const confirm = () => {
    modal.value?.$el.dismiss(model.value, 'confirm');
};

const cancel = () => {
    model.value = oldValue;
    modal.value?.$el.dismiss(null, 'cancel');
};

const onOpened = () => {
    console.log('opened');
    oldValue = model.value;
};
const addPoint = (point: Point) => {
    selectPoint(point);
    console.log('add point', point);
};

const onWillDismiss = (ev: CustomEvent<OverlayEventDetail>) => {
    if (ev.detail.role === 'confirm') {
        return;
    } else {
        model.value = oldValue;
    }
};
</script>