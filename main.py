#main.py
import pygame
import sys
from settings import SCREEN_WIDTH, SCREEN_HEIGHT, BLACK, GRAY, BLUE, RED
from game import initialize_game, NewRotate
# Инициализация Pygame
pygame.init()

Walls, Ray, newDots, Dots = initialize_game()

screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("RayToWalls")
clock = pygame.time.Clock()

n = 12
for _ in range(2 * n):
    NewRotate(Walls, Ray)

running = True
while running:
    screen.fill(BLACK)  # Заливка фоном

    for segment in Walls:
        first, second = segment.A, segment.B
        pygame.draw.line(screen, GRAY, (first.x, first.y), (second.x, second.y), 3)
        # pygame.draw.circle(screen, first.c, (first.x, first.y), 2)
        # pygame.draw.circle(screen, second.c, (second.x, second.y), 2)

    for segment in Ray:
        first, second = segment.A, segment.B
        pygame.draw.line(screen, segment.color, (first.x, first.y), (second.x, second.y), 2)
        # pygame.draw.circle(screen, first.c, (first.x, first.y), 4)
        # pygame.draw.circle(screen, second.c, (second.x, second.y), 4)

    for segment in newDots:
        first, second = segment.A, segment.B
        pygame.draw.line(screen, BLUE, (first.x, first.y), (second.x, second.y), 3)
        pygame.draw.circle(screen, first.c, (first.x, first.y), 4)
        pygame.draw.circle(screen, second.c, (second.x, second.y), 4)

    for Dot in Dots:
        pygame.draw.circle(screen, RED, (Dot.x, Dot.y), 4)

    pygame.display.flip()  # Обновляем экран
    # Обработка событий
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    clock.tick(20)

pygame.quit()
sys.exit()
