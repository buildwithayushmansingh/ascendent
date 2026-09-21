// onboarding.js — Phase 2: 5-step onboarding wizard
//
// TODO (backend phase): replace saveDemoUser() calls with real POST
// requests once the backend exists.

let currentStep = 1;
const totalSteps = 5;
const selectedHabits = new Set();
let selectedDifficulty = null;

function goToStep(step) {
    document.querySelectorAll('.onboard-step').forEach((el) => {
        el.classList.toggle('active', Number(el.dataset.step) === step);
    });
    document.querySelectorAll('.dot').forEach((dot) => {
        dot.classList.toggle('active', Number(dot.dataset.dot) <= step);
    });
    currentStep = step;

    if (step === 3) buildTargetInputs();
}

// Next / Back buttons
document.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
        if (currentStep === 2 && selectedHabits.size === 0) {
            document.getElementById('habitStepMessage').textContent = 'Pick at least one habit to continue.';
            return;
        }
        if (currentStep === 4 && !selectedDifficulty) {
            document.getElementById('difficultyStepMessage').textContent = 'Choose a difficulty to continue.';
            return;
        }
        if (currentStep < totalSteps) goToStep(currentStep + 1);
    });
});

document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
        if (currentStep > 1) goToStep(currentStep - 1);
    });
});

// Step 2: habit selection (glow + scale + checkmark via CSS class toggle)
document.querySelectorAll('.habit-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
        let habit = tile.dataset.habit;

        // "Custom" needs a real name before it can be selected
        if (habit === 'Custom' && !tile.classList.contains('selected')) {
            const customName = prompt('Name your custom habit:');
            if (!customName || !customName.trim()) return;
            habit = customName.trim();
            tile.dataset.habit = habit;
            tile.querySelector('span:nth-child(2)').textContent = habit;
        }

        if (selectedHabits.has(habit)) {
            selectedHabits.delete(habit);
            tile.classList.remove('selected');
        } else {
            selectedHabits.add(habit);
            tile.classList.add('selected');
        }
    });
});

// Step 3: build one target row per selected habit
function buildTargetInputs() {
    const container = document.getElementById('targetList');
    container.innerHTML = '';

    selectedHabits.forEach((habit) => {
        const tile = document.querySelector(`.habit-tile[data-habit="${habit}"]`);
        const icon = tile ? tile.dataset.icon : '⭐';

        const row = document.createElement('div');
        row.className = 'target-row';
        row.dataset.habit = habit;
        row.innerHTML = `
      <div class="target-row-label">${icon} ${habit}</div>
      <div class="target-row-inputs">
        <input type="number" class="target-minutes" min="5" value="30" />
        <span class="target-suffix">min/day</span>
        <input type="number" class="target-days" min="1" max="7" value="5" />
        <span class="target-suffix">days/week</span>
      </div>
    `;
        container.appendChild(row);
    });
}

// Step 4: difficulty selection (single-select)
document.querySelectorAll('.difficulty-card').forEach((card) => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedDifficulty = { name: card.dataset.difficulty, xp: Number(card.dataset.xp) };
    });
});

// Step 5: finalize and enter dashboard
document.getElementById('enterDashboardBtn').addEventListener('click', () => {
    const habits = Array.from(document.querySelectorAll('.target-row')).map((row) => {
        const tile = document.querySelector(`.habit-tile[data-habit="${row.dataset.habit}"]`);
        return {
            id: row.dataset.habit.toLowerCase(),
            name: row.dataset.habit,
            icon: tile ? tile.dataset.icon : '⭐',
            target: Number(row.querySelector('.target-minutes').value),
            frequency: Number(row.querySelector('.target-days').value),
            difficulty: selectedDifficulty.name,
            xpPerComplete: selectedDifficulty.xp,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            streak: 0,
            completed: false,
            missedReasons: []
        };
    });

    const user = getDemoUser();
    user.habits = habits;
    saveDemoUser(user);

    window.location.href = 'dashboard.html';
});