#calculations.py
import math
import colorsys
from models import Dot, Vec, Segments
from settings import YELLOW2

def fastCrossingVectors(x0, y0, m1, p1, x1, y1, m2, p2) -> Dot:
    if (p2 * m1 - p1 * m2) == 0:
        return Dot(x=x0, y=x0)
    x_cross = (m1 * p2 * x1 - m2 * p1 * x0 + m1 * m2 * (y0 - y1)) / (p2 * m1 - p1 * m2)
    y_cross = (p1 * m2 * y1 - p2 * m1 * y0 + p1 * p2 * (x0 - x1)) / (p1 * m2 - p2 * m1)
    return Dot(x=x_cross, y=y_cross)

def crossing(vecL: Vec, AB: Segments, C: Dot) -> (bool, Dot):
    """
    Находит пересечение точки С и вектора vecL с прямой AB и возвращает точку пересечения

    Аргументы:
        vecL: Вектор направления луча
        AB: Отрезок прямой, с которым нужно пересечься
        C: Начальная точка луча

    Возвращается:
        Кортеж из (bool, Dot or None)
    """
    print("НАХОЖУСЬ В ПЕРЕСЕЧЕНИИ")
    m, p = vecL.x, vecL.y
    A, B = AB.A, AB.B
    vecL.print()
    C.print()
    AB.print()
    x1, y1 = A.x, A.y
    x2, y2 = B.x, B.y
    x3, y3 = C.x, C.y

    MinX, MaxX = min(x1, x2), max(x1, x2)
    MinY, MaxY = min(y1, y2), max(y1, y2)

    dominator = (p * (x2 - x1) - (y2 - y1) * m)

    # Если прямые параллельны или близки к ним
    if abs(dominator) < 1e-6:
        print("Частный случай 0: прямые параллельны")
        return False, None

    # Базовые случаи
    if abs(x2 - x1) < 1e-6:
        x = x1
    elif abs(m) < 1e-6:
        x = x3
    else:
        x = ((p * x3 + (y1 - y3) * m) * (x2 - x1) - (y2 - y1) * x1 * m) / dominator

    if abs(y2 - y1) < 1e-6:
        # или y = y2
        print("y = y1")
        y = y1
    elif abs(p) < 1e-6:
        y = y3
    else:
        y = ((m * y3 + p * (x1 - x3)) * (y2 - y1) - (x2 - x1) * y1 * p) / -dominator

    if abs(y - y3) < 1e-6:
        print(f"y = {y}, y3 = {y3}, x = {x}, x = {x3}, m = {m}")
        if ((x - x3) / m > 0) and (MinX - 0.5 <= x <= MaxX + 0.5):
            print("Частный случай 1 (горизонтальный вектор): пересечение найдено")
            return 1, Dot(x=x, y=y)
        print("Частный случай 1 (горизонтальный вектор): не найдено пересечение")
        return False, None
    elif abs(x - x3) < 1e-6:
        if ((y - y3) / p > 0) and (MinY - 0.5 <= y <= MaxY + 0.5):
            print("Частный случай 2 (вертикальный вектор): пересечение найдено")
            return 1, Dot(x=x, y=y)
        print("Частный случай 2 (вертикальный вектор): не найдено пересечение")
        return False, None

    if ((y - y3) / p > 0) and ((x - x3) / m > 0):
        if (MinX - 0.5 <= x <= MaxX + 0.5) and (MinY - 0.5 <= y <= MaxY + 0.5):
            return 1, Dot(x=x, y=y)
    print(f"ТОЧКА ШЛА НЕ ПО ПРЯМОЙ, где AB ({x1:.2f}, {y1:.2f})({x2:.2f}, {y2:.2f}) прямая, которую пересекают\n"
          f"С({x3:.2f},{y3:.2f}) точка, из которой выходит вектор vecL ({m:.2f},{p:.2f})")
    return False, None

def getCrossDotWithWall(VectorToCross: Vec, DotStart: Dot, Walls: list) -> (Dot, Segments, int):
    """
        Находит точку пересечения луча с ближайшей из стенок, эту стенку и расстояние до этой стенки.

        Аргументы:
            VectorToCross (Vec): Вектор направления луча, содержащий компоненты x и y.
            DotStart (Dot): Начальная точка луча с координатами x и y.

        Возвращает:
                - Точку пересечения (Dot) или None, если пересечение не найдено.
                - Стенку (Segments), с которой произошло пересечение, или None.
                - Расстояние до точки пересечения (округленное до целого) или None.
    """

    print(f"\nНачало проверки на пересечение со стенками!\n")
    VectorToCross.print()
    DotStart.print()

    min_distance = float('inf')
    nearestCrossDot = None
    WallWithCrossDot = None

    for Wall in Walls:
        if not DotStart.belongsWall is None and Wall.id == DotStart.belongsWall.id:
            print("Точка принадлежит стенке")
            continue
        CrossingDot = crossing(VectorToCross, Wall, DotStart)
        if CrossingDot[0]:
            CrossingDot[1].print()
            temporary = (CrossingDot[1].x - DotStart.x) ** 2 + (CrossingDot[1].y - DotStart.y) ** 2
            if temporary < min_distance:
                min_distance = temporary
                nearestCrossDot = CrossingDot[1]
                WallWithCrossDot = Wall


    if nearestCrossDot is None:
        print("ОШИБКА ПЕРЕСЕЧЕНИЕ НЕ НАЙДЕНО")
        exit()
    return nearestCrossDot, WallWithCrossDot, round(math.sqrt(min_distance))

def getCrossDotWithRay(VectorToCross: Vec, DotStart: Dot, Ray: list) -> int:
    """
        Находит расстояние до пересечения с лучом, если луча не встретилось по пути, то возвращает -1
        Параметры:
            VectorToCross: Вектор направления луча, содержащий компоненты x и y.
            DotStart: Начальная точка луча с координатами x и y.
        Возвращает:
            - Расстояние до точки пересечения (округленное до целого) или -1, если пересечение не найдено.
    """
    print(f"\nНачало проверки на пересечение с ЛУЧАМИ!\n")
    distance = -1
    for RaySegment in Ray[:-1]:
        CrossingDot = crossing(VectorToCross, RaySegment, DotStart)
        if CrossingDot[0]:
            CrossingDot[1].print()
            temporary = (CrossingDot[1].x - DotStart.x) ** 2 + (CrossingDot[1].y - DotStart.y) ** 2
            if distance == -1 or (temporary < distance):
                distance = temporary
    return round(math.sqrt(distance)) if distance > 0 else -1

def get_gradient_color(index: int) -> tuple:
    """Вычисляет цвет для сегмента луча с плавным изменением оттенка от жёлтого."""
    # Базовый цвет в RGB
    r, g, b = YELLOW2
    # Преобразуем RGB в HSV (значения от 0 до 1)
    h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
    new_h = (h + index * 0.05) % 1.0
    # Преобразуем обратно в RGB (значения от 0 до 255)
    new_r, new_g, new_b = colorsys.hsv_to_rgb(new_h, s, v)
    return int(new_r * 255), int(new_g * 255), int(new_b * 255)