import { Measurement } from '@/types/Measurement';
import { Point } from '@/types/Point';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { azimuth, gonBetween0And400, gonBetweenMinus200And200, gonToRad, zenithDistance } from '@/utils';
import { inv, transpose, multiply, subtract, diag, add, norm, ones, MathNumericType, Matrix, i } from 'mathjs';

export class Adjustment {
    private measurements: Measurement[];
    private points: { [nr: string]: Point }

    private x0: number[] = [];
    private A: number[][] = [];
    private l: number[] = [];
    private l0: number[] = [];
    private p: number[] = [];
    private dl: number[] = [];
    private dx: number[] = [];

    private RHO = 200 / Math.PI;

    private x_measurements: { [id: number]: { o?: number, ih?: number } } = {};
    private l_measurements: { [id: number]: { [id: number]: { hz?: number, v?: number, dist?: number } } } = {};
    private x_points: { [nr: string]: { x?: number, y?: number, z?: number } } = {};
    private l_points: { [nr: string]: { x?: number, y?: number, z?: number } } = {};
    private l_angles: number[] = [];
    private x_angles: number[] = [];

    constructor(measurements: Measurement[], points: { [nr: string]: Point }) {
        this.measurements = measurements;
        this.points = points;
    }

    public adjust() {
        this.createX0Vector();
        return this.calculate();
    }

