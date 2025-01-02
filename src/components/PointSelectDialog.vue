<template>
    <ion-modal ref="modal" :trigger @willDismiss="onWillDismiss" @didPresent="onOpened">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cancel()">Cancel</ion-button>
                </ion-buttons>
                <ion-title>Select Point</ion-title>
                <ion-buttons slot="end" label="sorting">
                    <ion-select v-model="settingStore.orderPointsBy" placeholder="Sort by" labelPlacement="stacked">
                        <div slot="label">Sort by</div>
                        <ion-select-option value="no_order">no sorting</ion-select-option>
                        <ion-select-option value="nr">point number</ion-select-option>
                        <ion-select-option value="accuracy">accuracy</ion-select-option>
                        <ion-select-option value="distance">distance</ion-select-option>
                        <ion-select-option value="direction">direction</ion-select-option>
                    </ion-select>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list>
                <ion-item v-if="newPoint" id="new_point">New Point</ion-item>
                <ion-item v-for="item in test" :value="item" @click="selectPoint(item)"
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
    IonSelect,
    IonSelectOption,
} from '@ionic/vue';
import { OverlayEventDetail } from '@ionic/core/components';
import { computed, ref } from 'vue';
import { useMeasureStore, useSettingStore } from '@/store';
import { storeToRefs } from 'pinia';
import { Point } from '@/types/Point';
import PointDialog from './PointDialog.vue';

const measureStore = useMeasureStore();
const settingStore = useSettingStore();
const { points, measurements } = storeToRefs(measureStore);

const modal = ref<InstanceType<typeof IonModal>>()

const model = defineModel<Point>();

let oldValue: Point | undefined;

let test = computed(() => orderBy(points.value));

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

const orderBy = (points: Record<string, Point>) => {
    return Object.values(points).sort((a, b) => {
        if (settingStore.orderPointsBy == 'no_order')
            return 0;
        switch (settingStore.orderPointsBy) {
            case 'nr':
                return a.nr.localeCompare(b.nr);
            case 'accuracy':
                return (a.getCoordinate()?.accuracy ?? 0) - (b.getCoordinate()?.accuracy ?? 0);
            case 'distance':
            //return a.distance - b.distance;
            case 'direction':
            //return a.direction - b.direction;
            default:
                return 0;
        }
    });
}
</script>