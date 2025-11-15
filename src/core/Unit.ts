import { Unit, UnitType, Vec2 } from '../types';
import { createBrain } from '../types/neural';
let unitIdCounter = 0;
export function createUnit(position: Vec2, countryId: string, isMilitary: boolean, networkShape: number[], isWorker: boolean, gender: 'male'|'female', age: number): Unit {
  return {
    id: `unit_${unitIdCounter++}`,
    type: isMilitary ? UnitType.MILITARY : UnitType.CIVILIAN,
    isWorker,
    gender,
    age,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    health: 100,
    energy: 100,
    brain: createBrain(networkShape),
    countryId,
    alive: true,
    resources: 0,
    children: 0,
    spouseId: '',
    pregnant: false,
    lastRepro: 0
  };
}
// ... getUnitInputs, applyUnitOutputs — добавим далее: параметры пола, возраста, ресурсов