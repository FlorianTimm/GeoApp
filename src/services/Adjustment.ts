import { Measurement } from '@/types/Measurement';
import { Point } from '@/types/Point';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { azimuth, gonBetween0And400, gonBetweenMinus200And200, gonToRad, zenithDistance } from '@/utils';
import { inv, transpose, multiply, subtract, diag, add, norm, ones, MathNumericType, Matrix } from 'mathjs';

export class Adjustment {
    private measurements: Measurement[];
    private points: { [nr: string]: Point }

    private x0: number[] = [];
    private A: number[][] = [];
    private l: number[] = [];
    private l0: number[] = [];
    private p: number[] = [];

    private RHO = 200 / Math.PI;

    private x0_measurements: { o?: number, ih?: number }[] = [];
    private x0_points: { [nr: string]: { x?: number, y?: number, z?: number } } = {};
    private l_angles: number[] = [];

    constructor(measurements: Measurement[], points: { [nr: string]: Point }) {
        this.measurements = measurements;
        this.points = points;
    }

    public adjust() {
        this.createX0Vector();
        this.calculate();
        return 0
    }

    private createX0Vector() {

        for (let nr in this.points) {
            let c = this.points[nr].getCoordinate();
            if (!c) continue;
            this.x0_points[nr] = {};
            if (c.x !== undefined) {
                this.x0.push(c.x);
                this.x0_points[nr].x = this.x0.length - 1;
            }
            if (c.y !== undefined) {
                this.x0.push(c.y);
                this.x0_points[nr].y = this.x0.length - 1;
            }
            if (c.z !== undefined) {
                this.x0.push(c.z);
                this.x0_points[nr].z = this.x0.length - 1;
            }
        }

        this.measurements.forEach((m) => {
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                const entry: { o?: number, ih?: number } = {};
                this.x0.push(gonToRad(m.orientation ?? 0));
                entry.o = this.x0.length - 1;
        //this.x0.push(m.instrumentHeight ?? 0)
        //entry.ih = this.x0.length - 1;

                /*
                m.measures.forEach((measure) => {
                     x.push(measure.targetHeight);
                }
                */
                this.x0_measurements.push(entry);
            }
        });
        return this.x0;
    }

    private createA(x0: number[]) {
        this.A = [];
        this.l = [];
        this.l0 = [];
        this.p = [];
        this.l_angles = [];

        this.measurements.forEach((m, i) => {
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                const s = this.x0_points[m.pointNumber];
                const sx = s.x;
                const sy = s.y;
                const sz = s.z;
                if (sx === undefined || sy === undefined) return;
                m.measures.forEach((measure) => {
                    const t = this.x0_points[measure.nr];
                    const tx = t.x;
                    const ty = t.y;
                    const tz = t.z;
                    if (tx === undefined || ty === undefined) return;
                    const dx = x0[tx] - x0[sx];
                    const dy = x0[ty] - x0[sy];
                    const dist2 = dx * dx + dy * dy;
                    const dist = Math.sqrt(dist2);
                    // Hz
                    if (measure.hz !== undefined && this.x0_measurements[i].o !== undefined) {
                        const row = new Array(x0.length).fill(0);

                        row[sx] = - dy / dist2 * this.RHO;
                        row[sy] = dx / dist2 * this.RHO;
                        row[tx] = dy / dist2 * this.RHO;
                        row[ty] = - dx / dist2 * this.RHO;
                        /*
                        row[sx] = dy / (dist * dist);
                        row[sy] = -dx / (dist * dist);
                        row[tx] = -dy / (dist * dist);
                        row[ty] = dx / (dist * dist);
                        */
                        row[this.x0_measurements[i].o] = 1;
                        let azi = azimuth({ x: x0[sx], y: x0[sy] }, { x: x0[tx], y: x0[ty] });
                        azi += x0[this.x0_measurements[i].o];
                        azi = gonBetween0And400(azi);
                        this.l0.push(azi);
                        this.l.push(measure.hz);
                        this.l_angles.push(this.l.length - 1);
                        this.p.push(0.00025);
                        this.A.push(row);
                    }
                    // V
                    if (measure.v !== undefined && sz !== undefined && tz !== undefined && this.x0_measurements[i].ih !== undefined) {
                        const row = new Array(x0.length).fill(0);
                        const dz = x0[tz] - x0[sz];
                        const ih = x0[this.x0_measurements[i].ih];
                        row[sz] = -1;
                        row[tz] = 1;
                        row[this.x0_measurements[i].ih] = -1;
                        this.l0.push(zenithDistance(dist - ih + (measure.targetHeight ?? 0), dz));
                        this.l.push(measure.v);
                        this.l_angles.push(this.l.length - 1);
                        this.p.push(0.00025);
                        this.A.push(row);
                    }
                    // distance
                    if (measure.distance !== undefined) {
                        const row = new Array(x0.length).fill(0);
                        row[sx] = -dx / dist;
                        row[sy] = -dy / dist;
                        row[tx] = dx / dist;
                        row[ty] = dy / dist;
                        this.l0.push(dist);
                        this.l.push(measure.distance);
                        this.p.push(0.005);
                        this.A.push(row);
                    }
                });
            }
        });

                for (let nr in this.points) {
                    let c = this.points[nr].getCoordinate();
                    if (!c) continue;
                    if (['resection', 'free_station', 'intersection', 'theodolite', 'adjustment', 'unknown'].includes(c.source)) continue;
                    // else: 'manual' | 'gps' | 'map' | 'import' | 'transform' 
                    if (c.x !== undefined && this.x0_points[nr].x !== undefined) {
                        const row = new Array(x0.length).fill(0);
                        row[this.x0_points[nr].x] = 1;
                        this.l0.push(x0[this.x0_points[nr].x]);
                        this.l.push(c.x);
                        this.p.push(c.accuracy);
                        this.A.push(row);
                    }
                    if (c.y !== undefined && this.x0_points[nr].y !== undefined) {
                        const row = new Array(x0.length).fill(0);
                        row[this.x0_points[nr].y] = 1;
                        this.l0.push(x0[this.x0_points[nr].y]);
                        this.l.push(c.y);
                        this.p.push(c.accuracy);
                        this.A.push(row);
                    }
                    if (c.z !== undefined && this.x0_points[nr].z !== undefined) {
                        const row = new Array(x0.length).fill(0);
                        row[this.x0_points[nr].z] = 1;
                        this.l0.push(x0[this.x0_points[nr].z]);
                        this.l.push(c.z);
                        this.p.push(c.accuracy);
                        this.A.push(row);
                    }
                }
        return this.A;
    }

    private calculate() {
        let dl: number[] = []
        let dx: Matrix<MathNumericType> | undefined = undefined;
        let x0 = [...this.x0];
        for (let i = 0; i < 10; i++) {
            //console.log(i);
            this.createA(x0);
            //console.log(this.A);
            //console.log('l', this.l);
            dl = subtract(this.l, this.l0);

            this.l_angles.forEach((x) => {
                dl[x] = gonBetweenMinus200And200(dl[x]);
/*
                if (dl[x] <= -Math.PI) {
                    dl[x] += 2 * Math.PI;
                } else if (dl[x] > Math.PI) {
                    dl[x] -= 2 * Math.PI;
                }
                    */
            });
            //console.log("dl", dl);

            const P = inv(diag(this.p.map((x) => x * x)));
            const At = transpose(this.A);
            const N = multiply(multiply(At, P), this.A);
            //console.log(N);
            const Qx = inv(N);
            const n = multiply(multiply(At, P), dl);
            dx = multiply(Qx, n);
            x0 = add(x0, dx) as number[]

            this.x0_measurements.forEach((x) => {
                if (x.o !== undefined) {
                    x0[x.o] = gonBetween0And400(x0[x.o]);
                }
            });
            console.log('run ', i, ', sum:', norm(dx));
            //console.log(dx);

            if (norm(dx) as number < 1E-6) {
                break;
            }
        }
        console.log('diff', subtract(this.l, this.l0));
        console.log('diff_x0', subtract(x0, this.x0));
        return dx === undefined ? '' : norm(dx);
    }
}