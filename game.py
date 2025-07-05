# game.py
from random import randint
import random
import math
from models import Dot, Vec, Segments
from calculations import getCrossDotWithWall, getCrossDotWithRay, get_gradient_color, fastCrossingVectors
from settings import SCREEN_WIDTH, SCREEN_HEIGHT, RED

def initialize_game():
    np = 0
    LU, RU = Dot(x=np, y=np), Dot(x=SCREEN_WIDTH - np, y=np)
    LD, RD = Dot(x=np, y=SCREEN_HEIGHT - np), Dot(x=SCREEN_WIDTH - np, y=SCREEN_HEIGHT - np)

    Walls = [
        Segments(LU, RU),
        Segments(LU, LD),
        Segments(RU, RD),
        Segments(LD, RD)
    ]

    A0 = Dot(x=randint(300, SCREEN_WIDTH - 300), y=randint(300, SCREEN_HEIGHT - 300))
    A0.x, A0.y = SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2
    A0.print()

    alfa = 0
    null_vec = Vec(x=1, y=0)
    A1 = null_vec.RotatedVec(alfa)
    print(alfa, alfa / 2)

    k = 100
    B0 = Dot(x=(A0.x + A1.x * k), y=(A0.y + A1.y * k), c=RED)
    Ray = [Segments(A0, B0)]
    newDots = []
    Dots = []
    return Walls, Ray, newDots, Dots

def NewRotate(Walls, Ray):
    """
    Создаёт новую точку или стенку отражённую от точки
    1) Если предыдущая точка не является точкой пересечения, то создаётся стенка
    2) Если предыдущая точка является точкой пересечения, то создаётся точка,
       которая либо пересекают какую-то новую стенку либо нет
    """
    A, B = Ray[-1].A, Ray[-1].B

    AB = Vec(x=(B.x - A.x), y=(B.y - A.y))

    if B.belongsWall is None:
        """ПОЯВЛЕНИЕ СТЕНКИ ОТРАЖЕНИЯ"""
        alfa = randint(15, 165) if random.random() < 0.5 else random.randint(195, 345)
        # alfa = 90
        # BD - вектор для стенки отражения
        BD = AB.RotatedVec(alfa / 2)
        sizeBD = 1 / math.sqrt(BD.x ** 2 + BD.y ** 2)

        print("Здесь 1")
        CrossDot1, _, distanceToWall = getCrossDotWithWall(BD, B, Walls)
        distanceToRay = getCrossDotWithRay(BD, B, Ray)
        print(f"DISTANCE_TO_WALL: {distanceToWall}, DISTANCE_TO_RAY: {distanceToRay}")
        if (distanceToRay < distanceToWall) and (0 < distanceToRay < 100):
            if distanceToRay < 10:
                length = 2
            else:
                length = randint(4, distanceToRay - 5)
            D = Dot(x=(B.x + BD.x * sizeBD * length),
                    y=(B.y + BD.y * sizeBD * length))
        elif distanceToWall < 100:
            D = CrossDot1
        else:
            length = randint(25, 75)
            D = Dot(x=(B.x + BD.x * sizeBD * length),
                    y=(B.y + BD.y * sizeBD * length))

        minusBD = Vec(x=-BD.x, y=-BD.y)

        CrossDot2, _, distanceToWall = getCrossDotWithWall(minusBD, B, Walls)
        distanceToRay = getCrossDotWithRay(minusBD, B, Ray)
        if (distanceToRay < distanceToWall) and (0 < distanceToRay < 100):
            if distanceToRay < 10:
                length = 2
            else:
                length = randint(4, distanceToRay - 5)
            L = Dot(x=(B.x + minusBD.x * sizeBD * length),
                    y=(B.y + minusBD.y * sizeBD * length))
        elif distanceToWall < 100:
            L = CrossDot2
        else:
            length = randint(25, 75)
            L = Dot(x=(B.x + minusBD.x * sizeBD * length),
                    y=(B.y + minusBD.y * sizeBD * length))

        DL = Segments(D, L)
        print("B и DL")
        B.print()
        DL.print()

        B.belongsWall = DL
        Walls.append(DL)
    else:
        """СОЗДАНИЕ НОВОЙ ТОЧКИ, КОТОРАЯ ЛИБО ПЕРЕСЕКАЕТ КАКУЮ-ТО СТЕНКУ ЛИБО НЕТ"""
        BD = B.belongsWall.getVector()
        # 2) Строим D как продолжение вектора AB
        D = Dot(x=(B.x + AB.x), y=(B.y + AB.y))
        # Dots.append(D)

        normal_BD = Vec(x=BD.y, y=-BD.x)
        D_H = fastCrossingVectors(D.x, D.y, normal_BD.x, normal_BD.y, B.x, B.y, BD.x, BD.y)
        # Dots.append(D_H)

        D_L = Dot(x=(2 * D_H.x - D.x), y = (2 * D_H.y - D.y))
        # Dots.append(D_L)

        Reflected_AB = Vec(x=(D_L.x - B.x), y=(D_L.y - B.y))

        Reflected_AB.print()
        B.print()
        print(B.belongsWall.print())
        print("Здесь 2")
        CrossDot1, WallwithDot, distanceToWall = getCrossDotWithWall(Reflected_AB, B, Walls)

        if distanceToWall < 100:
            # Точка появляется прямо на стенке
            M = CrossDot1
            M.belongsWall = WallwithDot
        else:
            # Точка появляется на расстояние от стенки и предыдущей точки
            length = randint(50, distanceToWall - 50)
            distanceToRay = getCrossDotWithRay(Reflected_AB, B, Ray)
            sized_Reflected_AB = 1 / math.sqrt(Reflected_AB.x ** 2 + Reflected_AB.y ** 2)
            if abs(length - distanceToRay) < 20:
                length -= 40

            M = Dot(x=(B.x + Reflected_AB.x * sized_Reflected_AB * length),
                    y=(B.y + Reflected_AB.y * sized_Reflected_AB * length))

        new_color = get_gradient_color(len(Ray))
        BM = Segments(B, M, color=new_color)
        print("ТУТУ")
        Reflected_AB.print()
        B.print()
        M.print()
        Ray.append(BM)