import { SimConfig, Country, Vec2, Unit } from './types';
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
const placeCountryBtn = document.getElementById('placeCountryBtn') as HTMLButtonElement;
const unitInfoDiv = document.getElementById('unitInfo') as HTMLDivElement;

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

// ===== Состояние приложения =====
let placingCountry = false;
let selectedUnit: Unit | null = null;

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

function createCountryAtPosition(pos: Vec2): Country {
  const country: Country = {
    id: `country_${countryCounter}`,
    name: `Страна ${countryCounter + 1}`,
    color: countryColors[countryCounter % countryColors.length],
    population: 0,
    resources: 1000,
    territory: [],
    capital: pos
  };

  countryCounter++;
  return country;
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

placeCountryBtn.addEventListener('click', () => {
  placingCountry = !placingCountry;
  placeCountryBtn.textContent = placingCountry ? 'Отменить размещение' : 'Разместить страну';
  placeCountryBtn.style.background = placingCountry ? '#ff8800' : '#3388ff';
  canvas.style.cursor = placingCountry ? 'crosshair' : 'grab';
});

// Обработка кликов для размещения стран и выбора юнитов
inputManager.onLeftClick = (worldPos: Vec2) => {
  if (placingCountry) {
    // Размещение новой страны
    const country = createCountryAtPosition(worldPos);
    addCountry(world, country);
    spawnUnitsForCountry(world, country, config.startingUnitsPerCountry, config);
    
    placingCountry = false;
    placeCountryBtn.textContent = 'Разместить страну';
    placeCountryBtn.style.background = '#3388ff';
    canvas.style.cursor = 'grab';
  } else {
    // Выбор юнита
    const clickRadius = 15 / camera.zoom;
    let foundUnit: Unit | null = null;
    let minDist = clickRadius;

    world.units.forEach(unit => {
      if (!unit.alive) return;
      const dx = unit.position.x - worldPos.x;
      const dy = unit.position.y - worldPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        foundUnit = unit;
      }
    });

    selectedUnit = foundUnit;
    renderer.selectedUnit = selectedUnit;
    updateUnitInfo();
  }
};

// Обновление информации о юните
function updateUnitInfo() {
  if (!selectedUnit || !selectedUnit.alive) {
    unitInfoDiv.innerHTML = '<div style="color: #888;">Кликните на юнита для просмотра характеристик</div>';
    selectedUnit = null;
    renderer.selectedUnit = null;
    return;
  }

  const country = world.countries.find(c => c.id === selectedUnit!.countryId);
  const typeText = selectedUnit.type === UnitType.MILITARY ? 'Военный' : 'Гражданский';
  const typeColor = selectedUnit.type === UnitType.MILITARY ? '#00ff00' : '#3388ff';

  unitInfoDiv.innerHTML = `
    <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #333;">
      <strong style="color: ${typeColor};">${typeText}</strong>
    </div>
    <div><strong>Страна:</strong> ${country?.name || 'Неизвестно'}</div>
    <div><strong>Здоровье:</strong> <span style="color: ${selectedUnit.health > 50 ? '#00ff00' : '#ff0000'};">${selectedUnit.health.toFixed(1)}%</span></div>
    <div><strong>Энергия:</strong> <span style="color: ${selectedUnit.energy > 50 ? '#00ff88' : '#ffaa00'};">${selectedUnit.energy.toFixed(1)}%</span></div>
    <div><strong>Возраст:</strong> ${selectedUnit.age.toFixed(1)}s</div>
    <div><strong>Позиция:</strong> (${selectedUnit.position.x.toFixed(0)}, ${selectedUnit.position.y.toFixed(0)})</div>
    <div><strong>Скорость:</strong> ${Math.sqrt(selectedUnit.velocity.x ** 2 + selectedUnit.velocity.y ** 2).toFixed(1)}</div>
    <div><strong>Фитнес:</strong> ${selectedUnit.brain.fitness.toFixed(2)}</div>
  `;
}

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

  // Обновление информации о выбранном юните
  if (selectedUnit) {
    updateUnitInfo();
  }

  requestAnimationFrame(renderLoop);
}

renderLoop();

console.log('AiSim запущен! Нажмите РАЗМЕСТИТЬ СТРАНУ для начала.');