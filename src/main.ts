import './style.css';
import { Engine } from './Engine';
import { Vector2D } from './math/Vector2D';
import { Ray } from './math/Ray';
import { LineSegment } from './shapes/LineSegment';
import { MathFunction } from './shapes/MathFunction';
import { Circle } from './shapes/Circle';
import type { Shape } from './shapes/Shape';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Подгоняем Canvas под размер экрана
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- ИНИЦИАЛИЗАЦИЯ ДВИЖКА (CONTROLLER + MODEL) ---
const engine = new Engine();

const w = window.innerWidth;
const h = window.innerHeight;
const margin = 100;

// Строим внешнюю коробку
engine.shapes.push(
    new LineSegment(new Vector2D(margin, margin), new Vector2D(w - margin, margin)),
    new LineSegment(new Vector2D(w - margin, margin), new Vector2D(w - margin, h - margin)),
    new LineSegment(new Vector2D(w - margin, h - margin), new Vector2D(margin, h - margin)),
    new LineSegment(new Vector2D(margin, h - margin), new Vector2D(margin, margin))
);

// Добавляем пару препятствий внутри
engine.shapes.push(
    new LineSegment(new Vector2D(w/2, margin), new Vector2D(w/2, h/2)), // Вертикальная стенка
    new LineSegment(new Vector2D(w/4, h*0.7), new Vector2D(w*0.75, h*0.8)) // Диагональная стенка
);

// --- ТВОЯ МАТЕМАТИЧЕСКАЯ ФУНКЦИЯ ---
// Рисуем красивую синусоиду прямо по центру экрана
engine.shapes.push(
    new MathFunction(
        (x) => Math.sin(x / 50) * 100 + h / 2, // Функция
        (x) => Math.cos(x / 50) * 2            // Производная (скорость изменения)
    )
);

// --- СОСТОЯНИЕ РЕДАКТОРА ---
type Tool = 'pointer' | 'line' | 'circle' | 'rect' | 'triangle' | 'sin' | 'parabola' | 'custom';
let currentTool: Tool = 'pointer'; // Режим мыши по умолчанию

let isMouseDown = false;
let dragStartPos: Vector2D | null = null;
let lastMousePos: Vector2D | null = null;

let tempCircle: Circle | null = null; // Круг, который мы сейчас рисуем (тянем)
let activeShape: Shape | null = null; // Выделенная фигура (для перемещения и удаления)

let mousePos = new Vector2D(w / 2, h / 2);

// Подключаем кнопки боковой панели
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        const id = card.id;
        if (id === 'tool-pointer') currentTool = 'pointer';
        else if (id === 'tool-circle') currentTool = 'circle';
        else if (id === 'tool-line') currentTool = 'line';
        // (Остальные добавим позже)
    });
});

// Удаление фигуры на Backspace / Delete
window.addEventListener('keydown', (e) => {
    if ((e.key === 'Backspace' || e.key === 'Delete') && activeShape) {
        engine.shapes = engine.shapes.filter(s => s !== activeShape);
        activeShape = null; // Сбрасываем выделение после удаления
    }
});

window.addEventListener('mousedown', (e) => {
    // Игнорируем клики по панели интерфейса
    if ((e.target as HTMLElement).closest('#sidebar') || (e.target as HTMLElement).closest('.btn-toggle')) {
        return;
    }
    
    isMouseDown = true;
    dragStartPos = new Vector2D(e.clientX, e.clientY);
    lastMousePos = new Vector2D(e.clientX, e.clientY);

    if (currentTool === 'pointer') {
        // Ищем фигуру, по которой кликнули (в пределах 15 пикселей от курсора)
        let closestShape: Shape | null = null;
        let minDist = 15;

        for (const shape of engine.shapes) {
            const dist = shape.distanceTo(dragStartPos);
            if (dist < minDist) {
                minDist = dist;
                closestShape = shape;
            }
        }
        activeShape = closestShape; // Выделяем найденную фигуру
    } else if (currentTool === 'circle') {
        activeShape = null;
        // Начинаем рисовать новый круг
        tempCircle = new Circle(dragStartPos, 1);
    }
});

