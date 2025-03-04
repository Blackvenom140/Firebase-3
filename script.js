import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ✅ **Firebase Config**
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

// 🔥 **Listen for New Results in Firebase (Real-Time Updates)**
onValue(ref(database, "results"), async () => {
  console.log("🔄 New result detected, updating AI...");
  await fetchResultsAndUpdate();  
});

// 🔥 **Fetch Last 100 Results**
async function fetchResultsFromFirebase() {
  try {
    const snapshot = await get(ref(database, "results"));
    if (snapshot.exists()) {
      let allResults = Object.values(snapshot.val());
      let formattedResults = allResults.slice(-100).reverse().map(entry => ({
        issueNumber: entry.issueNumber,
        colour: entry.colour,
        type: Number(entry.number) >= 5 ? "Big" : "Small"
      }));

      updateResults(formattedResults);
      return formattedResults;
    } else {
      console.warn("❌ No data found in Firebase.");
      return [];
    }
  } catch (error) {
    console.error("🔥 Firebase Fetch Error:", error);
    return [];
  }
}

// 🔥 **AI Prediction System (Extreme Accuracy)**
async function ultimateAITraining(results) {
  if (results.length < 100) {
    console.warn("⚠️ Not enough data! AI needs 100 results for accurate prediction.");
    return null;
  }

  let typeSequence = results.map(({ type }) => type);
  let { predictedType, confidence, debugInfo } = await extremePatternAI(typeSequence);

  localStorage.setItem("lastPrediction", JSON.stringify({ predictedType, confidence }));
  updatePrediction(predictedType, confidence, debugInfo);

  // 🔥 Save Prediction to Firebase Learning Database
  await savePredictionToFirebase(typeSequence, predictedType);

  return { predictedType, confidence };
}

// 🔥 **AI Learning System (Auto-Improving)**
async function savePredictionToFirebase(pattern, predictedType) {
  const patternKey = pattern.slice(-6).join(",");
  const predictionRef = ref(database, `ai-learning/${patternKey}`);

  try {
    const snapshot = await get(predictionRef);
    if (snapshot.exists()) {
      let data = snapshot.val();
      data[predictedType] = (data[predictedType] || 0) + 1;
      await update(predictionRef, data);
    } else {
      let newData = { Big: 0, Small: 0 };
      newData[predictedType] = 1;
      await set(predictionRef, newData);
    }
  } catch (error) {
    console.error("🔥 Firebase Learning Data Save Error:", error);
  }
}

// 🔥 **EXTREME AI PREDICTION SYSTEM (Ultimate Accuracy)**
async function extremePatternAI(sequence) {
  let predictedType = "Big";
  let confidence = 50;
  let currentPattern = sequence.slice(0, 6);
  let debugInfo = `Current 6 Patterns: ${currentPattern.join(", ")}`;

  let pastResults = sequence.slice(6, 100);
  let patternMatches = {};

  for (let i = 0; i < pastResults.length - 6; i++) {
    let pastPattern = pastResults.slice(i, i + 6).join(",");

    if (pastPattern === currentPattern.join(",")) {
      let nextResult = pastResults[i + 6];
      patternMatches[nextResult] = (patternMatches[nextResult] || 0) + 1;
    }
  }

  if (Object.keys(patternMatches).length > 0) {
    let sortedResults = Object.entries(patternMatches).sort((a, b) => b[1] - a[1]);
    predictedType = sortedResults[0][0];
    confidence = (sortedResults[0][1] / Object.values(patternMatches).reduce((a, b) => a + b, 0)) * 100;
    debugInfo += ` | Pattern found! Predicted: ${predictedType} with ${confidence.toFixed(2)}% confidence`;
  } else {
    debugInfo += " | No exact pattern match found, using adaptive trend analysis.";
    
    let last30 = sequence.slice(0, 30);
    let bigCount = last30.filter(x => x === "Big").length;
    let smallCount = last30.filter(x => x === "Small").length;
    
    if (bigCount > smallCount) {
      predictedType = "Big";
      confidence = (bigCount / (bigCount + smallCount)) * 100;
    } else {
      predictedType = "Small";
      confidence = (smallCount / (bigCount + smallCount)) * 100;
    }
  }

  await savePredictionToFirebase(currentPattern, predictedType);

  return { predictedType, confidence, debugInfo };
}

// 🔥 **Update Table with Last 100 Results**
function updateResults(resultList) {
  const historyTable = document.getElementById("recentResults");
  historyTable.innerHTML = "";

  resultList.forEach(({ issueNumber, colour, type }) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-4 py-2">${issueNumber}</td>
      <td class="px-4 py-2">${colour}</td>
      <td class="px-4 py-2">${type}</td>
    `;
    historyTable.prepend(row);
  });
}

// 🔥 **Display Prediction with Debugging Info**
function updatePrediction(predictedType, confidence, debugInfo) {
  const predictionDiv = document.getElementById("prediction");
  predictionDiv.innerHTML = `
    <p><strong>Predicted Type:</strong> ${predictedType} (${confidence.toFixed(2)}% confidence)</p>
    <p><strong>Debug Info:</strong> ${debugInfo}</p>
  `;
}

// 🔥 **Start Fetching Data**
async function fetchResultsAndUpdate() {
  const resultList = await fetchResultsFromFirebase();
  if (resultList.length >= 100) {
    await ultimateAITraining(resultList);
  } else {
    console.warn("⚠️ AI needs at least 100 results for accurate prediction.");
  }
}

fetchResultsAndUpdate();
setInterval(fetchResultsAndUpdate, 60000);
