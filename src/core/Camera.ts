import { Camera, Vec2 } from '../types';

export function createCamera(): Camera {
  return {
    x: 0,
    y: 0,
    zoom: 1
  };
}

export function screenToWorld(
  screenPos: Vec2,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
): Vec2 {
  return {
    x: (screenPos.x - canvasWidth / 2) / camera.zoom + camera.x,
    y: (screenPos.y - canvasHeight / 2) / camera.zoom + camera.y
  };
}

export function worldToScreen(
  worldPos: Vec2,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
): Vec2 {
  return {
    x: (worldPos.x - camera.x) * camera.zoom + canvasWidth / 2,
    y: (worldPos.y - camera.y) * camera.zoom + canvasHeight / 2
  };
}