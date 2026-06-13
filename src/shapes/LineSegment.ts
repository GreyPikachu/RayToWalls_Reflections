import { Ray } from '../math/Ray';
import { Vector2D } from '../math/Vector2D';
import { Intersection } from './Shape';
import type { Shape } from './Shape';

export class LineSegment implements Shape {
    constructor(public a: Vector2D, public b: Vector2D) {}

    // Вспомогательная функция для 2D векторного произведения (Cross Product)
    private cross(v: Vector2D, w: Vector2D): number {
        return v.x * w.y - v.y * w.x;
    }

    intersect(ray: Ray): Intersection | null {
        // Алгоритм пересечения луча и отрезка
        const p = ray.origin;
        const r = ray.dir;
        const q = this.a;
        const s = this.b.sub(this.a);

        const rCrossS = this.cross(r, s);
        const qMinusP = q.sub(p);

        // Если rCrossS == 0, значит луч и отрезок параллельны (никогда не пересекутся)
        if (Math.abs(rCrossS) < 0.0001) {
            return null;
        }

        const t = this.cross(qMinusP, s) / rCrossS;
        const u = this.cross(qMinusP, r) / rCrossS;

        // t - это расстояние вдоль луча (оно должно быть положительным)
        // u - это позиция на отрезке от 0 до 1 (0 - точка A, 1 - точка B)
        if (t >= 0 && u >= 0 && u <= 1) {
            const point = ray.getPointAt(t);

            // Вычисляем нормаль отрезка (перпендикуляр)
            // Если вектор отрезка (s.x, s.y), то перпендикуляр это (-s.y, s.x)
            let normal = new Vector2D(-s.y, s.x).normalize();

            // Нормаль всегда должна смотреть навстречу лучу
            // Если скалярное произведение больше 0, значит нормаль и луч смотрят в одну сторону.
            // В таком случае разворачиваем нормаль на 180 градусов.
            if (ray.dir.dot(normal) > 0) {
                normal = normal.multiply(-1);
            }

            return new Intersection(point, normal, t);
        }

        return null; // Пересечения нет
    }
}
