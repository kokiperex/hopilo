import './styles/main.css';
import { Game } from './game/Game';

const root = document.querySelector<HTMLDivElement>('#game-root');

if (!root) {
  throw new Error('Game root element was not found.');
}

const game = new Game(root);
void game.start();

if (import.meta.hot) import.meta.hot.dispose(() => game.dispose());
