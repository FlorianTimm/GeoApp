<template>
    <div id="map" class="map"></div>
</template>

<script lang="ts">
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
import ImageTile from "ol/ImageTile";
import TileState from 'ol/TileState';
import Tile from "ol/Tile";


export default {
    name: "Map",
    data(): { mainMap: Map | null; initialCoordinates: [number, number] } {
        return {
            mainMap: null,
            initialCoordinates: [10.0, 53.5],
        };
    },
    props: {
        source: VectorSource,
    },
    mounted() {
        this.myMap();
    },
    methods: {
        tiles(tile: Tile, src: string) {
            axios({
                url: src, //your url
                method: 'GET',
                responseType: 'blob', // important
            }).then((response) => {
                const data = response.data;
                if (data !== undefined) {
                    (<ImageTile>tile).getImage().src = URL.createObjectURL(data);
                    this.saveImage(tile, data);
                } else {
                    tile.setState(TileState.ERROR);
                }
            }).catch((err) => {
                return this.loadTile(tile, src);
            });
        },
        async saveImage(imageTile: Tile, data: Blob) {
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
        },
        async loadTile(imageTile: Tile, src: string) {
            const imagePath = `osm/${imageTile.tileCoord[0]}/${imageTile.tileCoord[1]}/${imageTile.tileCoord[2]}.png`;
            await Filesystem.readFile({
                path: imagePath,
                directory: Directory.Data
            }).then((result) => {
                console.log('Read file', result);
                //imageTile.getImage().src = result.data;
                (<ImageTile>imageTile).getImage().src = URL.createObjectURL(result.data);
            }).catch((err) => {
                console.error('Unable to read file', err);
            });

        },

        myMap() {
            useGeographic();
            this.mainMap = new Map({
                layers: [
                    new TileLayer({
                        source: new OSM({
                            tileLoadFunction: this.tiles
                        }),
                    }),
                ],
                target: "map",
                view: new View({
                    center: this.initialCoordinates,
                    zoom: 12,
                }),
            });


            //this.source.addFeatures([new Feature(new Point(this.initialCoordinates))]);
            const layer = new VectorLayer({
                source: this.source,
            });
            this.mainMap.addLayer(layer);
            setTimeout(() => {
                if (this.mainMap)
                    this.mainMap.updateSize();
            }, 500);

            this.mainMap.on("click", (e) => {
                const lonLat = e.coordinate;
                //source.clear();
                if (this.source)
                    this.source.addFeatures([new Feature(new Point(lonLat))]);
            });
        },
    },
};
</script>

<style>
.map {
    min-height: 100px;
    height: 100%;
    width: 100%;
}
</style>