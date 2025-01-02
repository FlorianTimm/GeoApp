import { Feature, Map } from "ol";
import { GeoJSON, WFS } from "ol/format";
import GML32 from "ol/format/GML32";
import { Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { transformExtent } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { flurstueckStyle } from "./Style";


export function createAlkisLayer(map: Map): VectorSource[] {
    let flurstueckeStyle = flurstueckStyle();

    const vectorSourceNI = new VectorSource({
        format: new WFS({
            version: '2.0.0',
            featureNS: 'http://repository.gdi-de.org/schemas/adv/produkt/alkis-vereinfacht/2.0',
            featureType: 'Flurstueck',
            gmlFormat: new GML32(),
        }),
        url: (extent) => 'https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach?SERVICE=WFS&' +
            'version=2.0.0&request=GetFeature&typenames=ave:Flurstueck&' +
            'outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&srsname=' + encodeURIComponent(
                'urn:ogc:def:crs:EPSG::4326') + '&' +
            'bbox=' +
            encodeURIComponent(transformExtent(extent, 'EPSG:4326', 'EPSG:25832').join(',') +
                ',urn:ogc:def:crs:EPSG::25832'),
        strategy: bboxStrategy,
    });

    new VectorLayer({
        source: vectorSourceNI,
        map: map,
        minZoom: 19,
        style: flurstueckeStyle
    });

    const vectorSourceHH = new VectorSource({
        format: new GeoJSON(),
        url: function (extent) {
            return (
                'https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht?SERVICE=WFS&' +
                'version=1.1.0&request=GetFeature&typename=ave:Flurstueck&' +
                'outputFormat=' + encodeURIComponent('application/geo+json') + '&srsname=EPSG:4326&' +
                'bbox=' +
                extent.join(',') +
                ',EPSG:4326'
            );
        },
        strategy: bboxStrategy,
    });


    new VectorLayer({
        source: vectorSourceHH,
        map: map,
        minZoom: 19,
        style: flurstueckeStyle
    });

    const vectorSourceSH = new VectorSource({
        format: new WFS({
            version: '2.0.0',
            featureNS: 'https://inspire.ec.europa.eu/schemas/cp/4.0',
            featureType: 'CadastralParcel',
            gmlFormat: new GML32(),
        }),
        /*url: (extent) => 'https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS?SERVICE=WFS&' +
            'version=2.0.0&request=GetFeature&typenames=cp:CadastralParcel&' +
            'outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&srsname=' + encodeURIComponent(
                'urn:ogc:def:crs:EPSG::25832') + '&' +
            'bbox=' +
            encodeURIComponent(transformExtent(extent, 'EPSG:4326', 'EPSG:25832').join(',') +
                ',urn:ogc:def:crs:EPSG::25832'),*/
        loader: (extent) => {

            let url = 'https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS?SERVICE=WFS&' +
                'version=2.0.0&request=GetFeature&typenames=cp:CadastralParcel&' +
                'outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&srsname=' + encodeURIComponent(
                    'urn:ogc:def:crs:EPSG::4326') + '&' +
                'bbox=' +
                encodeURIComponent(transformExtent(extent, 'EPSG:4326', 'EPSG:25832').join(',') +
                    ',urn:ogc:def:crs:EPSG::25832');
            fetch(url)
                .then((response) => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then((response) => {
                    let c = response.getElementsByTagName('geometry');
                    for (let i = 0; i < c.length; i++) {
                        let g = c[i].getElementsByTagName('gml:Polygon');
                        for (let j = 0; j < g.length; j++) {
                            let cs = g[j].getElementsByTagName('gml:posList')[0]?.textContent?.split(' ') ?? [];
                            let coords = [];
                            for (let i = 0; i < cs.length; i += 2) {
                                let ce = [parseFloat(cs[i + 1]), parseFloat(cs[i])];
                                coords.push(ce);
                            }
                            let p = new Polygon([coords]);
                            let f = new Feature(p);
                            vectorSourceSH.addFeature(f);
                        }
                    }
                });
        },
        strategy: bboxStrategy,
    });

    new VectorLayer({
        source: vectorSourceSH,
        map: map,
        minZoom: 19,
        style: flurstueckeStyle
    });
    return [vectorSourceHH, vectorSourceNI, vectorSourceSH];
}