import { Unit, UnitType, Vec2 } from '../types';
import { createBrain } from '../types/neural';

let unitIdCounter = 0;

export function createUnit(
  position: Vec2,
  countryId: string,
  isMilitary: boolean,
  networkShape: number[]
): Unit {
  return {
    id: `unit_${unitIdCounter++}`,
    type: isMilitary ? UnitType.MILITARY : UnitType.CIVILIAN,
    position: { ...position },
    velocity: {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20
    },
    health: 100,
    energy: 100,
    brain: createBrain(networkShape),
    countryId,
    alive: true,
    age: 0
  };
}

export function getUnitInputs(unit: Unit, world: any): number[] {
  // Входные данные для нейросети:
  // 1. Нормализованная позиция
  // 2. Скорость
  // 3. Здоровье и энергия
  // 4. Расстояние до ближайшего врага

  const inputs: number[] = [
    unit.position.x / world.bounds.maxX,
    unit.position.y / world.bounds.maxY,
    unit.velocity.x / 50,
    unit.velocity.y / 50,
    unit.health / 100,
    unit.energy / 100
  ];

  // Поиск ближайшего врага
  let closestEnemy: Unit | null = null;
  let minDist = Infinity;

  world.units.forEach((other: Unit) => {
    if (other.id === unit.id || other.countryId === unit.countryId) return;
    if (!other.alive) return;

    const dx = other.position.x - unit.position.x;
    const dy = other.position.y - unit.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closestEnemy = other;
    }
  });

  if (closestEnemy) {
    const dx = closestEnemy.position.x - unit.position.x;
    const dy = closestEnemy.position.y - unit.position.y;
    inputs.push(dx / 500, dy / 500);
  } else {
    inputs.push(0, 0);
  }

  return inputs;
}

export function applyUnitOutputs(unit: Unit, outputs: number[]): void {
  // Выходные данные:
  // 0-1: направление движения (x, y)
  // 2: скорость

  const speed = Math.abs(outputs[2] || 0) * 30;
  unit.velocity.x = (outputs[0] || 0) * speed;
  unit.velocity.y = (outputs[1] || 0) * speed;
}