import { Camera, Vec2 } from '../types';
import { screenToWorld } from '../core/Camera';

export class InputManager {
  canvas: HTMLCanvasElement;
  camera: Camera;
  isDragging: boolean = false;
  lastMousePos: Vec2 = { x: 0, y: 0 };
  onLeftClick?: (worldPos: Vec2) => void;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.setupListeners();
  }

  setupListeners(): void {
    let mouseDownPos: Vec2 | null = null;

    // Перемещение камеры мышью
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) {
        // Левая кнопка
        mouseDownPos = { x: e.clientX, y: e.clientY };
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

    this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0 && mouseDownPos && this.onLeftClick) {
        // Проверяем, что это был клик, а не драг
        const dx = e.clientX - mouseDownPos.x;
        const dy = e.clientY - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          // Это клик!
          const worldPos = screenToWorld(
            { x: e.offsetX, y: e.offsetY },
            this.camera,
            this.canvas.width,
            this.canvas.height
          );
          this.onLeftClick(worldPos);
        }
      }

      this.isDragging = false;
      mouseDownPos = null;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      mouseDownPos = null;
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