import { Ray } from '../math/Ray';
import { Vector2D } from '../math/Vector2D';

// Класс, описывающий точку столкновения луча и стены
export class Intersection {
    constructor(
        public point: Vector2D,    // Точка, где произошло столкновение
        public normal: Vector2D,   // Перпендикуляр в этой точке (нужен для отражения)
        public distance: number    // Расстояние от старта луча до точки (чтобы найти ближайшую стену)
    ) {}
}

// Тот самый интерфейс, который делает наш код открытым для расширения (OCP)
export interface Shape {
    // Если луч пересекает фигуру, возвращаем данные о пересечении. Если мимо — возвращаем null.
    intersect(ray: Ray): Intersection | null;
    distanceTo(point: Vector2D): number; // Возвращает расстояние до курсора мыши (для выделения)
    move(delta: Vector2D): void;         // Сдвигает фигуру на заданный вектор
}
