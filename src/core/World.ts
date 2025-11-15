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
    resources: [],
    time: 0,
    gridSize: config.gridSize
  };
}

export function generateResources(world: World, count: number): void {
  // Спавним ресурсы случайно по карте
  for (let i = 0; i < count; i++) {
    const x = Math.random() * (world.bounds.maxX - world.bounds.minX) + world.bounds.minX;
    const y = Math.random() * (world.bounds.maxY - world.bounds.minY) + world.bounds.minY;
    world.resources.push({
      id: `res_${i}`,
      position: { x, y },
      type: Math.random() < 0.5 ? 'wood' : 'food',
      amount: Math.floor(30 + Math.random() * 70)
    });
  }
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
  const { capital, territory } = country;
  const area = territory[2].x - territory[0].x;
  for (let i = 0; i < count; i++) {
    const x = territory[0].x + Math.random() * area;
    const y = territory[0].y + Math.random() * area;
    // распределяем роли
    const isWorker = i % 3 === 0;
    const isMilitary = i % 5 === 0;
    const gender = Math.random() < 0.5 ? 'male' : 'female';
    const age = 18 + Math.floor(Math.random() * 30);
    world.units.push(createUnit({ x, y }, country.id, isMilitary, config.neuralNetworkShape, isWorker, gender, age));
  }
}

export function collectResources(unit: Unit, world: World): void {
  // Ищет и собирает ресурсы (если рабочий)
  if (!unit.isWorker) return;
  let closestRes = null;
  let minDist = Infinity;
  for (const res of world.resources) {
    if (res.amount <= 0) continue;
    const dx = res.position.x - unit.position.x;
    const dy = res.position.y - unit.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      closestRes = res;
    }
  }
  if (closestRes && minDist < 32) {
    const gather = Math.min(unit.energy/20, closestRes.amount, 5);
    unit.resources += gather;
    closestRes.amount -= gather;
    unit.energy = Math.max(0, unit.energy - gather);
  } else if (closestRes) {
    // двигаться к ресурсу
    const dx = closestRes.position.x - unit.position.x;
    const dy = closestRes.position.y - unit.position.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0.1) {
      unit.velocity.x = dx / len * 2;
      unit.velocity.y = dy / len * 2;
    }
  }
}

export function updateWorld(world: World, deltaTime: number): void {
  world.time += deltaTime;
  for (const unit of world.units) {
    if (!unit.alive) continue;
    unit.age += deltaTime / 8;
    unit.energy -= deltaTime * 0.08 + unit.age/300;
    if (unit.energy <= 0) { unit.alive = false; unit.health = 0; continue; }
    if (unit.age > 90 && Math.random() < 0.0001) unit.alive = false;
    unit.position.x += unit.velocity.x * deltaTime;
    unit.position.y += unit.velocity.y * deltaTime;
    if (unit.isWorker) collectResources(unit, world);
    // old age debuff
    if (unit.age > 60) { unit.health *= 0.996; }
  }
  world.units = world.units.filter(u => u.alive);
  for (const country of world.countries) {
    country.population = world.units.filter(u => u.countryId === country.id).length;
    // Расширение территорий
    if (country.population > country.territory.length * 2 && country.territory.length < 12) {
      country.territory.push({
        x: country.territory[2].x + 18,
        y: country.territory[2].y + 18
      });
    }
  }
}

// ... Для простоты в этой версии войны, размножение, дети и битвы будут в следующих коммитах!