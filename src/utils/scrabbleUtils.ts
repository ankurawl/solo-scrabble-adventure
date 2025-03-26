import { Tile, BoardCell, Direction } from "@/types/scrabble";

// Letter distribution and point values based on standard Scrabble
export const LETTER_DISTRIBUTION = {
  A: { count: 9, points: 1 },
  B: { count: 2, points: 3 },
  C: { count: 2, points: 3 },
  D: { count: 4, points: 2 },
  E: { count: 12, points: 1 },
  F: { count: 2, points: 4 },
  G: { count: 3, points: 2 },
  H: { count: 2, points: 4 },
  I: { count: 9, points: 1 },
  J: { count: 1, points: 8 },
  K: { count: 1, points: 5 },
  L: { count: 4, points: 1 },
  M: { count: 2, points: 3 },
  N: { count: 6, points: 1 },
  O: { count: 8, points: 1 },
  P: { count: 2, points: 3 },
  Q: { count: 1, points: 10 },
  R: { count: 6, points: 1 },
  S: { count: 4, points: 1 },
  T: { count: 6, points: 1 },
  U: { count: 4, points: 1 },
  V: { count: 2, points: 4 },
  W: { count: 2, points: 4 },
  X: { count: 1, points: 8 },
  Y: { count: 2, points: 4 },
  Z: { count: 1, points: 10 },
};

// Dictionary for word validation - small sample for demo
export const DICTIONARY = [
  "apple", "banana", "cat", "dog", "elephant", 
  "frog", "guitar", "house", "ice", "jacket",
  "kite", "lemon", "monkey", "nest", "orange",
  "pencil", "queen", "rabbit", "sun", "tree",
  "umbrella", "violin", "water", "xylophone", "yellow",
  "zebra", "blue", "red", "green", "purple",
  "table", "chair", "book", "lamp", "computer",
  "phone", "cup", "plate", "spoon", "fork",
  "knife", "bowl", "glass", "window", "door",
  "floor", "ceiling", "wall", "roof", "garden",
  "flower", "plant", "tree", "grass", "sky",
  "cloud", "rain", "snow", "sun", "moon",
  "star", "planet", "space", "universe", "galaxy",
  "ocean", "sea", "river", "lake", "mountain",
  "hill", "valley", "forest", "desert", "jungle",
  "island", "beach", "sand", "rock", "stone",
  "metal", "wood", "plastic", "paper", "cloth",
  "cotton", "wool", "silk", "leather", "rubber",
  "gold", "silver", "bronze", "iron", "steel",
  "copper", "tin", "lead", "zinc", "aluminum"
];

// Generate a unique ID for tiles
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Create the initial board with special squares
export const createBoard = (): BoardCell[][] => {
  const board: BoardCell[][] = Array(15)
    .fill(null)
    .map((_, row) =>
      Array(15)
        .fill(null)
        .map((_, col) => ({
          row,
          col,
          type: 'regular',
          tile: null,
        }))
    );

  // Set special squares according to standard Scrabble board
  
  // Triple word score
  const tripleWordCells = [
    [0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]
  ];
  
  // Double word score
  const doubleWordCells = [
    [1, 1], [1, 13], [2, 2], [2, 12], [3, 3], [3, 11], [4, 4], [4, 10],
    [10, 4], [10, 10], [11, 3], [11, 11], [12, 2], [12, 12], [13, 1], [13, 13]
  ];
  
  // Triple letter score
  const tripleLetterCells = [
    [1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]
  ];
  
  // Double letter score
  const doubleLetterCells = [
    [0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12],
    [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8],
    [14, 3], [14, 11]
  ];

  tripleWordCells.forEach(([row, col]) => {
    board[row][col].type = 'triple-word';
  });

  doubleWordCells.forEach(([row, col]) => {
    board[row][col].type = 'double-word';
  });

  tripleLetterCells.forEach(([row, col]) => {
    board[row][col].type = 'triple-letter';
  });

  doubleLetterCells.forEach(([row, col]) => {
    board[row][col].type = 'double-letter';
  });

  // Center square
  board[7][7].type = 'center';

  return board;
};

