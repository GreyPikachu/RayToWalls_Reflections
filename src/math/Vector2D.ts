export class Vector2D {
    constructor(public x: number, public y: number) {}

    // Сложение векторов
    add(v: Vector2D): Vector2D {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    // Вычитание векторов (получение вектора направления от точки к точке)
    sub(v: Vector2D): Vector2D {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    // Умножение вектора на число (удлинение/укорачивание)
    multiply(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    // Длина (модуль) вектора (по теореме Пифагора)
    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Нормализация вектора (сохраняем направление, но делаем длину равной 1)
    // Это критически важно для нормалей и направлений лучей
    normalize(): Vector2D {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / mag, this.y / mag);
    }

    // Скалярное произведение (Dot Product)
    dot(v: Vector2D): number {
        return this.x * v.x + this.y * v.y;
    }

    // САМАЯ ГЛАВНАЯ ФУНКЦИЯ ПРОЕКТА - ОТРАЖЕНИЕ
    // Формула: R = V - 2(V * N)N, где N - нормализованный вектор нормали
    reflect(normal: Vector2D): Vector2D {
        const n = normal.normalize(); // На всякий случай убеждаемся, что нормаль единичной длины
        const dotProduct2 = this.dot(n) * 2;
        return this.sub(n.multiply(dotProduct2));
    }

    // Клонирование вектора
    clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }
}
