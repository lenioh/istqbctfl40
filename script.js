let questions = [];
let usedIndices = new Set();
let currentIndex = 0;
let selectedOption = null;
let correctCount = 0;
const maxQuestionsPerSession = 40;

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getRandomUnusedIndex() {
    const avail = questions
        .map((_, i) => i)
        .filter(i => !usedIndices.has(i));
    if (!avail.length) return null;
    const idx = avail[Math.floor(Math.random() * avail.length)];
    usedIndices.add(idx);
    return idx;
}

function clearProgressBar() {
    document.getElementById('progress-bar').innerHTML = '';
    correctCount = 0;
}

function updateCounter() {
    document.getElementById('counter').textContent =
        `${usedIndices.size}/${maxQuestionsPerSession}`;
}

function updateProgressBar(isCorrect) {
    const bar = document.getElementById('progress-bar');
    const box = document.createElement('span');
    box.className = 'progress-box ' + (isCorrect ? 'correct' : 'incorrect');
    bar.appendChild(box);
    if (isCorrect) correctCount++;
    updateCounter();
}

function showSummaryModal() {
    const percentage = ((correctCount / usedIndices.size) * 100).toFixed(1);
    document.getElementById('summary-text').textContent =
        `You answered ${correctCount} out of ${usedIndices.size} correctly.` +
        ` (${percentage}%)`;
    document.getElementById('summary-modal').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
    questions = shuffle(await fetch('questions.json').then(r => r.json()));

    document.getElementById('start-btn').onclick = startQuiz;
    document.getElementById('submit-btn').onclick = handleSubmit;
    document.getElementById('next-btn').onclick = handleNext;
    document.getElementById('restart-btn').onclick = handleRestart;
    document.getElementById('modal-restart-btn').onclick = () => {
        document.getElementById('summary-modal').classList.add('hidden');
        handleRestart();
    };
});

function startQuiz() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').classList.remove('hidden');
    usedIndices.clear();
    clearProgressBar();
    updateCounter();
    currentIndex = getRandomUnusedIndex();
    showQuestion();
}

function showQuestion() {
    const q = questions[currentIndex];
    document.getElementById('question-text').textContent = q.question;
    const opts = document.getElementById('options');
    opts.innerHTML = '';
    selectedOption = null;
    document.getElementById('explanation').textContent = '';

    // Show only Submit
    document.getElementById('submit-btn').style.display = 'inline-block';
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('next-btn').style.display = 'none';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.className = 'option-btn';
        btn.onclick = () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedOption = idx;
            document.getElementById('submit-btn').disabled = false;
        };
        opts.appendChild(btn);
    });
}

function handleSubmit() {
    const q = questions[currentIndex];
    const correctIdx = q.options.findIndex(o => o.correct);

    document.querySelectorAll('.option-btn').forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIdx) {
            btn.style.backgroundColor = '#79f57d';   // green for correct
        } else {
            btn.style.backgroundColor = '#ffcdd2';   // red for all others
        }
    });

    document.getElementById('explanation').textContent = q.explanation;

    // Swap buttons
    document.getElementById('submit-btn').style.display = 'none';
    const nextBtn = document.getElementById('next-btn');
    nextBtn.style.display = 'inline-block';
    nextBtn.disabled = false;

    updateProgressBar(selectedOption === correctIdx);
}


function handleNext() {
    if (usedIndices.size >= maxQuestionsPerSession || usedIndices.size >= questions.length) {
        showSummaryModal();
        return;
    }
    currentIndex = getRandomUnusedIndex();
    showQuestion();
}

function handleRestart() {
    usedIndices.clear();
    correctCount = 0;
    clearProgressBar();
    updateCounter();
    currentIndex = getRandomUnusedIndex();
    showQuestion();
}