window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    if (isMouseDown && dragStartPos && lastMousePos) {
        if (currentTool === 'pointer' && activeShape) {
            // --- ПЕРЕМЕЩЕНИЕ ФИГУРЫ ---
            const delta = mousePos.sub(lastMousePos);
            activeShape.move(delta);
        } else if (currentTool === 'circle' && tempCircle) {
            // Динамически меняем радиус при перетаскивании мыши
            tempCircle.radius = mousePos.sub(dragStartPos).magnitude();
        }
    }
    
    if (isMouseDown) {
        lastMousePos = new Vector2D(mousePos.x, mousePos.y);
    }
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
    
    if (currentTool === 'circle' && tempCircle && tempCircle.radius > 5) {
        engine.shapes.push(tempCircle);
    }
    tempCircle = null;
    dragStartPos = null;
    lastMousePos = null;
});

// --- ГЛАВНЫЙ ЦИКЛ ОТРИСОВКИ (VIEW) ---
function render() {
    // 1. Очищаем экран (заливаем темным цветом)
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Отрисовываем все физические объекты сцены
    for (const shape of engine.shapes) {
        // Делаем линии толще, если фигура выделена мышкой
        ctx.lineWidth = (shape === activeShape) ? 4 : 2;

        if (shape instanceof LineSegment) {
            ctx.strokeStyle = (shape === activeShape) ? '#fff' : '#555';
            ctx.beginPath();
            ctx.moveTo(shape.a.x, shape.a.y);
            ctx.lineTo(shape.b.x, shape.b.y);
            ctx.stroke();
        } else if (shape instanceof MathFunction) {
            ctx.strokeStyle = (shape === activeShape) ? '#fff' : '#00f2fe';
            ctx.beginPath();
            ctx.moveTo(0, shape.f(0));
            // Рисуем график по точкам слева направо
            for (let x = 1; x < canvas.width; x += 5) {
                ctx.lineTo(x, shape.f(x));
            }
            ctx.stroke();
        } else if (shape instanceof Circle) {
            ctx.strokeStyle = (shape === activeShape) ? '#fff' : '#ff9a9e';
            ctx.beginPath();
            ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Если мы прямо сейчас тянем новый круг - рисуем его полупрозрачным
    if (tempCircle) {
        ctx.strokeStyle = 'rgba(255, 154, 158, 0.5)';
        ctx.setLineDash([5, 5]); // Пунктирная линия для предпросмотра
        ctx.beginPath();
        ctx.arc(tempCircle.center.x, tempCircle.center.y, tempCircle.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Возвращаем сплошную линию
    }

    // 3. Выпускаем луч из центра экрана в сторону мыши
    const rayOrigin = new Vector2D(w / 2, h / 2);
    const rayDir = mousePos.sub(rayOrigin);
    
    // Если мышка не в самом центре (длина вектора направления > 0)
    if (rayDir.magnitude() > 0) {
        const ray = new Ray(rayOrigin, rayDir);
        
        // Магия движка: получаем траекторию луча со всеми рикошетами!
        const bouncePoints = engine.traceRay(ray);

        // Рисуем лазер (зеленая линия)
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bouncePoints[0].x, bouncePoints[0].y);
        for (let i = 1; i < bouncePoints.length; i++) {
            ctx.lineTo(bouncePoints[i].x, bouncePoints[i].y);
        }
        ctx.stroke();

        // Рисуем яркие точки на местах излома
        ctx.fillStyle = '#FFF';
        for (const pt of bouncePoints) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Просим браузер отрисовать следующий кадр (обычно 60 раз в секунду)
    requestAnimationFrame(render);
}

// --- ЛОГИКА ИНТЕРФЕЙСА (UI) ---
const sidebar = document.getElementById('sidebar')!;
const sidebarToggle = document.getElementById('sidebar-toggle')!;

sidebarToggle.addEventListener('click', () => {
    // Переключаем класс 'closed', который сдвигает панель
    sidebar.classList.toggle('closed');
});

// Запуск!
render();
