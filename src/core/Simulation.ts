import { World, Unit } from '../types';
import { forwardPass } from '../types/neural';
import { getUnitInputs, applyUnitOutputs } from './Unit';
import { updateWorld } from './World';

export class Simulation {
  world: World;
  running: boolean = false;
  lastTime: number = 0;

  constructor(world: World) {
    this.world = world;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.running = false;
  }

  loop(): void {
    if (!this.running) return;

    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000; // в секундах
    this.lastTime = now;

    this.tick(deltaTime);

    requestAnimationFrame(() => this.loop());
  }

  tick(deltaTime: number): void {
    // Обновление поведения всех юнитов через нейросеть
    this.world.units.forEach(unit => {
      if (!unit.alive) return;

      const inputs = getUnitInputs(unit, this.world);
      const outputs = forwardPass(unit.brain.network, inputs);
      applyUnitOutputs(unit, outputs);

      // Обновление фитнеса (чем дольше живёт, тем лучше)
      unit.brain.fitness += deltaTime;
    });

    // Обновление мира
    updateWorld(this.world, deltaTime);
  }

  // Добавление юнита вручную
  addUnit(unit: Unit): void {
    this.world.units.push(unit);
  }

  // Получение статистики
  getStats() {
    const aliveUnits = this.world.units.filter(u => u.alive);
    const avgFitness =
      aliveUnits.reduce((sum, u) => sum + u.brain.fitness, 0) /
      (aliveUnits.length || 1);

    return {
      time: this.world.time.toFixed(1),
      totalUnits: this.world.units.length,
      aliveUnits: aliveUnits.length,
      countries: this.world.countries.length,
      avgFitness: avgFitness.toFixed(2)
    };
  }
}