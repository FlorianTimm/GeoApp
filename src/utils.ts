import { CoordinateEntry2D } from '@/types/CoordinateEntry';
import { cot as mjs_cot, sin as mjs_sin, tan as mjs_tan, cos as mjs_cos } from 'mathjs';

export const round = (value: number, decimals: number = 3) => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export const azimuth = (a: xy, b: xy) => {
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let angle = Math.atan2(dx, dy);
    return radToGon(angle);
}

export const radToGon = (angle: number) => {
    angle *= 200 / Math.PI;
    return gonBetween0And400(angle);
}

export const gonToRad = (angle: number) => {
    return angle / 200 * Math.PI;
}

export const distance = (a: xy, b: xy) => {
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export const zenithDistance = (distance: number, heightDifference: number) => {
    return radToGon(Math.atan2(distance, heightDifference))
}

export const gonBetween0And400 = (angle: number) => {
    while (angle < 0) {
        angle += 400;
    }
    while (angle >= 400) {
        angle -= 400;
    }
    return angle;
}

export const gonBetweenMinus200And200 = (angle: number) => {
    while (angle < -200) {
        angle += 400;
    }
    while (angle >= 200) {
        angle -= 400;
    }
    return angle;
}

export const tan = (x: number) => {
    return mjs_tan(gonToRad(x));
    /*const t = Math.tan(gonToRad(x));
    if (Math.abs(t) >= 1E10) {
        return 1E10;
    } else {
        return t;
    }*/
}

export const sin = (x: number) => {
    return mjs_sin(gonToRad(x));
}

export const cos = (x: number) => {
    return mjs_cos(gonToRad(x));
}

export const cot = (x: number) => {
    return mjs_cot(gonToRad(x));
    /*
    const c = cos(x) / sin(x);
    if (Math.abs(c) <= 1E-10) {
        return 0;
    } else if (c >= 1E10 || c <= -1E10) {
        return 1E10;
    } else {
        return c;
    }*/
}

export const azimuth2xy = (location: xy, distance: number, azimuth: number) => {
    return { x: location.x + distance * sin(azimuth), y: location.y + distance * cos(azimuth) };
}

export const format = (value: number | undefined, decimals: number = 3): string => {
    if (value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    return value.toFixed(decimals);
}

export const formatWithSign = (value: number | undefined, decimals: number = 3): string => {
    if (value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    if (value < 0) {
        return '-' + format(-value, decimals);;
    } else if (value > 0) {
        return '+' + format(value, decimals);
    } else {
        // &pm;
        return '±' + format(value, decimals);;
    }

}

export const vertical2height = (v: number, dist: number, h: number = 0): number => {
    if (v > 200) {
        v = 400 - v;
    }

    let hd = cot(v) * dist
    if (dist > 250) {
        hd = (1 + h / 6380000) * hd + dist * dist / (6380000 + h + dist * cos(v) * (0.87));
    }
    return hd
}

type xy = { x: number, y: number } | CoordinateEntry2D;