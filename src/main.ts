import Phaser from 'phaser';
import { GameConfig } from './game/config';

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(GameConfig);
});
