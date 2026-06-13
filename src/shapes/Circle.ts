import { Ray } from '../math/Ray';
import { Vector2D } from '../math/Vector2D';
import { Intersection } from './Shape';
import type { Shape } from './Shape';

export class Circle implements Shape {
    constructor(public center: Vector2D, public radius: number) {}

    intersect(ray: Ray): Intersection | null {
        // Математика пересечения луча и окружности (квадратное уравнение)
        const v = ray.origin.sub(this.center);
        const b = ray.dir.dot(v);
        const c = v.dot(v) - this.radius * this.radius;

        const delta = b * b - c; // Дискриминант

        if (delta < 0) return null; // Луч пролетел мимо

        const sqrtDelta = Math.sqrt(delta);
        const t1 = -b - sqrtDelta;
        const t2 = -b + sqrtDelta;

        // Ищем наименьшее положительное t (дистанцию)
        let t = -1;
        // Используем 0.001 чтобы луч не "застрял", если он пущен прямо с поверхности круга
        if (t1 > 0.001) t = t1;
        else if (t2 > 0.001) t = t2;

        if (t < 0) return null; // Круг остался позади луча

        const point = ray.getPointAt(t);
        // Нормаль к кругу - это просто вектор от его центра к точке касания!
        let normal = point.sub(this.center).normalize();

        // Если мы внутри круга, разворачиваем нормаль внутрь
        if (ray.dir.dot(normal) > 0) {
            normal = normal.multiply(-1);
        }

        return new Intersection(point, normal, t);
    }

    distanceTo(point: Vector2D): number {
        const dist = point.sub(this.center).magnitude();
        if (dist <= this.radius) return 0; // Клик внутри круга
        return dist - this.radius;         // Клик снаружи
    }

    move(delta: Vector2D): void {
        this.center = this.center.add(delta);
    }
}
