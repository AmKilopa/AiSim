import { World, Bounds, Country, Unit, SimConfig } from '../types';
import { createUnit } from './Unit';

export function createWorld(config: SimConfig): World {
  return {
    bounds: {
      minX: 0,
      maxX: config.worldSize.width,
      minY: 0,
      maxY: config.worldSize.height
    },
    units: [],
    countries: [],
    time: 0,
    gridSize: config.gridSize
  };
}

export function addCountry(world: World, country: Country): void {
  world.countries.push(country);
}

export function spawnUnitsForCountry(
  world: World,
  country: Country,
  count: number,
  config: SimConfig
): void {
  const spawnRadius = 100;
  const { x, y } = country.capital;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * spawnRadius;
    const position = {
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance
    };

    const isMilitary = i < count / 3; // 1/3 военных, 2/3 гражданских
    const unit = createUnit(
      position,
      country.id,
      isMilitary,
      config.neuralNetworkShape
    );

    world.units.push(unit);
  }
}

export function updateWorld(world: World, deltaTime: number): void {
  world.time += deltaTime;

  // Обновление всех юнитов
  world.units.forEach(unit => {
    if (!unit.alive) return;

    // Увеличение возраста
    unit.age += deltaTime;

    // Уменьшение энергии
    unit.energy -= deltaTime * 0.1;

    if (unit.energy <= 0) {
      unit.alive = false;
      unit.health = 0;
      return;
    }

    // Обновление позиции
    unit.position.x += unit.velocity.x * deltaTime;
    unit.position.y += unit.velocity.y * deltaTime;

    // Проверка границ
    if (unit.position.x < world.bounds.minX) {
      unit.position.x = world.bounds.minX;
      unit.velocity.x *= -1;
    }
    if (unit.position.x > world.bounds.maxX) {
      unit.position.x = world.bounds.maxX;
      unit.velocity.x *= -1;
    }
    if (unit.position.y < world.bounds.minY) {
      unit.position.y = world.bounds.minY;
      unit.velocity.y *= -1;
    }
    if (unit.position.y > world.bounds.maxY) {
      unit.position.y = world.bounds.maxY;
      unit.velocity.y *= -1;
    }
  });

  // Удаление мёртвых юнитов
  world.units = world.units.filter(u => u.alive);

  // Обновление населения стран
  world.countries.forEach(country => {
    country.population = world.units.filter(
      u => u.countryId === country.id
    ).length;
  });
}