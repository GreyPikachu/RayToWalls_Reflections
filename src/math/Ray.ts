import { Vector2D } from './Vector2D';

export class Ray {
    public origin: Vector2D;
    public dir: Vector2D;

    constructor(origin: Vector2D, dir: Vector2D) {
        this.origin = origin.clone();
        // Направление луча всегда должно быть нормализовано (длина = 1)
        this.dir = dir.normalize(); 
    }

    // Вычисляет конкретную точку на луче на расстоянии 't' от начала
    // Формула: P = Origin + Direction * t
    getPointAt(t: number): Vector2D {
        return this.origin.add(this.dir.multiply(t));
    }
}
