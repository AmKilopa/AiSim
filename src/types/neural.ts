// ===== Нейросетевые утилиты =====

import { NeuralNetwork, Brain } from './index';

// Activation functions
export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
export const tanh = (x: number): number => Math.tanh(x);
export const relu = (x: number): number => Math.max(0, x);

// Создание случайной нейросети
export function createRandomNetwork(shape: number[]): NeuralNetwork {
  const weights: number[][][] = [];
  const biases: number[][] = [];

  for (let i = 0; i < shape.length - 1; i++) {
    const layerWeights: number[][] = [];
    const layerBiases: number[] = [];

    for (let j = 0; j < shape[i + 1]; j++) {
      const neuronWeights: number[] = [];
      for (let k = 0; k < shape[i]; k++) {
        neuronWeights.push(Math.random() * 2 - 1); // [-1, 1]
      }
      layerWeights.push(neuronWeights);
      layerBiases.push(Math.random() * 2 - 1);
    }

    weights.push(layerWeights);
    biases.push(layerBiases);
  }

  return {
    weights,
    biases,
    activation: tanh
  };
}

// Прогон входных данных через сеть
export function forwardPass(network: NeuralNetwork, inputs: number[]): number[] {
  let activations = [...inputs];

  for (let i = 0; i < network.weights.length; i++) {
    const nextActivations: number[] = [];

    for (let j = 0; j < network.weights[i].length; j++) {
      let sum = network.biases[i][j];

      for (let k = 0; k < activations.length; k++) {
        sum += activations[k] * network.weights[i][j][k];
      }

      nextActivations.push(network.activation(sum));
    }

    activations = nextActivations;
  }

  return activations;
}

// Мутация сети
export function mutateNetwork(
  network: NeuralNetwork,
  mutationRate: number
): NeuralNetwork {
  const newWeights = network.weights.map(layer =>
    layer.map(neuron =>
      neuron.map(weight => {
        if (Math.random() < mutationRate) {
          return weight + (Math.random() * 0.4 - 0.2); // небольшая мутация
        }
        return weight;
      })
    )
  );

  const newBiases = network.biases.map(layer =>
    layer.map(bias => {
      if (Math.random() < mutationRate) {
        return bias + (Math.random() * 0.4 - 0.2);
      }
      return bias;
    })
  );

  return {
    ...network,
    weights: newWeights,
    biases: newBiases
  };
}

// Создание мозга
export function createBrain(networkShape: number[]): Brain {
  return {
    network: createRandomNetwork(networkShape),
    fitness: 0,
    generation: 0
  };
}