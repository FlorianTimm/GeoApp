<template>
    <div id="map" class="map"></div>
</template>

<script lang="ts" setup>
import { useMeasureStore, useSettingStore, useStore } from "@/store";
import { Point as StorePoint } from "@/types/Point";
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { actionSheetController, alertController, IonIcon } from '@ionic/vue';
import axios from "axios";
import { Coordinate } from 'ol/coordinate';
import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import { LineString, Point } from "ol/geom";
import ImageTile from "ol/ImageTile";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import "ol/ol.css";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Tile from "ol/Tile";
import TileState from 'ol/TileState';
import View from "ol/View";
import { onMounted } from "vue";
import { Select } from 'ol/interaction';
import { transform } from 'ol/proj';
import Text from "ol/style/Text";
import RegularShape from "ol/style/RegularShape";
import { TheodoliteMeasure } from "@/types/TheodoliteMeasure";

const measureStore = useMeasureStore();
const settingStore = useSettingStore();
const store = useStore();

const pointSource = new VectorSource<Feature<Point>>();
const measureSource = new VectorSource<Feature<LineString>>();
let map: Map;

measureStore.$subscribe(() => {
    storePoints2LayerSource();
})

const props = defineProps({
    initialCoordinates: {
        default: [10, 53.5],
        type: Array as () => Coordinate
    },
});


useGeographic();
onMounted(() => {
    map = new Map({
        layers: [
            new TileLayer({
                source: new OSM({
                    tileLoadFunction: tiles
                }),
            }),
        ],
        target: "map",
        view: new View({
            center: props.initialCoordinates,
            projection: 'EPSG:3857',
            zoom: 12,
        }),
    });

    new VectorLayer({
        map: map,
        source: measureSource,
    });

    //this.source.addFeatures([new Feature(new Point(this.initialCoordinates))]);
    const pointLayer = new VectorLayer({
        source: pointSource,
        map: map,
        style: (feature) => new Style({
            image: new RegularShape({
                fill: new Fill({
                    color: '#888',
                }),
                stroke: new Stroke({
                    color: '#000',
                    width: 2,
                }),
                points: 3,
                radius: 7,

                angle: 0,
            }),
            text: new Text({
                text: feature.get('nr'),
                font: '15px Calibri,sans-serif',
                textBaseline: 'bottom',
                textAlign: 'start',
                offsetX: 3,
                offsetY: -3,
                stroke: new Stroke({
                    color: '#fff',
                    width: 2,
                }),
            }),
        }),
    });
    const selectInteraction = new Select({
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
        console.log(f);
        const nr = f.get('nr');
        console.log(nr);
        const point = measureStore.getPoint(nr);
        console.log(point);
        const coord = point.getCoordinate();
        let text = ''
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
    map.on("click", (e) => {
        const lonLat = e.coordinate;
        if (map.getFeaturesAtPixel(e.pixel, {
            layerFilter: (layer) => layer === pointLayer,
        }).length > 0) {
            return;
        }
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

    const geolocation = new Geolocation({
        // enableHighAccuracy must be set to true to have the heading value.
        trackingOptions: {
            enableHighAccuracy: true,
        },
        projection: settingStore.getProjection(),
    });

    const accuracyFeature = new Feature();
    geolocation.on('change:accuracyGeometry', function () {
        const geom = geolocation.getAccuracyGeometry()?.transform(settingStore.getProjection(), 'EPSG:4326');
        if (geom) {
            accuracyFeature.setGeometry(geom);
        }
        store.setAccuracy(geolocation.getAccuracy() ?? null);
    });

    const positionFeature = new Feature();
    positionFeature.setStyle(
        new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                    color: '#3399CC',
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2,
                }),
            }),
        }),
    );

    let firstGeolocation = true;
    const positionChanged = () => {
        const coordinates = geolocation.getPosition();
        const z = geolocation.getAltitude()
        console.log('Position changed', coordinates);
        if (!coordinates) {
            return;
        }
        const coord4326 = transform(coordinates, settingStore.getProjection(), 'EPSG:4326');
        positionFeature.setGeometry(new Point(coord4326));
        if (firstGeolocation) {
            map.getView().setCenter(coord4326);
            firstGeolocation = false;
        }
        if (coordinates && z !== undefined) {
            store.setPosition([...coordinates, z]);
        } else if (coordinates) {
            store.setPosition(coordinates);
        }
    };
    geolocation.on('change:position', positionChanged);
    geolocation.on('change:altitude', positionChanged);


    const vl = new VectorLayer({
        map: map,
        source: new VectorSource({
            features: [accuracyFeature, positionFeature],
        }),
    });

    geolocation.setTracking(settingStore.geolocation);
    vl.setVisible(settingStore.geolocation);

    settingStore.$subscribe(() => {
        storePoints2LayerSource();
        geolocation.setTracking(settingStore.geolocation);
        vl.setVisible(settingStore.geolocation);
        map.render();
        firstGeolocation = true;
    });

    storePoints2LayerSource();

});

