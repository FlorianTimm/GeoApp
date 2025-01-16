import { useSettingStore } from '@/store';
import { CoordinateEntry } from '@/types/CoordinateEntry';
import { Measurement } from '@/types/Measurement';
import { Point } from '@/types/Point';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { azimuth, gonBetween0And400, gonBetweenMinus200And200, gonToRad, zenithDistance } from '@/utils';
import { inv, transpose, multiply, subtract, diag, add, norm, size, sqrt, divide } from 'mathjs';

export class Adjustment {
    private measurements: Measurement[];
    private points: { [nr: string]: Point }

    private nurNeupunkte = true;

    private x0_filtered: number[] = [];
    private x0_org: number[] = [];
    private A: number[][] = [];
    private l: number[] = [];
    private l0: number[] = [];
    private p: number[] = [];
    private dl: number[] = [];
    private dx: number[] = [];
    private P: number[][] = [];
    private s0: number = 0;
    private Sx: number[] = [];
    private Qx: number[][] = [];
    private Va: number[] = [];

    private RHO = 200 / Math.PI;

    private successful = false;

    private l_isAngle: boolean[] = [];
    private l_filter: boolean[] = [];  // true: adjustment for value is impossible
    private l_measurements: {
        [index: number]: {
            measure: { [index: number]: { v?: number, hz?: number, dist?: number } }, ih?: number
        }
    } = {};
    private l_points: { [nr: string]: { x?: number, y?: number, z?: number } } = {};

    private x_points: { [nr: string]: { x?: number, y?: number, z?: number } } = {};
    private x_measurements: { [measure: number]: { o?: number, ih?: number } } = {};
    private x_isAngle: boolean[] = [];
    private x_filter: boolean[] = [];  // true: adjustment for value is impossible
    private x_filter2org: number[] = [];
    private l_filter2org: number[] = [];

    constructor(measurements: Measurement[], points: { [nr: string]: Point }) {
        this.measurements = measurements;
        this.points = points;
    }

    public adjust(nurNeupunkte = true) {
        this.createX0Vector();
        return this.calculate();
    }

