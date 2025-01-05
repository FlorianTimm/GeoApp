import { CoordinateEntry2D } from '@/types/CoordinateEntry';

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
    const t = Math.tan(gonToRad(x));
    if (Math.abs(t) < 1E-10) {
        return 0;
    } else if (t >= 1E10 || t <= -1E10) {
        return 1E10;
    } else {
        return t;
    }
}

export const sin = (x: number) => {
    return Math.sin(gonToRad(x));
}

export const cos = (x: number) => {
    return Math.cos(gonToRad(x));
}

export const cot = (x: number) => {
    const c = cos(x) / sin(x);
    if (Math.abs(c) <= 1E-10) {
        return 0;
    } else if (c >= 1E10 || c <= -1E10) {
        return 1E10;
    } else {
        return c;
    }
}

export const azimuth2xy = (location: xy, distance: number, azimuth: number) => {
    return { x: location.x + distance * sin(azimuth), y: location.y + distance * cos(azimuth) };
}

export const format = (value: number | null | undefined, decimals: number = 3): string => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    return value.toFixed(decimals);
}

export const formatWithSign = (value: number | null | undefined, decimals: number = 3): string => {
    if (value === null || value === undefined) {
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

export const vertical2height = (v: number, dist: number): number => {
    return cot(v) * dist
}

type xy = { x: number, y: number } | CoordinateEntry2D;