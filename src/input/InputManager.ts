import { Camera, Vec2 } from '../types';
import { screenToWorld } from '../core/Camera';

export class InputManager {
  canvas: HTMLCanvasElement;
  camera: Camera;
  isDragging: boolean = false;
  lastMousePos: Vec2 = { x: 0, y: 0 };
  onSpawnUnit?: (worldPos: Vec2) => void;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.setupListeners();
  }

  setupListeners(): void {
    // Перемещение камеры мышью
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) {
        // Левая кнопка - перетаскивание
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;

        this.camera.x -= dx / this.camera.zoom;
        this.camera.y -= dy / this.camera.zoom;

        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });

    // Зум колёсиком мыши
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = this.camera.zoom * zoomFactor;

      // Ограничения зума
      if (newZoom >= 0.1 && newZoom <= 5) {
        this.camera.zoom = newZoom;
      }
    });

    // Спавн юнита по правой кнопке мыши
    this.canvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();

      if (this.onSpawnUnit) {
        const worldPos = screenToWorld(
          { x: e.offsetX, y: e.offsetY },
          this.camera,
          this.canvas.width,
          this.canvas.height
        );
        this.onSpawnUnit(worldPos);
      }
    });

    // Управление с клавиатуры (WASD / стрелки)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const speed = 20 / this.camera.zoom;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.camera.y -= speed;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.camera.y += speed;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.camera.x -= speed;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.camera.x += speed;
          break;
        case '=':
        case '+':
          if (this.camera.zoom < 5) this.camera.zoom *= 1.1;
          break;
        case '-':
        case '_':
          if (this.camera.zoom > 0.1) this.camera.zoom *= 0.9;
          break;
      }
    });
  }
}