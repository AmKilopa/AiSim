import { World, Camera, Unit, Country, UnitType } from '../types';
import { worldToScreen } from '../core/Camera';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  selectedUnit: Unit | null = null;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = camera;
  }

  clear(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(world: World): void {
    this.clear();
    this.drawGrid(world);
    this.drawCountries(world);
    this.drawUnits(world);
    this.drawBounds(world);
  }

  drawGrid(world: World): void {
    const gridSize = world.gridSize;
    const startX = Math.floor(world.bounds.minX / gridSize) * gridSize;
    const endX = Math.ceil(world.bounds.maxX / gridSize) * gridSize;
    const startY = Math.floor(world.bounds.minY / gridSize) * gridSize;
    const endY = Math.ceil(world.bounds.maxY / gridSize) * gridSize;

    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 1;

    // Вертикальные линии
    for (let x = startX; x <= endX; x += gridSize) {
      const screenStart = worldToScreen(
        { x, y: world.bounds.minY },
        this.camera,
        this.canvas.width,
        this.canvas.height
      );
      const screenEnd = worldToScreen(
        { x, y: world.bounds.maxY },
        this.camera,
        this.canvas.width,
        this.canvas.height
      );

      this.ctx.beginPath();
      this.ctx.moveTo(screenStart.x, screenStart.y);
      this.ctx.lineTo(screenEnd.x, screenEnd.y);
      this.ctx.stroke();
    }

    // Горизонтальные линии
    for (let y = startY; y <= endY; y += gridSize) {
      const screenStart = worldToScreen(
        { x: world.bounds.minX, y },
        this.camera,
        this.canvas.width,
        this.canvas.height
      );
      const screenEnd = worldToScreen(
        { x: world.bounds.maxX, y },
        this.camera,
        this.canvas.width,
        this.canvas.height
      );

      this.ctx.beginPath();
      this.ctx.moveTo(screenStart.x, screenStart.y);
      this.ctx.lineTo(screenEnd.x, screenEnd.y);
      this.ctx.stroke();
    }
  }

  drawBounds(world: World): void {
    const topLeft = worldToScreen(
      { x: world.bounds.minX, y: world.bounds.minY },
      this.camera,
      this.canvas.width,
      this.canvas.height
    );
    const bottomRight = worldToScreen(
      { x: world.bounds.maxX, y: world.bounds.maxY },
      this.camera,
      this.canvas.width,
      this.canvas.height
    );

    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
  }

  drawCountries(world: World): void {
    world.countries.forEach(country => {
      const capitalScreen = worldToScreen(
        country.capital,
        this.camera,
        this.canvas.width,
        this.canvas.height
      );

      // Рисуем столицу
      this.ctx.fillStyle = country.color;
      this.ctx.beginPath();
      this.ctx.arc(
        capitalScreen.x,
        capitalScreen.y,
        10 * this.camera.zoom,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Название страны
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${12 * this.camera.zoom}px Arial`;
      this.ctx.fillText(
        `${country.name} (${country.population})`,
        capitalScreen.x + 15 * this.camera.zoom,
        capitalScreen.y
      );
    });
  }

  drawUnits(world: World): void {
    world.units.forEach(unit => {
      if (!unit.alive) return;

      const screenPos = worldToScreen(
        unit.position,
        this.camera,
        this.canvas.width,
        this.canvas.height
      );

      // НОВОЕ: цвета по типу юнита
      const baseColor = unit.type === UnitType.CIVILIAN ? '#3388ff' : '#00ff00';

      // Размеры
      const radius =
        unit.type === UnitType.MILITARY
          ? 6 * this.camera.zoom
          : 4 * this.camera.zoom;

      this.ctx.fillStyle = baseColor;
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Контур для военных
      if (unit.type === UnitType.MILITARY) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }

      // Подсветка выбранного юнита
      if (this.selectedUnit && this.selectedUnit.id === unit.id) {
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, radius + 4, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // Полоска здоровья
      const barWidth = 20 * this.camera.zoom;
      const barHeight = 3 * this.camera.zoom;
      const barX = screenPos.x - barWidth / 2;
      const barY = screenPos.y - radius - 8 * this.camera.zoom;

      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(barX, barY, barWidth, barHeight);

      this.ctx.fillStyle = unit.health > 50 ? '#00ff00' : '#ff0000';
      this.ctx.fillRect(barX, barY, barWidth * (unit.health / 100), barHeight);
    });
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}