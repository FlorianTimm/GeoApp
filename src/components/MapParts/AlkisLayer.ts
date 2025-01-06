import { Feature, Map } from "ol";
import { GeoJSON, WFS } from "ol/format";
import GML32 from "ol/format/GML32";
import { Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import VectorSource from "ol/source/Vector";
import { flurstueckStyle, buildingStyle } from "./Style";
import { useSettingStore } from "@/store";


export function createAlkisLayer(): { source: VectorSource[], layer: VectorLayer[] } {
    let layer = [];
    const epsg = useSettingStore().getEpsg();

    const sourceNiFlurstuecke = new VectorSource({
        format: new WFS({
            version: '2.0.0',
            featureNS: 'http://repository.gdi-de.org/schemas/adv/produkt/alkis-vereinfacht/2.0',
            featureType: 'Flurstueck',
            gmlFormat: new GML32(),
        }),
        url: (extent) => 'https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach?SERVICE=WFS&' +
            'version=2.0.0&request=GetFeature&typenames=ave:Flurstueck&' +
            'outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&srsname=' + epsg + '&' +
            'bbox=' + extent.join(',') + ',' + epsg,
        strategy: bboxStrategy,
    });

    layer.push(new VectorLayer({
        source: sourceNiFlurstuecke,
        minZoom: 19,
        style: flurstueckStyle
    }));

    const sourceNiGebaeude = new VectorSource({
        format: new WFS({
            version: '2.0.0',
            featureNS: 'http://repository.gdi-de.org/schemas/adv/produkt/alkis-vereinfacht/2.0',
            featureType: 'GebaeudeBauwerk',
            gmlFormat: new GML32(),
        }),
        url: (extent) => 'https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach?SERVICE=WFS&' +
            'version=2.0.0&request=GetFeature&typenames=ave:GebaeudeBauwerk&' +
            'outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&srsname=' + epsg + '&' +
            'bbox=' + extent.join(',') + ',' + epsg,
        strategy: bboxStrategy,
    });

    layer.push(new VectorLayer({
        source: sourceNiGebaeude,
        minZoom: 19,
        style: buildingStyle
    }));

    const sourceHhFlurstuecke = new VectorSource({
        format: new GeoJSON(
            {
                dataProjection: 'EPSG:25832'
            }
        ),
        url: (extent) =>
            'https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht?SERVICE=WFS&' +
            'version=1.1.0&request=GetFeature&typename=ave:Flurstueck&' +
            'outputFormat=' + encodeURIComponent('application/geo+json') + '&srsname=' + epsg + '&' +
            'bbox=' + extent.join(',') + ',' + epsg,
        strategy: bboxStrategy,
    });


    layer.push(new VectorLayer({
        source: sourceHhFlurstuecke,
        minZoom: 19,
        style: flurstueckStyle
    }));

    const sourceHhGebaeude = new VectorSource({
        format: new GeoJSON(
            {
                dataProjection: 'EPSG:25832'
            }
        ),
        url: (extent) =>
            'https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht?SERVICE=WFS&' +
            'version=1.1.0&request=GetFeature&typename=ave:GebaeudeBauwerk&' +
            'outputFormat=' + encodeURIComponent('application/geo+json') + '&srsname=' + epsg + '&' +
            'bbox=' + extent.join(',') + ',' + epsg,
        strategy: bboxStrategy,
    });


    layer.push(new VectorLayer({
        source: sourceHhGebaeude,
        minZoom: 19,
        style: buildingStyle
    }));

    const sourceShFlurstuecke = new VectorSource({
        /*format: new WFS({
            version: '2.0.0',
            featureNS: 'https://inspire.ec.europa.eu/schemas/cp/4.0',
            featureType: 'CadastralParcel',
            gmlFormat: new GML32(),
        }),
        /*url: (extent) => 'https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS?SERVICE=WFS&' +
                'version=2.0.0&request=GetFeature&typenames=cp:CadastralParcel&' +
                'outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&srsname=' + epsg + '&' +
                'bbox=' + extent.join(',') + ',' + epsg,*//*
loader: (extent) => {
    let url = 'https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS?SERVICE=WFS&' +
        'version=2.0.0&request=GetFeature&typenames=cp:CadastralParcel&' +
        'outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&srsname=' + epsg + '&' +
        'bbox=' + extent.join(',') + ',' + epsg;
    loadSHwfs(url, sourceShFlurstuecke);
},
strategy: bboxStrategy,*/
    });

    layer.push(
        new VectorLayer({
            source: sourceShFlurstuecke,
            minZoom: 19,
            style: flurstueckStyle
        }));



    const sourceShGebaeude = new VectorSource({
        format: new WFS({
            version: '2.0.0',
            featureNS: 'http://inspire.ec.europa.eu/schemas/bu-base/4.0',
            featureType: 'ave:GebaeudeBauwerk',
            gmlFormat: new GML32(),
        }),
        loader: (extent) => {
            let url = 'https://service.gdi-sh.de/WFS_SH_ALKIS_vereinf_OpenGBD?service=wfs&version=2.0.0&request=getFeature&' +
                'typeNames=GebaeudeBauwerk&' +
                'storedQuery_id=http://repository.gdi-de.org/query/adv/produkt/alkis-vereinfacht/2.0/ave-by-bbox' +
                '&outputFormat=' + encodeURIComponent('application/gml+xml; version=3.2') + '&CRS=' + epsg + '&' +
                'x1=' + extent[0] + '&y1=' + extent[1] + '&x2=' + extent[2] + '&y2=' + extent[3];
            loadSHwfs(url, sourceShFlurstuecke, sourceShGebaeude);
        },
        strategy: bboxStrategy,
    });

    layer.push(
        new VectorLayer({
            source: sourceShGebaeude,
            minZoom: 19,
            style: buildingStyle
        }));

    return {
        source: [sourceHhFlurstuecke, sourceNiFlurstuecke, sourceShFlurstuecke, sourceHhGebaeude, sourceShGebaeude, sourceNiGebaeude],
        layer: layer
    };
}

function loadSHwfs(url: string, flstSource: VectorSource, buildingSource: VectorSource) {
    fetch(url)
        .then((response) => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((response) => {
            const flst = response.getElementsByTagName('Flurstueck')
            for (let i = 0; i < flst.length; i++) {
                findPolygon(flst[i], flstSource);
            }

            const geb = response.getElementsByTagName('GebaeudeBauwerk')
            for (let i = 0; i < geb.length; i++) {
                findPolygon(geb[i], buildingSource);
            }
        });
}
function findPolygon(response: Element, vectorSource: VectorSource) {
    let id = response.getAttribute('gml:id');
    let g = response.getElementsByTagName('gml:Polygon');
    for (let j = 0; j < g.length; j++) {
        let cs = g[j].getElementsByTagName('gml:posList')[0]?.textContent?.split(' ') ?? [];
        let coords = [];
        for (let i = 0; i < cs.length; i += 2) {
            let ce = [parseFloat(cs[i]), parseFloat(cs[i + 1])];
            coords.push(ce);
        }
        let p = new Polygon([coords]);
        let f = new Feature(p);
        if (id) f.setId(id);
        vectorSource.addFeature(f);
    }
}

