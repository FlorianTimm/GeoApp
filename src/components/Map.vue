<template>
    <div id="map" class="map"></div>
</template>

<script lang="ts" setup>
import { useMeasureStore, useSettingStore, useStore } from "@/store";
import { TheodoliteMeasure } from "@/types/TheodoliteMeasure";
import { azi2xy } from "@/utils";
import { Feature, Geolocation, Map, View } from "ol";
import { Coordinate } from 'ol/coordinate';
import { LineString, Point } from "ol/geom";
import { Snap as SnapInteraction } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { fromLonLat, transform, useGeographic } from "ol/proj";
import { OSM, Vector as VectorSource } from "ol/source";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { onMounted } from "vue";
import { createAlkisLayer } from "./MapParts/AlkisLayer";
import { createDrawInteraction } from "./MapParts/DrawInteraction";
import { tiles } from "./MapParts/OfflineOSM";
import { createSelectInteraction } from "./MapParts/SelectInteracion";
import { pointStyle } from "./MapParts/Style";

import "ol/ol.css";

const measureStore = useMeasureStore();
const settingStore = useSettingStore();
const store = useStore();

const pointSource = new VectorSource<Feature<Point>>();
const measureSource = new VectorSource<Feature<LineString>>();
let map: Map;

let mapBewegt = false;

measureStore.$subscribe(() => {
    storePoints2LayerSource();
})

const addingPoints = defineModel<boolean>({ required: true, default: false })

const props = defineProps({
    initialCoordinates: {
        default: [10, 53.5],
        type: Array as () => Coordinate
    }
});


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
            center: fromLonLat(props.initialCoordinates, 'EPSG:25832'),
            projection: 'EPSG:25832',
            zoom: 12,
        }),
    });

    const alkisSources = createAlkisLayer(map);

    new VectorLayer({
        map: map,
        source: measureSource,
    });

    //this.source.addFeatures([new Feature(new Point(this.initialCoordinates))]);
    const pointLayer = new VectorLayer({
        source: pointSource,
        map: map,
        style: pointStyle
    });

    createSelectInteraction(map, pointLayer);

    createDrawInteraction(map, pointSource, addingPoints);

    const geolocation = new Geolocation({
        // enableHighAccuracy must be set to true to have the heading value.
        trackingOptions: {
            enableHighAccuracy: true,
        },
        projection: settingStore.getProjection(),
    });

    const accuracyFeature = new Feature();
    geolocation.on('change:accuracyGeometry', function () {
        const geom = geolocation.getAccuracyGeometry();
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

        positionFeature.setGeometry(new Point(coordinates));
        if (firstGeolocation) {
            map.getView().setCenter(coordinates);
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

    map.on('moveend', () => {
        mapBewegt = true;
    });

    alkisSources.forEach((vs) => {
        let snap = new SnapInteraction({
            source: vs,
            pixelTolerance: 20,
            edge: false,
            vertex: true
        });
        map.addInteraction(snap);
        snap.setActive(true);
    });


});

const zoomToExtent = () => {
    map.getView().fit(pointSource.getExtent(), {
        padding: [30, 30, 30, 30],
        duration: 500,
        maxZoom: 19,
    });
}
const slideToLocation = () => {
    if (store.position)
        map.getView().animate({
            center: store.position,
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
                const s = measureStore.getPoint(t.pointNumber).get2DCoordinate();
                t.measures.forEach((entry) => {
                    const e = measureStore.getPoint(entry.nr).get2DCoordinate();
                    if (!s || !e) {
                        return;
                    }
                    const f = new Feature(new LineString([s, e]));
                    measureSource.addFeature(f);
                });

                let c = measureStore.getPoint(t.pointNumber).get2DCoordinate();
                if (!c || !t.orientation || !s) {
                    return;
                }
                let p = azi2xy({ x: c[0], y: c[1] }, 5, t.orientation)
                let pt = [p.x, p.y];
                const f = new Feature(new LineString([s, pt]));
                f.setStyle(new Style({
                    stroke: new Stroke({
                        color: '#f00',
                        width: 2,
                    }),
                }));
                measureSource.addFeature(f);

            }
        });
    }

    Object.values(measureStore.getPoints()).forEach((pd) => {
        const c = pd.get2DCoordinate();
        if (!c) {
            return;
        }
        const p = new Feature(new Point(c));
        p.set('nr', pd.nr);
        pointSource.addFeature(p);
    });

    if (!settingStore.geolocation && !mapBewegt) {
        zoomToExtent();
    }
}
</script>

<style>
.map {
    min-height: 100px;
    height: 100%;
    width: 100%;
}
</style>