// Initialize the tile bag based on letter distribution
export const createTileBag = (): Tile[] => {
  const bag: Tile[] = [];
  
  Object.entries(LETTER_DISTRIBUTION).forEach(([letter, { count, points }]) => {
    for (let i = 0; i < count; i++) {
      bag.push({
        id: generateId(),
        letter,
        points,
        isPlaced: false,
      });
    }
  });
  
  // Shuffle the bag
  return shuffleArray(bag);
};

// Draw tiles from the bag
export const drawTiles = (bag: Tile[], count: number): { drawn: Tile[], remaining: Tile[] } => {
  if (bag.length === 0) {
    return { drawn: [], remaining: [] };
  }
  
  const drawn = bag.slice(0, Math.min(count, bag.length));
  const remaining = bag.slice(Math.min(count, bag.length));
  
  return { drawn, remaining };
};

// Shuffle an array (Fisher-Yates algorithm)
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Validate if the word is in the dictionary
export const isValidWord = (word: string): boolean => {
  return DICTIONARY.includes(word.toLowerCase());
};

// Calculate word score with premium squares
export const calculateWordScore = (
  word: Tile[], 
  boardCells: BoardCell[],
  direction: Direction
): number => {
  let wordMultiplier = 1;
  let wordScore = 0;

  word.forEach((tile, index) => {
    let letterMultiplier = 1;
    const cell = boardCells[index];

    if (cell.tile === null) { // Only apply multipliers for newly placed tiles
      switch (cell.type) {
        case 'double-letter':
          letterMultiplier = 2;
          break;
        case 'triple-letter':
          letterMultiplier = 3;
          break;
        case 'double-word':
          wordMultiplier *= 2;
          break;
        case 'triple-word':
          wordMultiplier *= 3;
          break;
      }
    }

    wordScore += tile.points * letterMultiplier;
  });

  return wordScore * wordMultiplier;
};

// Extract a word placed on the board
export const getWordFromBoard = (
  board: BoardCell[][],
  startRow: number,
  startCol: number,
  direction: Direction
): { word: string, tiles: Tile[], cells: BoardCell[] } => {
  const word: string[] = [];
  const tiles: Tile[] = [];
  const cells: BoardCell[] = [];
  
  let currentRow = startRow;
  let currentCol = startCol;
  
  // Go to the start of the word
  while (
    (direction === 'horizontal' && currentCol > 0 && board[currentRow][currentCol - 1].tile) ||
    (direction === 'vertical' && currentRow > 0 && board[currentRow - 1][currentCol].tile)
  ) {
    if (direction === 'horizontal') {
      currentCol--;
    } else {
      currentRow--;
    }
  }
  
  // Read the word
  while (
    currentRow < 15 && 
    currentCol < 15 && 
    board[currentRow][currentCol].tile
  ) {
    const cell = board[currentRow][currentCol];
    if (cell.tile) {
      word.push(cell.tile.letter);
      tiles.push(cell.tile);
      cells.push(cell);
    }
    
    if (direction === 'horizontal') {
      currentCol++;
    } else {
      currentRow++;
    }
  }
  
  return {
    word: word.join(''),
    tiles,
    cells
  };
};

