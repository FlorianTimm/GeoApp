<template>
    <ion-modal ref="modal" :trigger @willDismiss="onWillDismiss">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cancel()">Cancel</ion-button>
                </ion-buttons>
                <ion-title>Welcome</ion-title>
                <ion-buttons slot="end">
                    <ion-button :strong="true" @click="confirm()">Confirm</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list>
                <ion-item v-if="message">
                    <ion-label>{{ message }}</ion-label>
                </ion-item>
                <ion-item>
                    <ion-input label="point number" type="text" v-model="nr" label-placement="stacked"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="description" type="text" v-model="desc" label-placement="stacked"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-toggle v-model="gnss">Use GNSS</ion-toggle>
                    <br>
                </ion-item>
                <ion-item>
                    <ion-input label="easting" type="number" v-model="easting" label-placement="stacked"
                        v-bind:disabled="gnss"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="northing" type="number" v-model="northing" label-placement="stacked"
                        v-bind:disabled="gnss"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="altitude" type="number" v-model="altitude" label-placement="stacked"
                        v-bind:disabled="gnss"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="accuracy" type="number" v-model="accuracy" label-placement="stacked"
                        v-bind:disabled="gnss"></ion-input>
                </ion-item>
            </ion-list>
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
    IonInput,
    IonToggle,
    IonList,
    IonLabel
} from '@ionic/vue';
import { OverlayEventDetail } from '@ionic/core/components';
import { ref } from 'vue';
import { Point } from '@/types/Point';
import { useMeasureStore, useSettingStore } from '@/store';
import { alertController } from '@ionic/vue';

const message = ref('This modal example uses triggers to automatically open a modal when the button is clicked.');

const modal = ref<InstanceType<typeof IonModal>>()

const model = defineModel<Point>();


const measureStore = useMeasureStore();
const settingStore = useSettingStore();

const props = defineProps({
    trigger: {
        type: String,
        default: false,
    },
    nr: {
        type: String
    },
    desc: {
        type: String
    },
    easting: {
        type: Number
    },
    northing: {
        type: Number
    },
    altitude: {
        type: Number
    },
    accuracy: {
        type: Number,
        default: 0.05,
    },
    gnss: {
        type: Boolean,
        default: false,
    }
});

let nr = ref<string | undefined>(props.nr);
let desc = ref<string | undefined>(props.desc);
let easting = ref<number | undefined>(props.easting);
let northing = ref<number | undefined>(props.northing);
let altitude = ref<number | undefined>(props.altitude);
let accuracy = ref<number>(props.accuracy ?? 0.05);
let gnss = ref<boolean>(props.gnss);

const emit = defineEmits(['confirm', 'cancel']);

const openModal = () => modal.value?.$el.present();



const selectPoint = (point: Point) => {
    model.value = point;
    confirm();
};

const confirm = () => {

    if (!nr.value || (nr.value in measureStore.points)) {
        alertController.create({
            header: 'Fehler',
            message: 'Punktnummer leer oder bereits vergeben.',
            buttons: ['OK']
        }).then(alert => {
            alert.present();
        });
        return false;
    }
    let p = new Point(nr.value, desc.value)
    measureStore.addPoint(p);

    if ((easting.value && northing.value) || altitude.value) {
        p.addCoordinate({
            source: 'manual',
            epsg: settingStore.getEpsg(),
            x: easting.value,
            y: northing.value,
            z: altitude.value,
            accuracy: accuracy.value
        });
    }

    modal.value?.$el.dismiss(p, 'confirm');
    emit('confirm', p);
};

const cancel = () => {
    modal.value?.$el.dismiss(null, 'cancel');
};

const onOpened = () => {
    console.log('opened');
};

const onWillDismiss = (ev: CustomEvent<OverlayEventDetail>) => {
    if (ev.detail.role === 'confirm') {
        return;
    } else {
        // TODO Nachfragen ob wirklich abbrechen
    }
};
</script>