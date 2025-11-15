import { SimConfig, Country } from './types';
import { createWorld, addCountry, spawnUnitsForCountry } from './core/World';
import { createCamera } from './core/Camera';
import { Simulation } from './core/Simulation';
import { Renderer } from './renderer/Renderer';
import { InputManager } from './input/InputManager';
import { createUnit } from './core/Unit';
import { UnitType } from './types';

// ===== Конфигурация =====
const config: SimConfig = {
  worldSize: { width: 2000, height: 2000 },
  gridSize: 100,
  startingUnitsPerCountry: 6,
  neuralNetworkShape: [8, 12, 8, 3], // 8 входов, 2 скрытых слоя, 3 выхода
  mutationRate: 0.1,
  ticksPerSecond: 60
};

// ===== Инициализация =====
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const statsDiv = document.getElementById('stats') as HTMLDivElement;
const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const addCountryBtn = document.getElementById(
  'addCountryBtn'
) as HTMLButtonElement;

// Авторесайз канваса
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderer.resize(canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

// Создание мира
const world = createWorld(config);
const camera = createCamera();
camera.x = config.worldSize.width / 2;
camera.y = config.worldSize.height / 2;

const simulation = new Simulation(world);
const renderer = new Renderer(canvas, camera);
const inputManager = new InputManager(canvas, camera);

resizeCanvas();

// ===== Добавление стартовых стран =====
const countryColors = [
  '#ff3333',
  '#3333ff',
  '#33ff33',
  '#ffff33',
  '#ff33ff',
  '#33ffff'
];
let countryCounter = 0;

function createRandomCountry(): Country {
  const padding = 300;
  const x =
    padding + Math.random() * (config.worldSize.width - padding * 2);
  const y =
    padding + Math.random() * (config.worldSize.height - padding * 2);

  const country: Country = {
    id: `country_${countryCounter}`,
    name: `Страна ${countryCounter + 1}`,
    color: countryColors[countryCounter % countryColors.length],
    population: 0,
    resources: 1000,
    territory: [],
    capital: { x, y }
  };

  countryCounter++;
  return country;
}

// Добавляем 2 страны по умолчанию
for (let i = 0; i < 2; i++) {
  const country = createRandomCountry();
  addCountry(world, country);
  spawnUnitsForCountry(world, country, config.startingUnitsPerCountry);
}

// ===== Управление =====
startBtn.addEventListener('click', () => {
  simulation.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
  simulation.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

addCountryBtn.addEventListener('click', () => {
  const country = createRandomCountry();
  addCountry(world, country);
  spawnUnitsForCountry(world, country, config.startingUnitsPerCountry);
});

// Спавн юнита по правой кнопке мыши
inputManager.onSpawnUnit = worldPos => {
  if (world.countries.length === 0) return;

  const country = world.countries[Math.floor(Math.random() * world.countries.length)];
  const unit = createUnit(
    worldPos,
    country.id,
    Math.random() > 0.5,
    config.neuralNetworkShape
  );
  simulation.addUnit(unit);
};

// ===== Цикл рендеринга =====
function renderLoop() {
  renderer.render(world);

  // Обновление статистики
  const stats = simulation.getStats();
  statsDiv.innerHTML = `
    <div><strong>Время:</strong> ${stats.time}s</div>
    <div><strong>Юнитов:</strong> ${stats.aliveUnits} / ${stats.totalUnits}</div>
    <div><strong>Стран:</strong> ${stats.countries}</div>
    <div><strong>Ср. фитнес:</strong> ${stats.avgFitness}</div>
    <div><strong>Зум:</strong> ${camera.zoom.toFixed(2)}x</div>
  `;

  requestAnimationFrame(renderLoop);
}

renderLoop();

console.log('AiSim запущен! Нажмите START для начала симуляции.');