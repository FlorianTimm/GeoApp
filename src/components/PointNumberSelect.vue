<template>
    <ion-select @ionChange="optionSelected($event)" v-bind:placeholder="placeholder" v-model="model">
        <ion-select-option v-if="newPoint" value="new">Neuer Punkt</ion-select-option>
        <ion-select-option v-for="item in points" :value="item">
            {{ item.nr }}
        </ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue';
import { alertController } from '@ionic/vue';
import { useMeasureStore } from '@/store';
import { Point } from "@/types/Point";
import { storeToRefs } from 'pinia';

const model = defineModel();

const store = useMeasureStore();
const { points, measurements } = storeToRefs(store);

defineProps({
    newPoint: Boolean,
    placeholder: {
        type: String,
        default: 'Punkt auswählen'
    }
})

const emit = defineEmits(['input']);

const optionSelected = (e: CustomEvent) => {

    if (e.detail.value == 'new') {
        alertController.create({
            header: 'Neuer Punkt',
            message: 'Bitte geben Sie die Informationen für den neuen Punkt ein.',
            inputs: [
                {
                    name: 'nr',
                    type: 'number',
                    placeholder: 'Punktnummer'
                },
                {
                    name: 'description',
                    type: 'text',
                    placeholder: 'Beschreibung'
                },
                {
                    name: 'local',
                    type: 'checkbox',
                    label: 'Aktuelle Position verwenden'
                }
            ],
            buttons: [
                {
                    text: 'Abbrechen',
                    role: 'cancel'
                },
                {
                    text: 'Speichern',
                    handler: (val) => {
                        if (val.nr && !(val.nr in store.points)) {
                            let p = new Point(val.nr, val.description)
                            if (val.local) {
                                //TODO: get current position
                            }
                            store.addPoint(p); 
                            model.value = p;
                            emit('input', p);
                            return true;
                        }
                        alertController.create({
                            header: 'Fehler',
                            message: 'Punktnummer leer oder bereits vergeben.',
                            buttons: ['OK']
                        }).then(alert => {
                            alert.present();
                        });
                        return false;
                    }
                }
            ],
        }).then(alert => {
            alert.present();
        });
    } else {
        emit('input', e.detail.value);
        console.log(e.detail.value);
    }
}

</script>