import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Board from './Board';
import TileRack from './TileRack';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { Tile, BoardCell, GameState } from '@/types/scrabble';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  createBoard, 
  createTileBag, 
  drawTiles, 
  shuffleArray, 
  getAllWords, 
  isValidMove, 
  isValidWord, 
  calculateWordScore 
} from '@/utils/scrabbleUtils';

const ScrabbleGame: React.FC = () => {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<GameState>({
    board: { cells: createBoard() },
    rack: [],
    bag: [],
    score: 0,
    currentWord: [],
    isPlaying: false
  });

  const [currentDraggedTile, setCurrentDraggedTile] = useState<Tile | null>(null);
  const [placedTiles, setPlacedTiles] = useState<{ row: number; col: number; tile: Tile }[]>([]);
  const [potentialScore, setPotentialScore] = useState<number | undefined>(undefined);
  const [isCenterOccupied, setIsCenterOccupied] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (placedTiles.length > 0) {
      const boardCopy = JSON.parse(JSON.stringify(gameState.board.cells)) as BoardCell[][];
      
      placedTiles.forEach(({ row, col, tile }) => {
        boardCopy[row][col].tile = tile;
      });
      
      const validationResult = isValidMove(boardCopy, placedTiles, isCenterOccupied);
      
      if (validationResult.valid && validationResult.direction) {
        const { wordObjects } = getAllWords(boardCopy, placedTiles);
        
        if (wordObjects.length > 0) {
          let totalScore = 0;
          let invalidWords: string[] = [];
          
          wordObjects.forEach(({ word, tiles, cells, direction }) => {
            if (!isValidWord(word)) {
              invalidWords.push(word);
            } else {
              totalScore += calculateWordScore(tiles, cells, direction);
            }
          });
          
          if (invalidWords.length > 0) {
            setPotentialScore(undefined);
          } else {
            setPotentialScore(totalScore);
          }
        } else {
          setPotentialScore(undefined);
        }
      } else {
        setPotentialScore(undefined);
      }
    } else {
      setPotentialScore(undefined);
    }
  }, [placedTiles, gameState.board.cells, isCenterOccupied]);

  const startNewGame = useCallback(() => {
    const newBoard = createBoard();
    const newBag = createTileBag();
    const { drawn, remaining } = drawTiles(newBag, 7);
    
    setGameState({
      board: { cells: newBoard },
      rack: drawn,
      bag: remaining,
      score: 0,
      currentWord: [],
      isPlaying: true
    });
    
    setPlacedTiles([]);
    setPotentialScore(undefined);
    setIsCenterOccupied(false);
    
    toast.success('New game started!');
  }, []);

  const handlePlaceTile = useCallback((row: number, col: number, tileId: string) => {
    if (!gameState.isPlaying) return;
    
    const boardCell = gameState.board.cells[row][col];
    
    if (boardCell.tile) {
      toast.error('This cell is already occupied');
      return;
    }
    
    const existingPlacedTileIndex = placedTiles.findIndex(
      pt => pt.row === row && pt.col === col
    );
    
    if (existingPlacedTileIndex !== -1) {
      const existingTile = placedTiles[existingPlacedTileIndex].tile;
      setGameState(prev => ({
        ...prev,
        rack: [...prev.rack, existingTile]
      }));
      
      setPlacedTiles(prev => prev.filter((_, index) => index !== existingPlacedTileIndex));
    }
    
    let tileToPlace: Tile | undefined;
    let isFromRack = false;
    let existingTilePosition: { row: number, col: number } | null = null;
    
    const rackTile = gameState.rack.find(t => t.id === tileId);
    if (rackTile) {
      tileToPlace = rackTile;
      isFromRack = true;
    } else {
      const placedTileIndex = placedTiles.findIndex(pt => pt.tile.id === tileId);
      if (placedTileIndex !== -1) {
        tileToPlace = placedTiles[placedTileIndex].tile;
        existingTilePosition = {
          row: placedTiles[placedTileIndex].row,
          col: placedTiles[placedTileIndex].col
        };
      }
    }
    
    if (!tileToPlace) return;
    
    setPlacedTiles(prev => {
      if (existingTilePosition) {
        return prev.filter(pt => pt.tile.id !== tileId);
      } else {
        return [...prev, { row, col, tile: tileToPlace }];
      }
    });
    
    if (row === 7 && col === 7) {
      setIsCenterOccupied(true);
    }
    
    if (isFromRack) {
      setGameState(prev => ({
        ...prev,
        rack: prev.rack.filter(t => t.id !== tileId)
      }));
    }
    
    setCurrentDraggedTile(null);
  }, [gameState, placedTiles]);

  const handleTileDragStart = useCallback((e: React.DragEvent, tile: Tile) => {
    setCurrentDraggedTile(tile);
  }, []);

  const handleShuffleTiles = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      rack: shuffleArray(prev.rack)
    }));
    
    toast.success('Tiles shuffled');
  }, []);

  const handleRecallTiles = useCallback(() => {
    if (placedTiles.length === 0) return;
    
    const tilesToRecall = placedTiles.map(p => p.tile);
    
    setGameState(prev => ({
      ...prev,
      rack: [...prev.rack, ...tilesToRecall]
    }));
    
    setPlacedTiles([]);
    setPotentialScore(undefined);
    
    toast.info('Tiles recalled to rack');
  }, [placedTiles]);

  const handlePlayWord = useCallback(async () => {
    console.log("Play Word button clicked");
    if (placedTiles.length === 0) {
      toast.error('No tiles placed on the board');
      return;
    }
    
    const boardCopy = JSON.parse(JSON.stringify(gameState.board.cells)) as BoardCell[][];
    
    placedTiles.forEach(({ row, col, tile }) => {
      boardCopy[row][col].tile = tile;
    });
    
    const validationResult = isValidMove(boardCopy, placedTiles, isCenterOccupied);
    
    if (!validationResult.valid) {
      toast.error(validationResult.message);
      return;
    }
    
    const { words, wordObjects } = getAllWords(boardCopy, placedTiles);
    
    if (words.length === 0) {
      toast.error('No valid words formed');
      return;
    }
    
    const loadingToastId = toast.loading('Validating words...');
    
    try {
      const wordValidations = await Promise.all(
        words.map(async (word) => {
          const validation = await isValidWord(word);
          return { word, isValid: validation.isValid, actualWord: validation.actualWord };
        })
      );
      
      const invalidWords = wordValidations
        .filter(({ isValid }) => !isValid)
        .map(({ word }) => word);
      
      toast.dismiss(loadingToastId);
      
      if (invalidWords.length > 0) {
        toast.error(`Invalid word${invalidWords.length > 1 ? 's' : ''}: ${invalidWords.join(', ')}`);
        return;
      }
      
      let moveScore = 0;
      const actualWordsPlayed = wordValidations.map(({ actualWord }) => actualWord);
      wordObjects.forEach(({ word, tiles, cells, direction }) => {
        moveScore += calculateWordScore(tiles, cells, direction);
      });
      
      const newBoard = JSON.parse(JSON.stringify(gameState.board.cells)) as BoardCell[][];
      placedTiles.forEach(({ row, col, tile }) => {
        newBoard[row][col].tile = { ...tile, isPlaced: true };
      });
      
      const tilesToDraw = Math.min(placedTiles.length, gameState.bag.length);
      const { drawn, remaining } = drawTiles(gameState.bag, tilesToDraw);
      
      setGameState(prev => ({
        ...prev,
        board: { cells: newBoard },
        rack: [...prev.rack, ...drawn],
        bag: remaining,
        score: prev.score + moveScore
      }));
      
      setPlacedTiles([]);
      setPotentialScore(undefined);
      
      if (!isCenterOccupied) {
        setIsCenterOccupied(true);
      }
      
      const wordsPlayed = actualWordsPlayed.join(', ');
      toast.success(`Played: ${wordsPlayed} for ${moveScore} points!`);
      
      if (drawn.length < placedTiles.length && remaining.length === 0) {
        if (gameState.rack.length === 0) {
          toast.success(`Game over! Final score: ${gameState.score + moveScore}`);
          setGameState(prev => ({ ...prev, isPlaying: false }));
        } else {
          toast.info('No more tiles in the bag');
        }
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Error validating words. Please try again.');
      console.error('Word validation error:', error);
    }
  }, [gameState, placedTiles, isCenterOccupied]);

  return (
    <div className="flex flex-col items-center w-full mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-[600px]">
      <div className="w-full mb-1 sm:mb-2 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">Solo Scrabble</h1>
      </div>

      {/* Consistent layout across all screen sizes */}
      <div className="w-full flex flex-col h-[calc(100vh-8rem)]">
        {/* Fixed header with score - inline without panel */}
        <div className="sticky top-0 z-10 w-full flex justify-between items-center py-1 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Score:</span>
            <span className="text-xl sm:text-2xl font-semibold">
              {gameState.score}
              {potentialScore !== undefined && potentialScore > 0 && (
                <span className="text-xs sm:text-sm text-green-600 ml-1">+{potentialScore}</span>
              )}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={startNewGame}
            className="flex items-center gap-1 p-1"
            title="New Game"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="text-xs">New Game</span>
          </Button>
        </div>
        
        {/* Scrollable board area */}
        <div className="flex-grow overflow-hidden my-2 sm:my-4">
          <div className="board-wrapper mx-auto">
            <Board
              board={gameState.board.cells}
              onPlaceTile={handlePlaceTile}
              currentDraggedTile={currentDraggedTile}
              placedTiles={placedTiles}
            />
          </div>
        </div>
        
        {/* Fixed footer with tiles */}
        <div className="sticky bottom-0 z-10 w-full">
          <TileRack
            tiles={gameState.rack}
            tilesRemaining={gameState.bag.length}
            onTileDragStart={handleTileDragStart}
            onShuffleTiles={handleShuffleTiles}
            onPlayWord={handlePlayWord}
            onRecallTiles={handleRecallTiles}
            canPlay={placedTiles.length > 0}
          />
        </div>
      </div>
    </div>
  );
};

export default ScrabbleGame;
