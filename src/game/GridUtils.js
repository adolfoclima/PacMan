import { GAME_CONFIG } from "../config/gameConfig.js";

export function toGrid(value) {
  return (value - GAME_CONFIG.tileSize / 2) / GAME_CONFIG.tileSize;
}

export function toGridIndex(value) {
  return Math.round(toGrid(value));
}

export function toWorld(index) {
  return index * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2;
}

export function isAtGridCenter(value, tolerance = 0.065) {
  const gridPosition = toGrid(value);
  return Math.abs(gridPosition - Math.round(gridPosition)) < tolerance;
}

export function snapToGrid(entity) {
  entity.x = toWorld(Math.round(toGrid(entity.x)));
  entity.y = toWorld(Math.round(toGrid(entity.y)));
}
