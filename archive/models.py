import math

YELLOW = (255, 216, 106)
WHITE = (255, 255, 255)

class Dot:
    def __init__(self, x: int, y: int, belongWall = None, c: (int, int, int) = WHITE):
        self.x = x
        self.y = y
        self.belongsWall = belongWall
        self.c = c

    def print(self):
        print(f"Координаты этой точки: ({self.x},{self.y})")

class Vec:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def RotatedVec(self, angle):
        """Поворачивает вектор на заданный угол (в градусах)."""
        angle = math.radians(angle)
        cosA, sinA = math.cos(angle), -math.sin(angle)
        return Vec(
            x=(self.x * cosA - self.y * sinA),
            y=(self.x * sinA + self.y * cosA)
        )

    def print(self):
        print(f"Вектор: ({self.x},{self.y})")

class Segments:
    counter = 0
    def __init__(self, first_dot: Dot, second_dot: Dot, color = YELLOW):
        Segments.counter += 1
        self.A = first_dot
        self.B = second_dot
        self.id = Segments.counter
        self.color = color
    def getVector(self) -> Vec:
        return Vec(x=(self.B.x - self.A.x), y=(self.B.y - self.A.y))
    def print(self):
        print(f"Отрезок: ({self.A.x},{self.A.y})({self.B.x},{self.B.y})")

