import { Measurement } from '@/types/Measurement';
import { Point } from '@/types/Point';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { azimuth, gonBetween0And400, gonBetweenMinus200And200, gonToRad, zenithDistance } from '@/utils';
import { inv, transpose, multiply, subtract, diag, add, norm, ones, MathNumericType, Matrix, i, size, sqrt, divide, string, sum, boolean } from 'mathjs';

export class Adjustment {
    private measurements: Measurement[];
    private points: { [nr: string]: Point }

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

    private RHO = 200 / Math.PI;


    private l_isAngle: boolean[] = [];
    private l_filter: boolean[] = [];  // true: adjustment for value is impossible

    private x_points_pos: { [nr: string]: { x?: number, y?: number, z?: number } } = {};
    private x_measurements_pos: { [measure: number]: { o?: number, ih?: number } } = {};
    private x_isAngle: boolean[] = [];
    private x_filter: boolean[] = [];  // true: adjustment for value is impossible
    private x_filter2org: number[] = [];

    constructor(measurements: Measurement[], points: { [nr: string]: Point }) {
        this.measurements = measurements;
        this.points = points;
    }

    public adjust() {
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
        this.x_points_pos = {};
        this.x_measurements_pos = {};
        this.x_filter = [];
        this.l_filter = [];

        for (let nr in this.points) {
            let c = this.points[nr].getCoordinate();
            if (!c) continue;
            this.x_points_pos[nr] = {};
            if (c.x !== undefined) {
                this.x0_org.push(c.x);
                this.x_points_pos[nr].x = this.x0_org.length - 1;
                this.x_isAngle.push(false);
            }
            if (c.y !== undefined) {
                this.x0_org.push(c.y);
                this.x_points_pos[nr].y = this.x0_org.length - 1;
                this.x_isAngle.push(false);
            }
            if (c.z !== undefined) {
                this.x0_org.push(c.z);
                this.x_points_pos[nr].z = this.x0_org.length - 1;
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
                this.x_measurements_pos[i] = entry;
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

        this.measurements.forEach((m, i) => {
            if (m.type == 'theodolite' && m instanceof TheodoliteMeasure) {
                const s = this.x_points_pos[m.pointNumber];
                const sx = s.x;
                const sy = s.y;
                const sz = s.z;
                if (sx === undefined || sy === undefined) return;

                if (m.instrumentHeight !== undefined && this.x_measurements_pos[i].ih !== undefined) {
                    const row = new Array(this.x0_org.length).fill(0);
                    this.l0.push(this.x0_org[this.x_measurements_pos[i].ih]);
                    this.l.push(m.instrumentHeight);
                    //this.l_measurements.push({ measure: i,  });
                    this.l_isAngle.push(true);
                    this.p.push(0.02);
                    this.A.push(row);
                }

                m.measures.forEach((measure, n) => {
                    if (measure.active === false) return;
                    const t = this.x_points_pos[measure.nr];
                    const tx = t.x;
                    const ty = t.y;
                    const tz = t.z;
                    if (tx === undefined || ty === undefined) return;
                    const dx = this.x0_org[tx] - this.x0_org[sx];
                    const dy = this.x0_org[ty] - this.x0_org[sy];
                    const dist2 = dx * dx + dy * dy;
                    const dist = Math.sqrt(dist2);
                    // Hz
                    if (measure.hz !== undefined && this.x_measurements_pos[i].o !== undefined) {
                        const row = new Array(this.x0_org.length).fill(0);

                        row[sx] = - dy / dist2 * this.RHO;
                        row[sy] = dx / dist2 * this.RHO;
                        row[tx] = dy / dist2 * this.RHO;
                        row[ty] = - dx / dist2 * this.RHO;
                        row[this.x_measurements_pos[i].o] = -1;
                        let azi = azimuth({ x: this.x0_org[sx], y: this.x0_org[sy] }, { x: this.x0_org[tx], y: this.x0_org[ty] });
                        azi -= this.x0_org[this.x_measurements_pos[i].o];
                        azi = gonBetween0And400(azi);
                        this.l0.push(azi);
                        this.l.push(measure.hz);
                        this.l_isAngle.push(true);
                        this.p.push(0.00025);
                        this.A.push(row);
                    }
                    // V
                    if (measure.v !== undefined && sz !== undefined && tz !== undefined && this.x_measurements_pos[i].ih !== undefined) {
                        const row = new Array(this.x0_org.length).fill(0);
                        const dz = this.x0_org[tz] - this.x0_org[sz];
                        const ih = this.x0_org[this.x_measurements_pos[i].ih];
                        row[sz] = -1;
                        row[tz] = 1;
                        row[this.x_measurements_pos[i].ih] = -1;
                        this.l0.push(zenithDistance(dist - ih + (measure.targetHeight ?? 0), dz));
                        this.l.push(measure.v);
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

            if (c.x !== undefined && this.x_points_pos[nr].x !== undefined) {
                const row = new Array(this.x0_org.length).fill(0);
                row[this.x_points_pos[nr].x] = 1;
                this.l0.push(this.x0_org[this.x_points_pos[nr].x]);
                this.l.push(c.x);
                this.l_isAngle.push(false);
                this.p.push(c.accuracy);
                this.A.push(row);
            }
            if (c.y !== undefined && this.x_points_pos[nr].y !== undefined) {
                const row = new Array(this.x0_org.length).fill(0);
                row[this.x_points_pos[nr].y] = 1;
                this.l0.push(this.x0_org[this.x_points_pos[nr].y]);
                this.l.push(c.y);
                this.l_isAngle.push(false);
                this.p.push(c.accuracy);
                this.A.push(row);
            }
            if (c.z !== undefined && this.x_points_pos[nr].z !== undefined) {
                const row = new Array(this.x0_org.length).fill(0);
                row[this.x_points_pos[nr].z] = 1;
                this.l0.push(this.x0_org[this.x_points_pos[nr].z]);
                this.l.push(c.z);
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
        this.filterImpossibleMeasurements();
        return this.A;
    }


    private filterImpossibleMeasurements() {
        let row_entries = this.A[0].map(() => 0);
        let col_entries = this.A.map(() => 0);

        this.A.forEach((row, i) => {
            row.forEach((col, j) => {
                if (col !== 0) {
                    row_entries[j]++;
                    col_entries[i]++;
                }
            });
        });
        this.l_filter = col_entries.map((x) => x === 0)
        this.x_filter = row_entries.map((x) => x === 0)

        let xfilter = <T>(__: T, index: number) => !this.x_filter[index]
        let lfilter = <T>(__: T, index: number) => !this.l_filter[index]

        this.A = this.A.filter(lfilter).map((row) => row.filter(xfilter));
        //console.log(size(this.A))

        let zs = size(this.A) as number[];
        let s = zs[1];
        let z = zs[0];

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

        for (let i = 0; i < 10; i++) {
            this.createA_l0_dl_l();
            this.P = inv(diag(this.p.map((x) => x * x))) as unknown as number[][]; 
            //console.log("A: ", this.A);
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

            if (norm(this.dx) as number < 1E-6) {
                break;
            }
        }

        //this.createA_l0_dl_l();

        //console.log('diff', subtract(this.l, this.l0));
        //console.log('diff_x0', subtract(this.x0, x0_old).map((x, i) => this.x_angles.includes(i) ? gonBetweenMinus200And200(x) : x));
        //console.log('x0', this.x0);
        /*
                // Genauigkeit
                let zs = size(this.A) as number[];
                let s = zs[1];
                let z = zs[0];
                let Va = subtract(multiply(this.A, this.dx), this.dl) as number[];
                this.s0 = sqrt(divide(multiply(multiply(transpose(Va), this.P), Va) as number, (z - s))) as number;
                this.Sx = multiply(this.s0, diag(this.Qx).map((x) => sqrt(x)) as unknown as number[]) as number[];
                console.log('s0', this.s0);
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
}