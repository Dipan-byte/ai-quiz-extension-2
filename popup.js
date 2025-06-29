// popup.js

// Generate quiz questions from text
function generateQuizQuestions(text, numQuestions = 3) {
  const words = text.trim().split(/\s+/);
  const questions = [];

  if (words.length < 10) {
    questions.push("Not enough text to generate quiz questions.");
    return questions;
  }

  let generated = 0;
  let attempts = 0;

  while (generated < numQuestions && attempts < numQuestions * 3) {
    const idx = Math.floor(Math.random() * (words.length - 1));
    const word = words[idx];

    // Skip very short words
    if (word.length < 4) {
      attempts++;
      continue;
    }

    const before = words.slice(Math.max(0, idx - 5), idx).join(" ");
    const after = words.slice(idx + 1, idx + 6).join(" ");

    questions.push(`... ${before} [____] ${after} ...`);
    generated++;
    attempts++;
  }

  return questions;
}

// When popup is loaded
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(
    ["articleSummary", "articleWordCount", "articleText"],
    (data) => {
      const count = data.articleWordCount || 0;
      const summary = data.articleSummary || "No summary available.";
      const articleText = data.articleText || "";

      // Show word count
      document.getElementById("wordCount").textContent = `Word Count: ${count}`;

      // Show summary
      document.getElementById("summary").value = summary;

      // Quiz button logic
      document.getElementById("quizButton").addEventListener("click", () => {
        const quizDiv = document.getElementById("quiz");
        quizDiv.innerHTML = ""; // Clear previous quiz

        const questions = generateQuizQuestions(articleText);

        questions.forEach((q, index) => {
          const el = document.createElement("p");
          el.textContent = `${index + 1}. ${q}`;
          quizDiv.appendChild(el);
        });
      });
    }
  );
});
