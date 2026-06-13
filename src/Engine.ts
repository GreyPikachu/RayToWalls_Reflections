import { Ray } from './math/Ray';
import { Vector2D } from './math/Vector2D';
import type { Shape } from './shapes/Shape';

export class Engine {
    public maxBounces = 50; // Лимит отражений, чтобы не зависнуть в бесконечности
    public shapes: Shape[] = []; // OCP в действии: движок знает только про абстрактный Shape

    // Трассировка луча: возвращает массив точек излома (траекторию)
    traceRay(startRay: Ray): Vector2D[] {
        let currentRay = startRay;
        const points: Vector2D[] = [currentRay.origin.clone()]; // Первая точка - старт луча

        for (let bounce = 0; bounce < this.maxBounces; bounce++) {
            let closestIntersection = null;

            // Находим ближайшую стену (ту, что имеет минимальный distance)
            for (const shape of this.shapes) {
                const intersection = shape.intersect(currentRay);
                if (intersection) {
                    // Важный хак: игнорируем пересечения на дистанции ~0. 
                    // Без этого луч "застрянет" в стене, постоянно отражаясь от неё же.
                    if (intersection.distance > 0.001) {
                        if (!closestIntersection || intersection.distance < closestIntersection.distance) {
                            closestIntersection = intersection;
                        }
                    }
                }
            }

            if (closestIntersection) {
                points.push(closestIntersection.point); // Записываем точку столкновения
                
                // ОТРАЖАЕМ ЛУЧ С ПОМОЩЬЮ ТВОЕЙ МАТЕМАТИКИ
                const reflectedDir = currentRay.dir.reflect(closestIntersection.normal);
                
                // Создаем новый луч из точки столкновения
                currentRay = new Ray(closestIntersection.point, reflectedDir);
            } else {
                // Если луч ни с чем не столкнулся (улетел за горизонт)
                points.push(currentRay.getPointAt(2000));
                break;
            }
        }

        return points;
    }
}
