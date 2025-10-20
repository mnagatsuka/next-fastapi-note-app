import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	// storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	// messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	// measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Connect to Auth emulator in development if specified
if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
	connectAuthEmulator(
		auth,
		`http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`,
	);
}

export default app;
