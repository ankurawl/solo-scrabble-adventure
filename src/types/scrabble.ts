
export interface Tile {
  id: string;
  letter: string;
  points: number;
  isPlaced: boolean;
}

export interface BoardCell {
  row: number;
  col: number;
  type: 'regular' | 'center' | 'double-letter' | 'triple-letter' | 'double-word' | 'triple-word';
  tile: Tile | null;
}

export interface BoardState {
  cells: BoardCell[][];
}

export interface GameState {
  board: BoardState;
  rack: Tile[];
  bag: Tile[];
  score: number;
  currentWord: Tile[];
  isPlaying: boolean;
}

export type Direction = 'horizontal' | 'vertical';
