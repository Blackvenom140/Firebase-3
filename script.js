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

// 🔥 **Neural Memory AI Class**
class NeuralAI {
    constructor(historySize = 100) {
        this.historySize = historySize;
        this.history = []; // Stores last 100 results
        this.patterns = {}; // Stores pattern frequencies
        this.errorMemory = {}; // Stores mistake corrections
    }

    // ✅ **Update AI with New Result & Learn**
    updateHistory(issueNumber, number, result) {
        if (this.history.length >= this.historySize) {
            this.history.shift(); // Remove oldest entry
        }
        this.history.push({ issueNumber, number, result });

        // Learn from the new entry
        this.learnPatterns();
    }

    // 🔥 **AI Learning Mechanism**
    learnPatterns() {
        this.patterns = {}; // Reset patterns
        for (let i = 0; i < this.history.length - 3; i++) {
            let pattern = this.history.slice(i, i + 3).map(x => x.result).join(",");
            let nextResult = this.history[i + 3].result;

            if (!this.patterns[pattern]) {
                this.patterns[pattern] = { Big: 0, Small: 0 };
            }
            this.patterns[pattern][nextResult]++;
        }
    }

    // 🔥 **Mistake Correction Learning**
    trackMistake(actual, predicted) {
        let key = `${predicted}->${actual}`;
        this.errorMemory[key] = (this.errorMemory[key] || 0) + 1;
    }

    // 🔥 **Predict the Next Result**
    predictNext() {
        if (this.history.length < 3) return "Not enough data";

        let latestPattern = this.history.slice(-3).map(x => x.result).join(",");
        let prediction = "Big"; // Default prediction

        if (this.patterns[latestPattern]) {
            let { Big, Small } = this.patterns[latestPattern];
            prediction = Big > Small ? "Big" : "Small";
        } else {
            // 🔥 **Fallback - Trend Analysis**
            let bigCount = this.history.filter(x => x.result === "Big").length;
            let smallCount = this.history.filter(x => x.result === "Small").length;
            prediction = bigCount > smallCount ? "Big" : "Small";
        }

        // 🔥 **Mistake Correction Mechanism**
        let correctionKey = `Big->Small`;
        if (this.errorMemory[correctionKey] && prediction === "Big") {
            prediction = "Small";
        }

        correctionKey = `Small->Big`;
        if (this.errorMemory[correctionKey] && prediction === "Small") {
            prediction = "Big";
        }

        return prediction;
    }
}

// ✅ **Initialize AI Predictor**
const ai = new NeuralAI();

// 🔥 **Listen for New Data & Update AI**
onValue(ref(database, "results"), async (snapshot) => {
    if (snapshot.exists()) {
        let allResults = Object.values(snapshot.val());
        let formattedResults = allResults.slice(-100).reverse().map(entry => ({
            issueNumber: entry.issueNumber,
            number: Number(entry.number),
            result: Number(entry.number) >= 5 ? "Big" : "Small"
        }));

        // ✅ **Update AI with New Data**
        formattedResults.forEach(({ issueNumber, number, result }) => {
            ai.updateHistory(issueNumber, number, result);
        });

        // 🔥 **Get Prediction**
        let predictedType = ai.predictNext();
        console.log(`🔥 AI Prediction: ${predictedType}`);

        // ✅ **Update UI**
        updatePrediction(predictedType);
        updateResults(formattedResults);
    }
});

// 🔥 **Update Prediction Display**
function updatePrediction(predictedType) {
    const predictionDiv = document.getElementById("prediction");
    predictionDiv.innerHTML = `
        <p><strong>Predicted Type:</strong> ${predictedType}</p>
    `;
}

// 🔥 **Update Recent Results Table**
function updateResults(resultList) {
    const historyTable = document.getElementById("recentResults");
    historyTable.innerHTML = "";

    resultList.forEach(({ issueNumber, number, result }) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-4 py-2">${issueNumber}</td>
            <td class="px-4 py-2">${number}</td>
            <td class="px-4 py-2">${result}</td>
        `;
        historyTable.prepend(row);
    });
}

// ✅ **Fetch & Update Data Every Minute**
setInterval(() => {
    console.log("🔄 Updating AI...");
    onValue(ref(database, "results"), async (snapshot) => {
        if (snapshot.exists()) {
            let allResults = Object.values(snapshot.val());
            let formattedResults = allResults.slice(-100).reverse().map(entry => ({
                issueNumber: entry.issueNumber,
                number: Number(entry.number),
                result: Number(entry.number) >= 5 ? "Big" : "Small"
            }));

            // ✅ **Update AI with New Data**
            formattedResults.forEach(({ issueNumber, number, result }) => {
                ai.updateHistory(issueNumber, number, result);
            });

            // 🔥 **Get Prediction**
            let predictedType = ai.predictNext();
            console.log(`🔥 AI Prediction: ${predictedType}`);

            // ✅ **Update UI**
            updatePrediction(predictedType);
            updateResults(formattedResults);
        }
    });
}, 60000); // Every 60 seconds
