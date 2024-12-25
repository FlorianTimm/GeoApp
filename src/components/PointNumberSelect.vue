<template>
    <ion-select @ionChange="optionSelected($event)" v-bind:placeholder="placeholder" v-if="points" :value>
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
import { storeToRefs } from 'pinia';

const model = defineModel('value', {
    type: Object,
    // type: Point,
    default: null
});


const store = useMeasureStore();
const { points, measurements } = storeToRefs(store);

const props = defineProps({
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
                        if (val.nr) {
                            let p = {
                                nr: val.nr,
                                description: val.description,
                                coordinates: []
                            };
                            store.points.push(p);
                            //model.value = p;
                            emit('input', p);

                        }
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