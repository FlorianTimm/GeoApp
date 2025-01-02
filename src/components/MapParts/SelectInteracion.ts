import { actionSheetController, alertController } from "@ionic/vue";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Select as SelectInteraction } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Map } from "ol";
import { useMeasureStore } from "@/store";

export function createSelectInteraction(map: Map, pointLayer: VectorLayer<VectorSource<Feature<Point>>, Feature<Point>>): SelectInteraction {
    const measureStore = useMeasureStore();
    const selectInteraction = new SelectInteraction({
        layers: [pointLayer],
    });
    map.addInteraction(selectInteraction);
    selectInteraction.on('select', (e) => {
        console.log(e);
    });
    selectInteraction.setActive(true);
    selectInteraction.on('select', (e) => {
        console.log(e);
        if (e.selected.length === 0) {
            return;
        }
        const f = e.selected[0];
        const nr = f.get('nr');
        const point = measureStore.getPoint(nr);
        const coord = point.getCoordinate();
        let text = '';
        if (measureStore.points[nr].description)
            text += 'Description: ' + measureStore.points[nr].description + '; ';
        if (coord) {
            text += 'X: ' + coord.x?.toFixed(3) + '; ' +
                'Y: ' + coord.y?.toFixed(3) + ';\n' +
                'Accuracy: ' + coord.accuracy.toFixed(3) + 'm';
        }
        actionSheetController.create({
            header: 'Point ' + nr,
            subHeader: text,
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {
                        alertController.create({
                            header: 'Edit Point',
                            message: 'Please enter the new information for the point.',
                            inputs: [
                                {
                                    name: 'description',
                                    type: 'text',
                                    placeholder: 'Description',
                                    value: point.description
                                }
                            ],
                            buttons: [
                                {
                                    text: 'Cancel',
                                    role: 'cancel'
                                },
                                {
                                    text: 'Save',
                                    handler: (val) => {
                                        point.description = val.description;
                                    }
                                }
                            ]
                        }).then(alert => {
                            alert.present();
                        });
                    }
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {

                        alertController.create({
                            header: 'Point ' + nr,
                            message: 'Do you really want to delete point ' + nr + '?',
                            buttons: [
                                {
                                    text: 'Close',
                                    role: 'cancel'
                                },
                                {
                                    text: 'Delete',
                                    handler: () => {
                                        measureStore.removePoint(nr);
                                    }
                                }
                            ]
                        }).then(alert => {
                            alert.present();
                        });

                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        }).then(actionSheet => {
            actionSheet.present();
        });
    });

    return selectInteraction;
}