// Check if a move is valid
export const isValidMove = (
  board: BoardCell[][],
  placedTiles: { row: number, col: number, tile: Tile }[],
  isCenterOccupied: boolean
): { valid: boolean; message: string; direction?: Direction } => {
  if (placedTiles.length === 0) {
    return { valid: false, message: "No tiles placed" };
  }
  
  // Check if this is the first move and center is used
  if (!isCenterOccupied) {
    const centerUsed = placedTiles.some(({ row, col }) => row === 7 && col === 7);
    if (!centerUsed) {
      return { valid: false, message: "First play must include center square" };
    }
  }
  
  // Check if tiles are in a line
  const sameRow = placedTiles.every(({ row }) => row === placedTiles[0].row);
  const sameCol = placedTiles.every(({ col }) => col === placedTiles[0].col);
  
  if (!sameRow && !sameCol) {
    return { valid: false, message: "Tiles must be in a straight line" };
  }
  
  const direction: Direction = sameRow ? 'horizontal' : 'vertical';
  
  // Check if tiles are connected
  if (placedTiles.length > 1) {
    const sorted = [...placedTiles].sort((a, b) => 
      direction === 'horizontal' ? a.col - b.col : a.row - b.row
    );
    
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      
      const diff = direction === 'horizontal' 
        ? curr.col - prev.col 
        : curr.row - prev.row;
      
      if (diff !== 1) {
        // Check if there are tiles between these positions
        let allFilled = true;
        
        for (let j = 1; j < diff; j++) {
          const checkRow = direction === 'horizontal' ? prev.row : prev.row + j;
          const checkCol = direction === 'horizontal' ? prev.col + j : prev.col;
          
          if (!board[checkRow][checkCol].tile) {
            allFilled = false;
            break;
          }
        }
        
        if (!allFilled) {
          return { valid: false, message: "Tiles must be connected" };
        }
      }
    }
  }
  
  // Skip the connection check for the first move (when center is not yet occupied by a permanent tile)
  // Only check if new tiles connect to existing tiles after the first move has been played
  if (isCenterOccupied) {
    let connectedToExisting = false;
    
    for (const { row, col } of placedTiles) {
      // Check adjacent cells
      const adjacentCells = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 }
      ];
      
      for (const { row: adjRow, col: adjCol } of adjacentCells) {
        if (
          adjRow >= 0 && adjRow < 15 && adjCol >= 0 && adjCol < 15 &&
          board[adjRow][adjCol].tile &&
          !placedTiles.some(p => p.row === adjRow && p.col === adjCol)
        ) {
          connectedToExisting = true;
          break;
        }
      }
      
      if (connectedToExisting) break;
    }
    
    if (!connectedToExisting) {
      return { valid: false, message: "New tiles must connect to existing tiles" };
    }
  }
  
  return { valid: true, message: "Valid move", direction };
};

// Get all words formed by a move
export const getAllWords = (
  board: BoardCell[][],
  placedTiles: { row: number, col: number, tile: Tile }[]
): { words: string[]; wordObjects: { word: string; tiles: Tile[]; cells: BoardCell[]; direction: Direction }[] } => {
  const words: string[] = [];
  const wordObjects: { word: string; tiles: Tile[]; cells: BoardCell[]; direction: Direction }[] = [];
  
  // First, check if all placed tiles form a horizontal or vertical line
  const sameRow = placedTiles.every(({ row }) => row === placedTiles[0].row);
  const sameCol = placedTiles.every(({ col }) => col === placedTiles[0].col);
  
  if (!sameRow && !sameCol) {
    return { words: [], wordObjects: [] };
  }
  
  // Primary direction word
  const primaryDirection: Direction = sameRow ? 'horizontal' : 'vertical';
  const startPos = {
    row: primaryDirection === 'horizontal' ? placedTiles[0].row : Math.min(...placedTiles.map(t => t.row)),
    col: primaryDirection === 'horizontal' ? Math.min(...placedTiles.map(t => t.col)) : placedTiles[0].col
  };
  
  const primaryWord = getWordFromBoard(
    board,
    startPos.row,
    startPos.col,
    primaryDirection
  );
  
  if (primaryWord.word.length > 1) {
    words.push(primaryWord.word);
    wordObjects.push({
      ...primaryWord,
      direction: primaryDirection
    });
  }
  
  // Check for perpendicular words for each placed tile
  for (const { row, col } of placedTiles) {
    const perpendicularDirection: Direction = primaryDirection === 'horizontal' ? 'vertical' : 'horizontal';
    const perpendicularWord = getWordFromBoard(board, row, col, perpendicularDirection);
    
    if (perpendicularWord.word.length > 1) {
      words.push(perpendicularWord.word);
      wordObjects.push({
        ...perpendicularWord,
        direction: perpendicularDirection
      });
    }
  }
  
  return { words, wordObjects };
};
