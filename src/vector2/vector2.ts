export class Vector2 {

    public addX = curry(Vector2.addX, this);

    public addY = curry(Vector2.addY, this);
    /**
     * Adds another vector to this one
     */
    public add = curry(Vector2.add, this);

    /**
     * Subtracts another vector from this one
     */
    public subtract = curry(Vector2.subtract, this);

    /**
     * Multiplies both vector axis by the given scalar value
     *
     * ### Examples:
     *     new Victor(100, 50).multiplyScalar(2);
     *     // => x:200, y:100
     */
    public multiplyScalar = curry(Vector2.multiplyScalar, this);

    /**
     * Divides both vector axis by the given scalar value
     *
     * @param scalar The scalar to divide by
     */
    public divideScalar = curry(Vector2.divideScalar, this);

    public rotateTo = curry(Vector2.rotateTo, this);

    public rotateByDeg = curry(Vector2.rotateByDeg, this);

    public rotateBy = curry(Vector2.rotateBy, this);

    /**
     * Normalize
     *
     * @return {Vector2} A vector in the same direction, but with unit magnitiude
     */
    public normalize = apply(Vector2.normalize, this);

    /**
     * Inverts both axis
     *
     */
    public invert = apply(Vector2.invert, this);

    /********************* Statics *********************/

    public static add(v: Vector2, other: Vector2): Vector2 {
        return new Vector2(v.x + other.x, v.y + other.y);
    }

    public static addX(v: Vector2, x: number): Vector2 {
        return new Vector2(v.x + x, v.y);
    }

    public static addY(v: Vector2, y: number): Vector2 {
        return new Vector2(v.x, v.y + y);
    }

    public static subtract(v: Vector2, other: Vector2): Vector2 {
        return new Vector2(v.x - other.x, v.y - other.y);
    }

    /**
     * Inverts both axis
     *
     */
    public static invert(v: Vector2): Vector2 {
        return new Vector2(v.x * -1, v.y * -1);
    }

    /**
     * Calculates the length or magnitude of the vector
     *
     * @return {Number} Length / Magnitude
     */
    public static magnitude(v: Vector2): number {
        return Math.sqrt(this.magnitudeSq(v));
    }

    /**
     * Squared length / magnitude
     *
     * @return {Number} Length / Magnitude
     */
    public static magnitudeSq(v: Vector2) {
        return v.x * v.x + v.y * v.y;
    }

    public static normalize(v: Vector2): Vector2 {
        let length = Vector2.magnitude(v);
        if (length === 0) {
            return new Vector2(1, 0);
        } else {
            return Vector2.divide(v, new Vector2(length, length));
        }
    }

    /**
     * Divides both vector axis by a axis values of given vector
     *
     * @param vector The vector to divide by
     */
    public static divide(vector: Vector2, other: Vector2): Vector2 {
        let x = vector.x / other.x;
        let y = vector.y / other.y;
        return new Vector2(x, y);
    }

    /**
     * Multiplies both vector axis by the given scalar value
     */
    public static multiplyScalar(vector: Vector2, scalar: number): Vector2 {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    /**
     * Divides both vector axis by the given scalar value
     *
     * @param scalar The scalar to divide by
     */
    public static divideScalar(vector: Vector2, scalar: number): Vector2 {
        return (scalar !== 0)
            ? new Vector2(vector.x / scalar, vector.y / scalar)
            : new Vector2(0, 0);
    }

    public static angle(vector: Vector2) {
        return Math.atan2(vector.y, vector.x);
    }

    public static rotateTo(vector: Vector2, angle: number) {
        var nx = (vector.x * Math.cos(angle)) - (vector.y * Math.sin(angle));
        var ny = (vector.x * Math.sin(angle)) + (vector.y * Math.cos(angle));

        return new Vector2(nx, ny);
    }

    public static rotateBy(vector: Vector2, rotation: number) {
        let angle = Vector2.angle(vector) + rotation;
        return Vector2.rotateTo(vector, angle);
    }

    public static rotateByDeg(vector: Vector2, rotation: number) {
        rotation = degrees2radian(rotation);
        return Vector2.rotateBy(vector, rotation);
    }

    public constructor(readonly x: number = 0, readonly y: number = 0) {
    }

    /**
     * Calculates the length or magnitude of the vector
     *
     * ### Examples:
     *     new Vector2(100, 50).magnitude;
     *     // => 111.80339887498948
     *
     * @return Length / Magnitude
     */
    public get magnitude() { return Vector2.magnitude(this); }

    /**
     * Squared length / magnitude
     *
     * ### Examples:
     *     var vec = new Vector2(100, 50).magnitudeSq();
     *     // => 12500
     *
     * @return Length / Magnitude
     */
    public get magnitudeSq() { return Vector2.magnitude(this); }
}

var degrees = 180 / Math.PI;

function degrees2radian(deg: number) {
    return deg / degrees;
}

function apply<T, TOut>(func: (p1: T) => TOut, arg1: T): (() => TOut) {
    return () => func(arg1);
}

function curry<T1, T2, TOut>(func: (p1: T1, p2: T2) => TOut, arg1: T1): ((x: T2) => TOut) {
    return (x: T2) => func(arg1, x);
} 
