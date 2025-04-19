import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Board from './Board';
import TileRack from './TileRack';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { Tile, BoardCell, GameState } from '@/types/scrabble';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { saveGameState, loadGameState } from '@/lib/firebase';
import UserProfile from './UserProfile';
import LoadGameDialog from './LoadGameDialog';
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
  const { currentUser } = useAuth();
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
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedGameData, setSavedGameData] = useState<{
    gameState: GameState;
    lastUpdated: string;
  } | null>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  // Check for saved game when user logs in
  useEffect(() => {
    if (currentUser) {
      checkForSavedGame();
    }
  }, [currentUser]);

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

  const checkForSavedGame = async () => {
    if (currentUser) {
      try {
        const savedGame = await loadGameState(currentUser.uid);
        if (savedGame && savedGame.gameState) {
          setSavedGameData({
            gameState: savedGame.gameState,
            lastUpdated: savedGame.lastUpdated
          });
          setShowLoadDialog(true);
        }
      } catch (error) {
        console.error("Error checking for saved game:", error);
      }
    }
  };

  const handleSaveGame = async () => {
    if (!currentUser) {
      toast.error("Please sign in to save your game");
      return;
    }

    try {
      const gameStateToSave = {
        ...gameState,
        // Include placed tiles that haven't been committed yet
        placedTiles,
        isCenterOccupied
      };

      await saveGameState(currentUser.uid, gameStateToSave);
      toast.success("Game saved successfully");
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("Failed to save game");
    }
  };

  const handleLoadSavedGame = () => {
    if (savedGameData && savedGameData.gameState) {
      const loadedState = savedGameData.gameState;
      
      setGameState({
        board: loadedState.board,
        rack: loadedState.rack,
        bag: loadedState.bag,
        score: loadedState.score,
        currentWord: loadedState.currentWord,
        isPlaying: true
      });
      
      if (loadedState.placedTiles) {
        setPlacedTiles(loadedState.placedTiles);
      } else {
        setPlacedTiles([]);
      }
      
      if (loadedState.isCenterOccupied !== undefined) {
        setIsCenterOccupied(loadedState.isCenterOccupied);
      } else {
        // Check if center is occupied by looking at the board
        setIsCenterOccupied(!!loadedState.board.cells[7][7].tile);
      }
      
      setShowLoadDialog(false);
      toast.success("Game loaded successfully");
    }
  };

  const handleContinueCurrentGame = () => {
    setShowLoadDialog(false);
  };

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
    console.log('handlePlaceTile called with:', { row, col, tileId });
    
    if (!gameState.isPlaying || !tileId) {
      console.log('Game not playing or no tileId provided');
      return;
    }
    
    // Get information about the target cell from the board
    const boardCell = gameState.board.cells[row][col];
    
    // Check if the target cell has a permanently placed tile (from previous turns)
    if (boardCell.tile && boardCell.tile.isPlaced) {
      console.log('Cannot place on permanently placed tile');
      toast.error('Cannot place on top of tiles from previous turns');
      return;
    }
    
    // Find the tile being dragged - either from rack or from the board
    let tileToPlace: Tile | undefined;
    let isFromRack = false;
    let existingTilePosition: { row: number, col: number } | null = null;
    
    // Check if dragging from rack
    const rackTileIndex = gameState.rack.findIndex(t => t.id === tileId);
    if (rackTileIndex !== -1) {
      console.log('Tile is from rack');
      tileToPlace = { ...gameState.rack[rackTileIndex] };
      isFromRack = true;
    } else {
      // Check if dragging a tile already on the board (placed in current turn)
      const placedTileIndex = placedTiles.findIndex(pt => pt.tile.id === tileId);
      if (placedTileIndex !== -1) {
        console.log('Tile is from board (current turn)');
        tileToPlace = { ...placedTiles[placedTileIndex].tile };
        existingTilePosition = {
          row: placedTiles[placedTileIndex].row,
          col: placedTiles[placedTileIndex].col
        };
      }
    }
    
    if (!tileToPlace) {
      console.error('Could not find the tile to place with id:', tileId);
      return;
    }
    
    // Don't allow dropping a tile onto itself (same position)
    if (existingTilePosition && existingTilePosition.row === row && existingTilePosition.col === col) {
      console.log('Dropped tile onto itself, ignoring');
      return;
    }
    
    console.log('Tile found:', { 
      tileId: tileToPlace.id,
      letter: tileToPlace.letter,
      isFromRack,
      existingPosition: existingTilePosition 
    });
    
    // Check if the target cell already has a tile from the current turn
    const existingPlacedTileIndex = placedTiles.findIndex(pt => pt.row === row && pt.col === col);
    
    // Create a new array for placed tiles (to avoid direct state mutation)
    let newPlacedTiles = [...placedTiles];
    
    // CASE 1: Target cell already has a tile from current turn (swap/replace)
    if (existingPlacedTileIndex !== -1) {
      console.log('Target cell already has a tile from current turn');
      const existingTile = { ...placedTiles[existingPlacedTileIndex].tile };
      
      // CASE 1A: Moving from another board position to an occupied cell (swap)
      if (existingTilePosition) {
        console.log('Swapping tiles between board positions');
        // Remove both tiles from their current positions
        newPlacedTiles = newPlacedTiles.filter(pt => 
          !(pt.tile.id === tileId || (pt.row === row && pt.col === col))
        );
        
        // Add both tiles in their new positions
        newPlacedTiles.push({ 
          row, 
          col, 
          tile: tileToPlace 
        });
        
        newPlacedTiles.push({ 
          row: existingTilePosition.row, 
          col: existingTilePosition.col, 
          tile: existingTile 
        });
      } 
      // CASE 1B: Moving from rack to an occupied cell (replace and return to rack)
      else if (isFromRack) {
        console.log('Replacing board tile with rack tile');
        // Remove the existing tile from the board
        newPlacedTiles = newPlacedTiles.filter(pt => !(pt.row === row && pt.col === col));
        
        // Add the new tile to the board
        newPlacedTiles.push({ row, col, tile: tileToPlace });
        
        // Return the replaced tile to the rack
        setGameState(prev => ({
          ...prev,
          rack: [...prev.rack.filter(t => t.id !== tileId), existingTile]
        }));
      }
    }
    // CASE 2: Target cell is empty
    else {
      // CASE 2A: Moving a tile from one board position to an empty cell
      if (existingTilePosition) {
        console.log('Moving tile from board to empty cell');
        // Remove the tile from its current position
        newPlacedTiles = newPlacedTiles.filter(pt => pt.tile.id !== tileId);
        
        // Add the tile to the new position
        newPlacedTiles.push({ row, col, tile: tileToPlace });
      } 
      // CASE 2B: Moving a tile from rack to an empty cell
      else if (isFromRack) {
        console.log('Moving tile from rack to empty cell');
        // Add the tile to the board
        newPlacedTiles.push({ row, col, tile: tileToPlace });
        
        // Remove the tile from the rack
        setGameState(prev => ({
          ...prev,
          rack: prev.rack.filter(t => t.id !== tileId)
        }));
      }
    }
    
    console.log('New placed tiles:', newPlacedTiles.map(pt => `${pt.tile.letter}@(${pt.row},${pt.col})`));
    
    // Update the placed tiles
    setPlacedTiles(newPlacedTiles);
    
    // Check if center is occupied (important for first move)
    if (row === 7 && col === 7) {
      setIsCenterOccupied(true);
    }
    
    // Reset current dragged tile
    setCurrentDraggedTile(null);
  }, [gameState, placedTiles, currentDraggedTile]);

  const handleTileDragStart = useCallback((e: React.DragEvent, tile: Tile) => {
    // Store the dragged tile in state
    e.dataTransfer.setData('text/plain', tile.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Set the current dragged tile
    setCurrentDraggedTile(tile);
    
    console.log('Tile drag started:', tile.id); // Add logging for debugging
  }, []);

  const handleShuffleTiles = useCallback(() => {
    // Create a copy of the current rack tiles and shuffle only those
    const currentRackTiles = [...gameState.rack];
    const shuffledRack = shuffleArray(currentRackTiles);
    
    setGameState(prev => ({
      ...prev,
      rack: shuffledRack // Use the shuffled copy
    }));
    
    toast.success('Tiles shuffled');
  }, [gameState.rack]); // Add dependency on gameState.rack

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
    
    // Add current turn's tiles to the board copy for validation
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
      
      // Create a new board state with all the placed tiles marked as permanent
      const newBoard = JSON.parse(JSON.stringify(gameState.board.cells)) as BoardCell[][];
      placedTiles.forEach(({ row, col, tile }) => {
        // Mark tiles as permanently placed on the board
        newBoard[row][col].tile = { 
          ...tile, 
          isPlaced: true  // This flag indicates the tile is from a previous turn
        };
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
      
      // Clear the placedTiles array since they're now part of the board
      setPlacedTiles([]);
      setPotentialScore(undefined);
      
      if (!isCenterOccupied) {
        setIsCenterOccupied(true);
      }
      
      const wordsPlayed = actualWordsPlayed.join(', ');
      toast.success(`Played: ${wordsPlayed} for ${moveScore} points!`);
      
      // Auto-save game after playing a word if the user is logged in
      if (currentUser) {
        await handleSaveGame();
      }
      
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
  }, [gameState, placedTiles, isCenterOccupied, currentUser]);

  const handleReturnTileToRack = useCallback((tileId: string) => {
    // Find the placed tile to return
    const placedTileIndex = placedTiles.findIndex(pt => pt.tile.id === tileId);
    
    // Only proceed if we found the tile in the placed tiles
    if (placedTileIndex === -1) {
      return;
    }
    
    const tileToReturn = { ...placedTiles[placedTileIndex].tile };
    
    // Use a single update operation to avoid race conditions
    // First update placedTiles
    setPlacedTiles(prev => prev.filter(pt => pt.tile.id !== tileId));
    
    // Then update the rack in a separate operation
    setGameState(prev => {
      // Double-check the tile isn't already in the rack to prevent duplicates
      const isAlreadyInRack = prev.rack.some(t => t.id === tileId);
      
      if (isAlreadyInRack) {
        return prev; // No change if already in rack
      }
      
      // Add the tile to the rack
      return {
        ...prev,
        rack: [...prev.rack, tileToReturn]
      };
    });
    
    // Reset current dragged tile
    setCurrentDraggedTile(null);
  }, [placedTiles]);

  return (
    <div className="flex flex-col items-center w-full mx-auto px-1 sm:px-2 py-1 sm:py-2 max-w-screen-xl touch-none bg-background">
      <div className="w-full mb-1 animate-fade-in">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center">Solo Scrabble</h1>
      </div>

      {/* Load Game Dialog */}
      {savedGameData && (
        <LoadGameDialog
          isOpen={showLoadDialog}
          lastSaved={new Date(savedGameData.lastUpdated).toLocaleString()}
          onClose={() => setShowLoadDialog(false)}
          onLoadGame={handleLoadSavedGame}
          onContinueCurrentGame={handleContinueCurrentGame}
        />
      )}

      {/* Fixed layout across all screen sizes */}
      <div className="w-full flex flex-col h-[calc(100vh-5rem)] max-h-[1200px]">
        {/* Fixed header with score and user profile */}
        <div className="sticky top-0 z-10 w-full flex justify-between items-center py-1 px-2 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Score:</span>
            <span className="text-xl sm:text-2xl font-semibold">
              {gameState.score}
              {potentialScore !== undefined && potentialScore > 0 && (
                <span className="text-xs sm:text-sm text-green-600 ml-1">+{potentialScore}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
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
            <UserProfile onSaveGame={handleSaveGame} />
          </div>
        </div>
        
        {/* Fixed board size with proper container */}
        <div className="flex-grow overflow-hidden my-1 sm:my-2 flex justify-center items-center">
          <div className="board-wrapper w-full max-w-[min(92vw,92vh,800px)] aspect-square mx-auto touch-none">
            <Board
              board={gameState.board.cells}
              onPlaceTile={handlePlaceTile}
              currentDraggedTile={currentDraggedTile}
              placedTiles={placedTiles}
              onTileDragStart={handleTileDragStart}
            />
          </div>
        </div>
        
        {/* Fixed footer with tiles */}
        <div className="sticky bottom-0 z-10 w-full bg-background/95 backdrop-blur-sm">
          <TileRack
            tiles={gameState.rack}
            tilesRemaining={gameState.bag.length}
            onTileDragStart={handleTileDragStart}
            onShuffleTiles={handleShuffleTiles}
            onPlayWord={handlePlayWord}
            onRecallTiles={handleRecallTiles}
            canPlay={placedTiles.length > 0}
            onReturnTileToRack={handleReturnTileToRack}
          />
        </div>
      </div>
    </div>
  );
};

export default ScrabbleGame;