    private createX0Vector() {
        this.x0 = [];
        this.A = [];
        this.l = [];
        this.l0 = [];
        this.p = [];
        this.l_angles = [];
        this.x_angles = [];
        this.x_measurements = {};
        this.l_measurements = {};
        this.x_points = {};
        this.l_points = {};

        for (let nr in this.points) {
            let c = this.points[nr].getCoordinate();
            if (!c) continue;
            this.x_points[nr] = {};
            if (c.x !== undefined) {
                this.x0.push(c.x);
                this.x_points[nr].x = this.x0.length - 1;
            }
            if (c.y !== undefined) {
                this.x0.push(c.y);
                this.x_points[nr].y = this.x0.length - 1;
            }
            if (c.z !== undefined) {
                this.x0.push(c.z);
                this.x_points[nr].z = this.x0.length - 1;
            }
        }

        this.measurements.forEach((m, i) => {
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                const entry: { o?: number, ih?: number } = {};
                this.x0.push(gonToRad(m.orientation ?? 0));
                entry.o = this.x0.length - 1;
                this.x_angles.push(this.x0.length - 1);
                //this.x0.push(m.instrumentHeight ?? 0)
                //entry.ih = this.x0.length - 1;

                /*
                m.measures.forEach((measure) => {
                     x.push(measure.targetHeight);
                }
                */
                this.x_measurements[i] = entry;
            }
        });
        return this.x0
    }



    private createA() {
        this.A = [];
        this.l = [];
        this.l0 = [];
        this.p = [];
        this.l_angles = [];

        this.measurements.forEach((m, i) => {
            this.l_measurements[i] = {};
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                const s = this.x_points[m.pointNumber];
                const sx = s.x;
                const sy = s.y;
                const sz = s.z;
                if (sx === undefined || sy === undefined) return;
                m.measures.forEach((measure, n) => {
                    this.l_measurements[i][n] = {};
                    const t = this.x_points[measure.nr];
                    const tx = t.x;
                    const ty = t.y;
                    const tz = t.z;
                    if (tx === undefined || ty === undefined) return;
                    const dx = this.x0[tx] - this.x0[sx];
                    const dy = this.x0[ty] - this.x0[sy];
                    const dist2 = dx * dx + dy * dy;
                    const dist = Math.sqrt(dist2);
                    // Hz
                    if (measure.hz !== undefined && this.x_measurements[i].o !== undefined) {
                        const row = new Array(this.x0.length).fill(0);

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
                        row[this.x_measurements[i].o] = 1;
                        let azi = azimuth({ x: this.x0[sx], y: this.x0[sy] }, { x: this.x0[tx], y: this.x0[ty] });
                        azi += this.x0[this.x_measurements[i].o];
                        azi = gonBetween0And400(azi);
                        this.l0.push(azi);
                        this.l.push(measure.hz);
                        this.l_measurements[i][n].hz = this.l.length - 1;
                        this.l_angles.push(this.l.length - 1);
                        this.p.push(0.00025);
                        this.A.push(row);
                    }
                    // V
                    if (measure.v !== undefined && sz !== undefined && tz !== undefined && this.x_measurements[i].ih !== undefined) {
                        const row = new Array(this.x0.length).fill(0);
                        const dz = this.x0[tz] - this.x0[sz];
                        const ih = this.x0[this.x_measurements[i].ih];
                        row[sz] = -1;
                        row[tz] = 1;
                        row[this.x_measurements[i].ih] = -1;
                        this.l0.push(zenithDistance(dist - ih + (measure.targetHeight ?? 0), dz));
                        this.l.push(measure.v);
                        this.l_measurements[i][n].v = this.l.length - 1;
                        this.l_angles.push(this.l.length - 1);
                        this.p.push(0.00025);
                        this.A.push(row);
                    }
                    // distance
                    if (measure.distance !== undefined) {
                        const row = new Array(this.x0.length).fill(0);
                        row[sx] = -dx / dist;
                        row[sy] = -dy / dist;
                        row[tx] = dx / dist;
                        row[ty] = dy / dist;
                        this.l0.push(dist);
                        this.l_measurements[i][n].dist = this.l.length - 1;
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

            this.l_points[nr] = {};
            if (c.x !== undefined && this.x_points[nr].x !== undefined) {
                const row = new Array(this.x0.length).fill(0);
                row[this.x_points[nr].x] = 1;
                this.l0.push(this.x0[this.x_points[nr].x]);
                this.l.push(c.x);
                this.l_points[nr].x = this.l.length - 1;
                this.p.push(c.accuracy);
                this.A.push(row);
            }
            if (c.y !== undefined && this.x_points[nr].y !== undefined) {
                const row = new Array(this.x0.length).fill(0);
                row[this.x_points[nr].y] = 1;
                this.l0.push(this.x0[this.x_points[nr].y]);
                this.l.push(c.y);
                this.l_points[nr].y = this.l.length - 1;
                this.p.push(c.accuracy);
                this.A.push(row);
            }
            if (c.z !== undefined && this.x_points[nr].z !== undefined) {
                const row = new Array(this.x0.length).fill(0);
                row[this.x_points[nr].z] = 1;
                this.l0.push(this.x0[this.x_points[nr].z]);
                this.l.push(c.z);
                this.l_points[nr].z = this.l.length - 1;
                this.p.push(c.accuracy);
                this.A.push(row);
            }
        }
        return this.A;
    }

    private calculate() {
        this.dl = []
        this.dx = [];

        let x0_old = [...this.x0];

        for (let i = 0; i < 10; i++) {
            this.createA();
            this.dl = subtract(this.l, this.l0);

            this.l_angles.forEach((x) => {
                this.dl[x] = gonBetweenMinus200And200(this.dl[x]);
            });

            const P = inv(diag(this.p.map((x) => x * x)));
            const At = transpose(this.A);
            const N = multiply(multiply(At, P), this.A);
            //console.log(N);
            const Qx = inv(N);
            const n = multiply(multiply(At, P), this.dl);
            this.dx = multiply(Qx, n) as unknown as number[];
            this.x0 = add(this.x0, this.dx) as number[]

            this.x_angles.forEach((id) => {
                this.x0[id] = gonBetween0And400(this.x0[id]);
                this.dx[id] = gonBetweenMinus200And200(this.dx[id]);
            });

            console.log('run ', i, ', sum:', norm(this.dx));
            //console.log(dx);

            if (norm(this.dx) as number < 1E-6) {
                break;
            }
        }

        //        this.createA();
        console.log('diff', subtract(this.l, this.l0));
        console.log('diff_x0', subtract(this.x0, x0_old).map((x, i) => this.x_angles.includes(i) ? gonBetweenMinus200And200(x) : x));
        console.log('x0', this.x0);
        return this.dx === undefined ? '' : norm(this.dx)
    }


}