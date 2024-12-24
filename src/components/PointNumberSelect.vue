<template>
    <ion-select @ionChange="optionSelected($event)" v-bind:placeholder="placeholder" v-if="source" :value>
        <ion-select-option v-if="newPoint" value="new">Neuer Punkt</ion-select-option>
        <ion-select-option v-for="item in source.getFeatures()" :value="item">
            {{ item.get('nr') }}
        </ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';

import { alertController } from '@ionic/vue';

const model = defineModel('value', {
    type: Feature,
    default: null
});


const props = defineProps({
    source: VectorSource<Feature<Point>>,
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
                        if (val.nr && props.source) {
                            let f = new Feature<Point>();
                            f.setProperties({
                                nr: val.nr,
                                description: val.description
                            });
                            props.source.addFeature(f);
                            setTimeout(() => {
                                if (model.value)
                                    model.value = f;
                                emit('input', f);
                            }, 100);

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