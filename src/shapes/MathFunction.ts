import { Ray } from '../math/Ray';
import { Vector2D } from '../math/Vector2D';
import { Intersection } from './Shape';
import type { Shape } from './Shape';

export class MathFunction implements Shape {
    /**
     * @param f Сама функция, например: (x) => Math.sin(x / 50) * 100 + 400
     * @param df Производная функции, например: (x) => (Math.cos(x / 50) * 100) / 50
     */
    constructor(
        public f: (x: number) => number,
        public df: (x: number) => number
    ) {}

    intersect(ray: Ray): Intersection | null {
        // Мы ищем такое t, при котором y луча равен y функции:
        // ray.origin.y + t * ray.dir.y = f(ray.origin.x + t * ray.dir.x)
        // Перенесем всё в одну сторону, чтобы искать ноль (F(t) = 0):
        const F = (t: number) => {
            const px = ray.origin.x + t * ray.dir.x;
            const py = ray.origin.y + t * ray.dir.y;
            return this.f(px) - py;
        };

        const maxT = 3000; // Максимальная дальность луча
        const step = 2;    // Шаг проверки (Ray Marching)
        const tStart = 1;  // Начинаем проверку чуть дальше от старта (избегаем бага самопересечения)
        
        let prevF = F(tStart);
        let prevSign = Math.sign(prevF);

        // Идем вдоль луча небольшими шагами
        for (let t = tStart + step; t <= maxT; t += step) {
            const currentF = F(t);
            const currentSign = Math.sign(currentF);

            // Если знак поменялся, значит мы "проткнули" график функции!
            if (currentSign !== prevSign) {
                // Используем бинарный поиск (Метод дихотомии), чтобы найти точное место
                let tLeft = t - step;
                let tRight = t;
                let tMid = tLeft;

                for (let i = 0; i < 15; i++) { // 15 итераций дают отличную точность
                    tMid = (tLeft + tRight) / 2;
                    if (Math.sign(F(tMid)) === prevSign) {
                        tLeft = tMid;
                    } else {
                        tRight = tMid;
                    }
                }

                const point = ray.getPointAt(tMid);

                // --- ТВОЯ МАГИЯ ПРОИЗВОДНОЙ ---
                // Производная df(x) - это угловой коэффициент касательной (k)
                const k = this.df(point.x);
                
                // Вектор касательной: (1, k)
                // Перпендикуляр (нормаль) к касательной: (-k, 1)
                let normal = new Vector2D(-k, 1).normalize();

                // Разворачиваем нормаль навстречу лучу, если нужно
                if (ray.dir.dot(normal) > 0) {
                    normal = normal.multiply(-1);
                }

                return new Intersection(point, normal, tMid);
            }
            prevF = currentF;
            prevSign = currentSign;
        }

        return null;
    }
}
