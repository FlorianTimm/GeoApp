import { Draw as DrawInteraction } from 'ol/interaction';
import { Feature } from 'ol';
import { Point, Geometry } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { Map } from 'ol';
import { Ref, watch } from 'vue';
import { alertController } from '@ionic/vue';
import { DrawEvent } from 'ol/interaction/Draw';
import { useMeasureStore, useSettingStore } from '@/store';
import { transform } from 'ol/proj';
import { Point as StorePoint } from "@/types/Point";


export function createDrawInteraction(map: Map, pointSource: VectorSource<Feature<Point>>, addingPoints: Ref<boolean>) {
    const measureStore = useMeasureStore();
    const settingStore = useSettingStore();
    const draw = new DrawInteraction({
        source: pointSource as unknown as VectorSource<Feature<Geometry>>,
        type: 'Point',
    });
    map.addInteraction(draw);
    draw.setActive(addingPoints.value);

    watch(addingPoints, () => {
        console.log('Adding points', addingPoints.value);
        if (addingPoints.value) {
            draw.setActive(true);
        } else {
            draw.setActive(false);
        }
    });

    draw.on("drawend", (e: DrawEvent) => {
        const geo: Point = e.feature.getGeometry() as Point;
        addingPoints.value = false;
        if (!geo) {
            return;
        }
        const lonLat = geo.getCoordinates();
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
                    role: 'cancel',
                    handler: () => {
                        pointSource.removeFeature(e.feature as Feature<Point>);
                    }
                },
                {
                    text: 'Speichern',
                    handler: (val) => {
                        if (val.nr && !(val.nr in measureStore.points)) {
                            const p = new StorePoint(val.nr, val.description);
                            const coord = transform(lonLat, 'EPSG:4326', settingStore.getProjection());
                            p.addCoordinate({
                                source: 'map',
                                epsg: settingStore.getProjection().getCode(),
                                x: coord[0],
                                y: coord[1],
                                accuracy: (map.getView().getResolution() ?? 1) * 5
                            });
                            measureStore.addPoint(p);
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
    });
}