<template>
    <div id="map" class="map"></div>
</template>

<script lang="ts" setup>
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { useGeographic } from "ol/proj";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import axios from "axios";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Coordinate } from 'ol/coordinate';
import ImageTile from "ol/ImageTile";
import TileState from 'ol/TileState';
import Tile from "ol/Tile";
import { alertController, IonAlert } from '@ionic/vue';
import { onMounted } from "vue";
import Geolocation from "ol/Geolocation";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";


const props = defineProps({
    source: VectorSource<Feature<Point>>,
    initialCoordinates: {
        default: [10, 53.5],
        type: Array as () => Coordinate
    },
});


useGeographic();
onMounted(() => {
    console.log(props.source);
    const map = new Map({
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
            zoom: 12,
        }),
    });




    //this.source.addFeatures([new Feature(new Point(this.initialCoordinates))]);
    const layer = new VectorLayer({
        source: props.source,
    });
    map.addLayer(layer);

    map.on("click", (e) => {
        const lonLat = e.coordinate;
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
                            let f = new Feature(new Point(lonLat));
                            f.setProperties({
                                nr: val.nr,
                                description: val.description
                            });
                            props.source.addFeature(f);
                            return true;
                        }
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
        //projection: map.getView().getProjection(),
    });

    const accuracyFeature = new Feature();
    geolocation.on('change:accuracyGeometry', function () {
        const geom = geolocation.getAccuracyGeometry();
        if (geom) {
            accuracyFeature.setGeometry(geom);
        }
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

    geolocation.on('change:position', function () {
        const coordinates = geolocation.getPosition();
        positionFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
        console.log('Position changed', coordinates);
        map.getView().setCenter(coordinates);
    });

    const vl = new VectorLayer({
        map: map,
        source: new VectorSource({
            features: [accuracyFeature, positionFeature],
        }),
    });
    geolocation.setTracking(true);

});

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