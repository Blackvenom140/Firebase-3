import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyC-GGlLu7ZlyIq5AddsZ4XXQP9rg5wd1Mk",
	authDomain: "prediction-43b41.firebaseapp.com",
	databaseURL: "https://prediction-43b41-default-rtdb.firebaseio.com",
	projectId: "prediction-43b41",
	storageBucket: "prediction-43b41.appspot.com",
	messagingSenderId: "1093967509116",
	appId: "1:1093967509116:web:9c9310d59e8b8fb1b3bbf9",
	measurementId: "G-B25RK39ZXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Fetch Last 100 Results from Firebase
async function fetchResultsFromFirebase() {
	try
	{
		const snapshot = await get(ref(database, "results"));
		if (snapshot.exists())
		{
			let allResults = Object.values(snapshot.val());
			let last100Results = allResults.slice(-100);
			console.log("Fetched Last 100 Results:", last100Results);
			return last100Results;
		}
		else
		{
			console.warn("No data found in Firebase.");
			return [];
		}
	} catch (error) {
		console.error("Error fetching Firebase data:", error);
		return [];
	}
}

// Export Functions
export { fetchResultsFromFirebase, predictNextResult };

// Smart Pattern Recognition for Prediction
function predictNextResult(resultList) {
	if (resultList.length === 0) return null;

	let numberSequence = [];
	let colorSequence = [];

	resultList.forEach(, colour}) => {
    numberSequence.push(Number(number));
    colorSequence.push(colour);
});

let predictedNumber = advancedNumberPrediction(numberSequence);
let predictedColor = advancedColorPrediction(colorSequence);

console.log("Predicted Number:", predictedNumber);
console.log("Predicted Color:", predictedColor);

return { predictedNumber, predictedColor };
}

// Advanced Number Prediction
function advancedNumberPrediction(sequence) {
  if (sequence.length < 2) return sequence[sequence.length - 1] || 0;

  let diffs = [];
  for (let i = 1; i < sequence.length; i++) {
    diffs.push(sequence[i] - sequence[i - 1]);
  }

  let commonDiff = mode(diffs);
  let predictedNumber = sequence[sequence.length - 1] + commonDiff;

  if (predictedNumber < 0 || predictedNumber > 9) {
    predictedNumber = mostFrequent(sequence);
  }

  return predictedNumber;
}

// Advanced Color Prediction Using Probability Trends
function advancedColorPrediction(sequence) {
  if (sequence.length === 0) return "Unknown";

  let freq = {};
  sequence.slice(-20).forEach(color => freq[color] = (freq[color] || 0) + 1);
  
  return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
}

// Utility Functions
function mode(arr) {
  let freq = {};
  arr.forEach(num => freq[num] = (freq[num] || 0) + 1);
  return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? Number(a) : Number(b));
}

function mostFrequent(arr) {
  let freq = {};
  arr.forEach(num => freq[num] = (freq[num] || 0) + 1);
  return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? Number(a) : Number(b));
}

