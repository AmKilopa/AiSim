// ===== Базовые типы =====

export interface Vec2 {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// ===== Нейросеть =====

export interface NeuralNetwork {
  weights: number[][][]; // [layer][neuron][weight]
  biases: number[][];
  activation: (x: number) => number;
}

export interface Brain {
  network: NeuralNetwork;
  fitness: number;
  generation: number;
}

// ===== Агенты =====

export enum UnitType {
  CIVILIAN = 'civilian',
  MILITARY = 'military'
}

export interface Unit {
  id: string;
  type: UnitType;
  position: Vec2;
  velocity: Vec2;
  health: number;
  energy: number;
  brain: Brain;
  countryId: string;
  alive: boolean;
  age: number;
}

// ===== Страны =====

export interface Country {
  id: string;
  name: string;
  color: string;
  population: number;
  resources: number;
  territory: Vec2[]; // точки территории
  capital: Vec2;
}

// ===== Мир =====

export interface World {
  bounds: Bounds;
  units: Unit[];
  countries: Country[];
  time: number;
  gridSize: number;
}

// ===== Камера =====

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

// ===== Конфигурация =====

export interface SimConfig {
  worldSize: { width: number; height: number };
  gridSize: number;
  startingUnitsPerCountry: number;
  neuralNetworkShape: number[]; // [inputs, ...hidden, outputs]
  mutationRate: number;
  ticksPerSecond: number;
}