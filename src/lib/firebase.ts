// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import type { BoardCell, GameState } from "@/types/scrabble";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBVB9BSi_hsJ84quXszWIRcV_n1c51VqrU",
    authDomain: "solo-scrabble-9aa75.firebaseapp.com",
    projectId: "solo-scrabble-9aa75",
    storageBucket: "solo-scrabble-9aa75.firebasestorage.app",
    messagingSenderId: "115701735777",
    appId: "1:115701735777:web:b84f95dac5e86897c3e520",
    measurementId: "G-K0WGMV81P0"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

type FirestoreBoardCells = Record<string, Record<string, BoardCell>>;

type FirestoreGameState = Omit<GameState, "board"> & {
  board: { cells: FirestoreBoardCells };
};

interface SavedGameDocument {
  gameState?: FirestoreGameState;
  lastUpdated?: string;
}

interface SavedGame {
  gameState: GameState;
  lastUpdated: string;
}

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Sign out
const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// Helper function to convert game state to Firestore-compatible format
const convertGameStateForFirestore = (gameState: GameState): FirestoreGameState => {
  const gameStateCopy = JSON.parse(JSON.stringify(gameState)) as GameState;
  const cellsObject: FirestoreBoardCells = {};

  gameStateCopy.board.cells.forEach((row, rowIndex) => {
    cellsObject[rowIndex.toString()] = {};
    row.forEach((cell, colIndex) => {
      cellsObject[rowIndex.toString()][colIndex.toString()] = cell;
    });
  });

  return {
    ...gameStateCopy,
    board: { cells: cellsObject },
  };
};

// Helper function to convert Firestore data back to app format
const convertFirestoreToGameState = (firestoreData: FirestoreGameState): GameState => {
  const firestoreGameState = JSON.parse(JSON.stringify(firestoreData)) as FirestoreGameState;
  const cellsObject = firestoreGameState.board.cells;
  const rows = Object.keys(cellsObject).length;
  const cols = Object.keys(cellsObject["0"]).length;
  const cellsArray: BoardCell[][] = Array.from(
    { length: rows },
    () => Array<BoardCell>(cols),
  );

  Object.entries(cellsObject).forEach(([rowKey, row]) => {
    const rowIndex = Number.parseInt(rowKey, 10);
    Object.entries(row).forEach(([colKey, cell]) => {
      const colIndex = Number.parseInt(colKey, 10);
      cellsArray[rowIndex][colIndex] = cell;
    });
  });

  return {
    ...firestoreGameState,
    board: { cells: cellsArray },
  };
};

// Save game state to Firestore
const saveGameState = async (userId: string, gameState: GameState) => {
  try {
    // Convert the game state to a Firestore-compatible format
    const firebaseGameState = convertGameStateForFirestore(gameState);
    
    await setDoc(doc(db, "gameStates", userId), {
      gameState: firebaseGameState,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error saving game state", error);
    throw error;
  }
};

// Load game state from Firestore
const loadGameState = async (userId: string): Promise<SavedGame | null> => {
  try {
    const docRef = doc(db, "gameStates", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const firestoreData = docSnap.data() as SavedGameDocument;
    if (!firestoreData.gameState) {
      return null;
    }

    return {
      gameState: convertFirestoreToGameState(firestoreData.gameState),
      lastUpdated: firestoreData.lastUpdated ?? "",
    };
  } catch (error) {
    console.error("Error loading game state", error);
    throw error;
  }
};

// Listen for auth state changes
const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  saveGameState,
  loadGameState,
  onAuthStateChange
}; 