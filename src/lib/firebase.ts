// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
const convertGameStateForFirestore = (gameState: any) => {
  // Create a deep copy of the gameState
  const firebaseGameState = JSON.parse(JSON.stringify(gameState));
  
  // Process the board cells (which likely contain nested arrays)
  if (firebaseGameState.board && firebaseGameState.board.cells) {
    // Convert 2D array to an object with numbered keys
    const cellsObject: Record<string, Record<string, any>> = {};
    
    firebaseGameState.board.cells.forEach((row: any[], rowIndex: number) => {
      cellsObject[rowIndex.toString()] = {};
      row.forEach((cell: any, colIndex: number) => {
        cellsObject[rowIndex.toString()][colIndex.toString()] = cell;
      });
    });
    
    // Replace the cells array with the object representation
    firebaseGameState.board.cells = cellsObject;
  }
  
  return firebaseGameState;
};

// Helper function to convert Firestore data back to app format
const convertFirestoreToGameState = (firestoreData: any) => {
  const appGameState = JSON.parse(JSON.stringify(firestoreData));
  
  // Convert board cells object back to 2D array
  if (appGameState.board && appGameState.board.cells) {
    const cellsObject = appGameState.board.cells;
    const rows = Object.keys(cellsObject).length;
    const cols = Object.keys(cellsObject['0']).length;
    
    // Create empty 2D array
    const cellsArray: any[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Fill the array with values from the object
    Object.keys(cellsObject).forEach(rowKey => {
      const rowIndex = parseInt(rowKey);
      Object.keys(cellsObject[rowKey]).forEach(colKey => {
        const colIndex = parseInt(colKey);
        cellsArray[rowIndex][colIndex] = cellsObject[rowKey][colKey];
      });
    });
    
    // Replace the cells object with the array
    appGameState.board.cells = cellsArray;
  }
  
  return appGameState;
};

// Save game state to Firestore
const saveGameState = async (userId: string, gameState: any) => {
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
const loadGameState = async (userId: string) => {
  try {
    const docRef = doc(db, "gameStates", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const firestoreData = docSnap.data();
      
      // If gameState exists, convert it back to the app format
      if (firestoreData.gameState) {
        return {
          gameState: convertFirestoreToGameState(firestoreData.gameState),
          lastUpdated: firestoreData.lastUpdated
        };
      }
      
      return firestoreData;
    } else {
      return null;
    }
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