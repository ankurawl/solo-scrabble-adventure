# Firebase Setup Guide for Solo Scrabble

## Firebase Configuration Steps

1. **Update Firebase Configuration**
   
   Open `src/lib/firebase.ts` and update the Firebase configuration with your actual Firebase values:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "solo-scrabble-9aa75.firebaseapp.com",
     projectId: "solo-scrabble-9aa75",
     storageBucket: "solo-scrabble-9aa75.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

2. **Configure Firebase Authentication**
   
   - Navigate to your Firebase Console (https://console.firebase.google.com/)
   - Select your project "solo-scrabble-9aa75"
   - Go to "Authentication" section in the left sidebar
   - Click on "Sign-in method" tab
   - Enable "Google" as a sign-in provider:
     - Click on Google provider
     - Toggle the "Enable" switch
     - Add your domain to the authorized domains if you have a custom domain
     - Save the settings

3. **Set Up Firestore Database**
   
   - In the Firebase Console, go to "Firestore Database"
   - Click "Create database" if it's not already created
   - Start in production mode
   - Choose the closest region to your users
   - Set up the security rules for your database:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /gameStates/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

   These rules ensure that each user can only read and write their own game state data.

4. **Update Firebase Hosting Configuration (Optional)**

   If your Firebase hosting configuration needs updating, edit the `firebase.json` file:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

## Testing Your Implementation

1. Rebuild your application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

3. Test the authentication and game state storage:
   - Sign in with your Google account
   - Play a few moves in the game
   - Verify that your game state is saved
   - Sign out and back in again to check if your game state loads correctly

## Troubleshooting

- If sign-in fails, check your Firebase Authentication configuration and make sure Google is enabled as a provider.
- If saving/loading fails, check your Firestore security rules to ensure they allow the user to read and write to their own document.
- Enable Firebase debugging in your browser console by running: `localStorage.setItem('debug', 'firebase:*');`

## Next Steps for Enhancement

1. Add more authentication providers (Email/Password, GitHub, etc.)
2. Implement user profiles to save player stats
3. Add leaderboards for high scores
4. Create an admin dashboard to track usage statistics 