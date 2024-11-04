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
        myMap() {
            useGeographic();
            this.mainMap = new Map({
                layers: [
                    new TileLayer({
                        source: new OSM(),
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