import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import axios from "axios";
import ImageTile from "ol/ImageTile";
import Tile from "ol/Tile";
import TileState from 'ol/TileState';


export function tiles(tile: Tile, src: string) {
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