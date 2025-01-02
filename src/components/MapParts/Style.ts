import { Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import { MultiPoint, MultiPolygon, Polygon } from "ol/geom";
import { FeatureLike } from "ol/Feature";


export function pointStyle(feature: FeatureLike) {
    return new Style({
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
    })
}

export function flurstueckStyle() {
    return [new Style({
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 1.0)',
            width: 1,
        })
    }),
    new Style({
        image: new RegularShape({
            points: 4,
            radius: 7,
            rotation: Math.PI / 4,
            fill: new Fill({
                color: 'white',
            }),
            stroke: new Stroke({
                color: 'black',
                width: 0.75,
            }),
        }),
        geometry: function (feature) {
            // return the coordinates of the first ring of the polygon
            try {
                const geo = feature?.getGeometry();
                console.log(geo?.getType());
                if (!geo) {
                    return;
                }

                switch (geo.getType()) {
                    case 'Polygon':
                        return new MultiPoint((geo as Polygon).getCoordinates()[0]);
                    case 'MultiPolygon':
                        return new MultiPoint((geo as MultiPolygon).getCoordinates()[0][0]);
                }
            } catch (e) {
                return;
            }

        },
    }),
    ];
}