const zoomToExtent = () => {
    map.getView().fit(pointSource.getExtent(), {
        padding: [30, 30, 30, 30],
        duration: 500,
    });
}
const slideToLocation = () => {
    if (store.position)
        map.getView().animate({
            center: transform(store.position, settingStore.getProjection(), 'EPSG:4326'),
            duration: 500,
        })
};

defineExpose({ zoomToExtent, slideToLocation });

function storePoints2LayerSource() {
    pointSource.clear();
    measureSource.clear();

    if (settingStore.getShowMeasurements()) {
        measureStore.getMeasurements().forEach((m) => {
            if (m.type == 'theodolite') {
                const t = m as TheodoliteMeasure;
                const s = measureStore.getPoint(t.pointNumber).get2DCoordinate('EPSG:4326');
                t.measures.forEach((entry) => {
                    const e = measureStore.getPoint(entry.nr).get2DCoordinate('EPSG:4326');
                    if (!s || !e) {
                        return;
                    }
                    const f = new Feature(new LineString([s, e]));
                    measureSource.addFeature(f);
                });
            }
        });
    }

    Object.values(measureStore.getPoints()).forEach((pd) => {
        const c = pd.get2DCoordinate('EPSG:4326');
        if (!c) {
            return;
        }
        const p = new Feature(new Point(c));
        p.set('nr', pd.nr);
        pointSource.addFeature(p);
    });
}

function tiles(tile: Tile, src: string) {
    axios({
        url: src, //your url
        method: 'GET',
        responseType: 'blob', // important
    }).then((response) => {
        const data = response.data;
        if (data !== undefined) {
            (<HTMLImageElement>(<ImageTile>tile).getImage()).src = URL.createObjectURL(data);
            saveImage(tile, data);
        } else {
            tile.setState(TileState.ERROR);
        }
    }).catch((err) => {
        return loadTile(tile, src);
    });
}
async function saveImage(imageTile: Tile, data: Blob) {
    const imagePath = `osm/${imageTile.tileCoord[0]}/${imageTile.tileCoord[1]}/${imageTile.tileCoord[2]}.png`;
    await Filesystem.mkdir({
        path: `osm/${imageTile.tileCoord[0]}/${imageTile.tileCoord[1]}/`,
        directory: Directory.Data,
        recursive: true,
    }).then((result) => {
        console.log('Directory created', result);
    }).catch((err) => {
        console.log('Unable to create directory', err);
    });
    Filesystem.writeFile({
        path: imagePath,
        data: data,
        directory: Directory.Data,
        encoding: Encoding.UTF8
    })
}

async function loadTile(imageTile: Tile, src: string) {
    const imagePath = `osm/${imageTile.tileCoord[0]}/${imageTile.tileCoord[1]}/${imageTile.tileCoord[2]}.png`;
    await Filesystem.readFile({
        path: imagePath,
        directory: Directory.Data
    }).then((result) => {
        console.log('Read file', result);
        //imageTile.getImage().src = result.data;
        (<HTMLImageElement>(<ImageTile>imageTile).getImage()).src = URL.createObjectURL(<Blob>result.data);
    }).catch((err) => {
        console.error('Unable to read file', err);
    });

}


</script>

<style>
.map {
    min-height: 100px;
    height: 100%;
    width: 100%;
}
</style>