    private createX0Vector() {
        this.x0_filtered = [];
        this.x0_org = [];
        this.A = [];
        this.l = [];
        this.l0 = [];
        this.p = [];
        this.l_isAngle = [];
        this.x_isAngle = [];
        this.x_points = {};
        this.x_measurements = {};
        this.x_filter = [];
        this.l_filter = [];

        for (let nr in this.points) {
            let c = this.points[nr].getCoordinate();
            if (!c) continue;
            this.x_points[nr] = {};
            if (c.x !== undefined) {
                this.x0_org.push(c.x);
                this.x_points[nr].x = this.x0_org.length - 1;
                this.x_isAngle.push(false);
            }
            if (c.y !== undefined) {
                this.x0_org.push(c.y);
                this.x_points[nr].y = this.x0_org.length - 1;
                this.x_isAngle.push(false);
            }
            if (c.z !== undefined) {
                this.x0_org.push(c.z);
                this.x_points[nr].z = this.x0_org.length - 1;
                this.x_isAngle.push(false);
            }
        }

        this.measurements.forEach((m, i) => {
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                const entry: { o?: number, ih?: number } = {};
                this.x0_org.push(gonToRad(m.orientation ?? 0));
                entry.o = this.x0_org.length - 1;
                this.x_isAngle.push(true);

                if (m.instrumentHeight !== undefined) {
                    this.x0_org.push(m.instrumentHeight);
                    this.x_isAngle.push(false);
                    entry.ih = this.x0_org.length - 1;
                }
                this.x_measurements[i] = entry;
            }
        });
        this.x0_filtered = [...this.x0_org];
        this.x_filter2org = this.x0_org.map((_, i) => i)
        return this.x0_filtered
    }

    private createA_l0_dl_l() {
        this.A = [];
        this.l = [];
        this.l0 = [];
        this.p = [];
        this.l_isAngle = [];
        this.l_measurements = [];
        this.l_points = {};

        this.measurements.forEach((m, i) => {
            let entry: { measure: { [index: number]: { v?: number, hz?: number, dist?: number } }, ih?: number } = { measure: {} };
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                const s = this.x_points[m.pointNumber];
                const sx = s.x;
                const sy = s.y;
                const sz = s.z;
                if (sx === undefined || sy === undefined) return;

                if (m.instrumentHeight !== undefined && this.x_measurements[i].ih !== undefined) {
                    const row = new Array(this.x0_org.length).fill(0);
                    this.l0.push(this.x0_org[this.x_measurements[i].ih]);
                    this.l.push(m.instrumentHeight);
                    entry.ih = this.l0.length - 1;
                    this.l_isAngle.push(true);
                    this.p.push(0.02);
                    this.A.push(row);
                }

                m.measures.forEach((measure, n) => {
                    if (measure.active === false) return;
                    if (this.points[measure.nr].getCoordinate()?.sourceId?.includes(m.id)) return;
                    let subentry = { v: measure.v, hz: measure.hz, dist: measure.distance };
                    const t = this.x_points[measure.nr];
                    const tx = t.x;
                    const ty = t.y;
                    const tz = t.z;
                    if (tx === undefined || ty === undefined) return;
                    const dx = this.x0_org[tx] - this.x0_org[sx];
                    const dy = this.x0_org[ty] - this.x0_org[sy];
                    const dist2 = dx * dx + dy * dy;
                    const dist = Math.sqrt(dist2);
                    // Hz
                    if (measure.hz !== undefined && this.x_measurements[i].o !== undefined) {
                        const row = new Array(this.x0_org.length).fill(0);

                        row[sx] = - dy / dist2 * this.RHO;
                        row[sy] = dx / dist2 * this.RHO;
                        row[tx] = dy / dist2 * this.RHO;
                        row[ty] = - dx / dist2 * this.RHO;
                        row[this.x_measurements[i].o] = -1;
                        let azi = azimuth({ x: this.x0_org[sx], y: this.x0_org[sy] }, { x: this.x0_org[tx], y: this.x0_org[ty] });
                        azi -= this.x0_org[this.x_measurements[i].o];
                        azi = gonBetween0And400(azi);
                        this.l0.push(azi);
                        this.l.push(measure.hz);
                        subentry.hz = this.l0.length - 1;
                        this.l_isAngle.push(true);
                        this.p.push(0.00025);
                        this.A.push(row);
                    }
                    // V
                    if (measure.v !== undefined && sz !== undefined && tz !== undefined && this.x_measurements[i].ih !== undefined) {
                        const row = new Array(this.x0_org.length).fill(0);
                        const dz = this.x0_org[tz] - this.x0_org[sz];
                        const ih = this.x0_org[this.x_measurements[i].ih];
                        row[sz] = -1;
                        row[tz] = 1;
                        row[this.x_measurements[i].ih] = -1;
                        this.l0.push(zenithDistance(dist - ih + (measure.targetHeight ?? 0), dz));
                        this.l.push(measure.v);
                        subentry.v = this.l0.length - 1;
                        this.l_isAngle.push(true);
                        this.p.push(0.00025);
                        this.A.push(row);
                    }
                    // distance
                    if (measure.distance !== undefined) {
                        const row = new Array(this.x0_org.length).fill(0);
                        row[sx] = -dx / dist;
                        row[sy] = -dy / dist;
                        row[tx] = dx / dist;
                        row[ty] = dy / dist;
                        this.l0.push(dist);
                        this.l_isAngle.push(false);
                        this.l.push(measure.distance);
                        subentry.dist = this.l0.length - 1;
                        this.p.push(0.005);
                        this.A.push(row);
                    }
                    entry.measure[n] = subentry;
                });
            }
            this.l_measurements[i] = entry;
        });

        for (let nr in this.points) {
            let c = this.points[nr].getCoordinate();
            this.l_points[nr] = {};
            if (!c) continue;
            if (['resection', 'free_station', 'intersection', 'theodolite', 'adjustment', 'unknown'].includes(c.source)) continue;
            // else: 'manual' | 'gps' | 'map' | 'import' | 'transform' 

            if (c.x !== undefined && this.x_points[nr].x !== undefined) {
                const row = new Array(this.x0_org.length).fill(0);
                row[this.x_points[nr].x] = 1;
                this.l0.push(this.x0_org[this.x_points[nr].x]);
                this.l.push(c.x);
                this.l_points[nr].x = this.l0.length - 1;
                this.l_isAngle.push(false);
                this.p.push(c.accuracy);
                this.A.push(row);
            }
            if (c.y !== undefined && this.x_points[nr].y !== undefined) {
                const row = new Array(this.x0_org.length).fill(0);
                row[this.x_points[nr].y] = 1;
                this.l0.push(this.x0_org[this.x_points[nr].y]);
                this.l.push(c.y);
                this.l_points[nr].y = this.l0.length - 1;
                this.l_isAngle.push(false);
                this.p.push(c.accuracy);
                this.A.push(row);
            }
            if (c.z !== undefined && this.x_points[nr].z !== undefined) {
                const row = new Array(this.x0_org.length).fill(0);
                row[this.x_points[nr].z] = 1;
                this.l0.push(this.x0_org[this.x_points[nr].z]);
                this.l.push(c.z);
                this.l_points[nr].z = this.l0.length - 1;
                this.l_isAngle.push(false);
                this.p.push(c.accuracy);
                this.A.push(row);
            }
        }

        this.dl = subtract(this.l, this.l0);

        this.l_isAngle.forEach((x, i) => {
            if (x) {
                this.dl[i] = gonBetweenMinus200And200(this.dl[i]);
            }
        });
        this.l_filter2org = this.l0.map((_, i) => i)
        this.filterImpossibleMeasurements();
        return this.A;
    }


    private filterImpossibleMeasurements() {
        let row_entries = this.A[0].map(() => 0);
        let col_entries = this.A.map(() => 0);

        // TODO: für das Zählen nur die echten Messugen berücksichtigen
        this.A.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col !== 0) {
                    row_entries[j]++;
                    col_entries[i]++;
                }
            });
        });
        this.l_filter = col_entries.map((x) => x == 0)
        this.x_filter = row_entries.map((x) => x == 0)

        if (this.nurNeupunkte) {
            let neupunkte: string[] = []
            this.measurements.forEach((m, i) => {
                if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                    neupunkte.push(m.pointNumber)
                }
            });

            for (let nr in this.l_points) {
                if (this.l_points[nr].x !== undefined)
                    this.l_filter[this.l_points[nr].x] = true;
                if (this.l_points[nr].y !== undefined)
                    this.l_filter[this.l_points[nr].y] = true;
                if (this.l_points[nr].z !== undefined)
                    this.l_filter[this.l_points[nr].z] = true;
            }

            for (let nr in this.x_points) {
                if (!neupunkte.includes(nr)) {

                    if (this.x_points[nr].x !== undefined)
                        this.x_filter[this.x_points[nr].x] = true;
                    if (this.x_points[nr].y !== undefined)
                        this.x_filter[this.x_points[nr].y] = true;
                }
                if (this.x_points[nr].z !== undefined)
                    this.x_filter[this.x_points[nr].z] = true;
            }
        }

        let xfilter = <T>(__: T, index: number) => !this.x_filter[index]
        let lfilter = <T>(__: T, index: number) => !this.l_filter[index]

        this.A = this.A.filter(lfilter).map((row) => row.filter(xfilter));
        //console.log(size(this.A))

        let zs = size(this.A) as number[];
        let s = zs[1];
        let z = zs[0];

        console.log('Unbekannte: ', s)
        console.log('Messungen: ', z)

        this.x0_filtered = this.x0_org.filter(xfilter);

        if (this.l.length > z) this.l = this.l.filter(lfilter);
        if (this.l0.length > z)
            this.l0 = this.l0.filter(lfilter);
        if (this.p.length > z)
            this.p = this.p.filter(lfilter);
        if (this.l_isAngle.length > z)
            this.l_isAngle = this.l_isAngle.filter(lfilter);
        if (this.dl.length > z)
            this.dl = this.dl.filter(lfilter);
        if (this.l_filter2org.length > z)
            this.l_filter2org = this.l_filter2org.filter(lfilter);

        if (this.x_isAngle.length > s)
            this.x_isAngle = this.x_isAngle.filter(xfilter);
        if (this.dx.length > s)
            this.dx = this.dx.filter(xfilter);
        if (this.x_filter2org.length > s)
            this.x_filter2org = this.x_filter2org.filter(xfilter);
    }


    private calculate() {
        this.dl = []
        this.dx = [];
        this.successful === false
        for (let i = 0; i < 15; i++) {
            try {
                this.createA_l0_dl_l();
                this.P = inv(diag(this.p.map((x) => x * x))) as unknown as number[][];
                //console.log("A: ", this.A);
                if (this.l0.length < this.x0_filtered.length) {
                    console.log('zu wenig Messungen für die Anzahl der Unbekannten');
                    return false;
                }

                const At = transpose(this.A);
                const N = multiply(multiply(At, this.P), this.A);
                // console.log(N);
                this.Qx = inv(N) as unknown as number[][];
                const n = multiply(multiply(At, this.P), this.dl);
                this.dx = multiply(this.Qx, n) as unknown as number[];
                this.x0_filtered = add(this.x0_filtered, this.dx) as number[]

                this.x_isAngle.forEach((x, i) => {
                    if (x) {
                        this.x0_filtered[i] = gonBetween0And400(this.x0_filtered[i]);
                        this.dx[i] = gonBetweenMinus200And200(this.dx[i]);
                    }
                });

                this.x0_filtered.forEach((x, i) => {
                    let id = this.x_filter2org[i];
                    this.x0_org[id] = x;
                });

                console.log('run ', i, ', sum:', norm(this.dx));
                //console.log(dx);
            } catch (e) {
                console.error(e);
                return false;
            }

            if (norm(this.dx) as number < 1E-6) {
                this.successful = true;
                break;
            }
        }

        if (this.successful === false) return false;

        this.createA_l0_dl_l();

        //console.log('diff', subtract(this.l, this.l0));
        //console.log('diff_x0', subtract(this.x0, x0_old).map((x, i) => this.x_angles.includes(i) ? gonBetweenMinus200And200(x) : x));
        //console.log('x0', this.x0);

        // Genauigkeit
        let zs = size(this.A) as number[];
        let s = zs[1];
        let z = zs[0];
        this.Va = subtract(multiply(this.A, this.dx), this.dl) as number[];
        this.s0 = sqrt(divide(multiply(multiply(transpose(this.Va), this.P), this.Va) as number, (z - s))) as number;
        this.Sx = multiply(this.s0, diag(this.Qx).map((x) => sqrt(x)) as unknown as number[]) as number[];
        //console.log('s0', this.s0);
        //console.log('Sx', this.Sx);

        for (let i = 0; i < this.x0_filtered.length; i++) {
            console.log(i, this.x0_filtered[i], this.Sx[i]);
        }


        /*
        // Redundanzanteile
        let Re = subtract(this.P, multiply(multiply(multiply(this.A, this.Qx), transpose(this.A)), this.P)) as number[][];
        let r = diag(Re);
         
        // Datasnooping
        let k = 1.96;
         
        let Ql = inv(this.P);
        let Qv = multiply(multiply(Re, Ql), transpose(Re));
        let SVi = multiply(this.s0, diag(Qv).map((x) => sqrt(x)));
        //let NVi = divide(norm(Va), SVi);
        let GF = divide(-Va, norm(Va));
        let GRZW = multiply(divide(SVi, norm(Va)), k);
         
        console.log('GRZW', GRZW);
         
        // Konfidenzellipse
        /* aus Matlab
        w100 = sqrt((Qx(1, 1) - Qx(2, 2)) ^ 2 + 4 * Qx(1, 2) ^ 2);
        a100 = S0 * sqrt((1 / 2) * (Qx(1, 1) + Qx(2, 2) + w100) * 5.99);
        b100 = S0 * sqrt((1 / 2) * (Qx(1, 1) + Qx(2, 2) - w100) * 5.99);
        tk100 = 0.5 * atan(2 * Qx(2, 1) / (Qx(1, 1) - Qx(2, 2))) * rho;
         
        w101 = sqrt((Qx(3, 3) - Qx(4, 4)) ^ 2 + 4 * Qx(3, 4) ^ 2);
        a101 = S0 * sqrt((1 / 2) * (Qx(3, 3) + Qx(4, 4) + w101) * 5.99);
        b101 = S0 * sqrt((1 / 2) * (Qx(3, 3) + Qx(4, 4) - w101) * 5.99);
        tk101 = 0.5 * atan(2 * Qx(4, 3) / (Qx(3, 3) - Qx(4, 4))) * rho;
         
        plot(y100, x100, 'ro')
         
        plot(y101, x101, 'ro')
        plot(Dpkt(:, 2), Dpkt(:, 3), 'bo')
         
        ellipse(a100 * 5000, b100 * 5000, tk100 / rho, y100, x100);
        ellipse(a101 * 5000, b101 * 5000, tk101 / rho, y101, x101);
        */

        return this.dx === undefined ? '' : norm(this.dx)
    }


    public writeResults() {
        if (this.successful === false) {
            //TODO: Delete adjustement coordinates
            return false
        }
        let epsg = useSettingStore().epsg
        let sourceId = undefined;
        if (this.measurements.length === 1) {
            sourceId = this.measurements[0].id;
        }

        for (let nr in this.points) {
            let p = this.x_points[nr];
            if (p === undefined) continue;

            if ((p.x === undefined || this.x_filter[p.x]) && (p.y === undefined || this.x_filter[p.y]) && (p.z === undefined || this.x_filter[p.z])) continue;

            let entry = this.points[nr]
                .getCoordinate(epsg, (ce: CoordinateEntry) => ['adjustment', 'resection'].includes(ce.source) && ce.sourceId == sourceId && ce.epsg == epsg);
            if (entry === undefined || entry === null) {
                entry = { source: 'adjustment', sourceId: sourceId ? [sourceId] : undefined, accuracy: this.Sx[p.x ?? 0], epsg: epsg };
                this.points[nr].addCoordinate(entry);
            }
            entry.source = 'adjustment';
            entry.sourceId = sourceId ? [sourceId] : undefined;
            entry.accuracy = this.Sx[this.x_filter2org.findIndex((x) => x === p.x)];
            if (entry.accuracy > 1E10) {
                entry.accuracy = -99999;
            }
            entry.epsg = epsg;

            if (p.x !== undefined && !this.x_filter[p.x]) {
                entry['x'] = this.x0_org[p.x];
                entry['x_s'] = this.Sx[this.x_filter2org.findIndex((x) => x === p.x)];
                if (entry['x_s'] > 1E10) entry['x_s'] = undefined;
            }
            if (p.y !== undefined && !this.x_filter[p.y]) {
                entry['y'] = this.x0_org[p.y];
                entry['y_s'] = this.Sx[this.x_filter2org.findIndex((x) => x === p.y)];
                if (entry['y_s'] > 1E10) entry['y_s'] = undefined;
            }
            if (p.z !== undefined && !this.x_filter[p.z]) {
                entry['z'] = this.x0_org[p.z];
                entry['z_s'] = this.Sx[this.x_filter2org.findIndex((x) => x === p.z)];
                if (entry['z_s'] > 1E10) entry['z_s'] = undefined;
            }
        }

        for (let i in this.x_measurements) {
            let m = this.measurements[i];
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                if (this.x_measurements[i].o !== undefined) {
                    m.orientation = this.x0_org[this.x_measurements[i].o];
                    m.orientationAccuracy = this.Sx[this.x_filter2org.findIndex((x) => x === this.x_measurements[i].o)];
                    if (m.orientationAccuracy > 1E10) m.orientationAccuracy = undefined;
                }
                if (this.x_measurements[i].ih !== undefined) {
                    m.instrumentHeight = this.x0_org[this.x_measurements[i].ih];
                }
            }
        }

        this.measurements.forEach((m) => {
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                m.measures.forEach((measure) => {
                    measure.hz_v = undefined;
                    measure.v_v = undefined;
                    measure.distance_v = undefined;
                });
            }
        });

        for (let i in this.l_measurements) {
            let m = this.l_measurements[i];
            for (let n in m.measure) {
                let m = this.measurements[i]
                if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                    const entry = this.l_measurements[i].measure[n];
                    const measure = m.measures[n];
                    if (measure.active === false || entry == undefined) {
                        measure.hz_v = undefined;
                        measure.v_v = undefined;
                        measure.distance_v = undefined;
                        return;
                    }
                    if (entry.hz !== undefined) {
                        let hzi = this.l_filter2org.findIndex((x) => x === entry.hz);
                        if (hzi !== -1) {
                            measure.hz_v = this.dl[hzi];
                            console.log('hz', measure.hz_v)
                        }
                    }
                    if (entry.v !== undefined) {
                        let vi = this.l_filter2org.findIndex((x) => x === entry.v);
                        if (vi !== -1) {
                            measure.v_v = this.dl[vi];
                        }
                    }
                    if (entry.dist !== undefined) {
                        let di = this.l_filter2org.findIndex((x) => x === entry.dist);
                        if (di !== -1) {
                            measure.distance_v = this.dl[di];
                        }
                    }
                };
            }
        };
        return true
    }
}