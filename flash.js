// DOM elements
const flashcardsContainer = document.querySelector('.flashcards');
const createBox = document.querySelector('.create-box');
const editBox = document.querySelector('.edit-box');
const questionInput = document.querySelector('#question');
const answerInput = document.querySelector('#answer');
const editQuestionInput = document.querySelector('#edit-question');
const editAnswerInput = document.querySelector('#edit-answer');

let flashcards = [];
let currentEditId = null;

// Fetch flashcards from server
function fetchFlashcards() {
    fetch('/flashcards')
        .then(response => response.json())
        .then(data => {
            flashcards = data;
            displayFlashcards();
        });
}

// Display flashcards
function displayFlashcards() {
    flashcardsContainer.innerHTML = '';
    flashcards.forEach(card => {
        const flashcard = document.createElement('div');
        flashcard.className = 'flashcard';
        flashcard.innerHTML = `
            <h3>${card.question}</h3>
            <p style="display: none;">${card.answer}</p>
            <button onclick="showAnswer(this)">Show Answer</button>
            <button onclick="editFlashcard(${card.id})">Edit</button>
            <button onclick="deleteFlashcard(${card.id})">Delete</button>
        `;
        flashcardsContainer.appendChild(flashcard);
    });
}

// Show/Hide answer
function showAnswer(button) {
    const answerElement = button.previousElementSibling;
    if (answerElement.style.display === 'none') {
        answerElement.style.display = 'block';
        button.textContent = 'Hide Answer';
    } else {
        answerElement.style.display = 'none';
        button.textContent = 'Show Answer';
    }
}

// Show create card box
function showCreateCardBox() {
    createBox.style.display = 'block';
}

// Hide create card box
function hideCreateBox() {
    createBox.style.display = 'none';
    questionInput.value = '';
    answerInput.value = '';
}

// Add flashcard
function addFlashCards() {
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    
    if (question && answer) {
        fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `question=${encodeURIComponent(question)}&answer=${encodeURIComponent(answer)}`
        })
        .then(response => response.json())
        .then(data => {
            flashcards.push(data);
            displayFlashcards();
            hideCreateBox();
        });
    }
}

// Show edit card box
function editFlashcard(id) {
    const card = flashcards.find(card => card.id === id);
    if (card) {
        currentEditId = id;
        editQuestionInput.value = card.question;
        editAnswerInput.value = card.answer;
        editBox.style.display = 'block';
    }
}

// Hide edit card box
function hideEditBox() {
    editBox.style.display = 'none';
    currentEditId = null;
}

// Save edits
function saveEdits() {
    const question = editQuestionInput.value.trim();
    const answer = editAnswerInput.value.trim();
    
    if (question && answer && currentEditId) {
        fetch(`/edit/${currentEditId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `question=${encodeURIComponent(question)}&answer=${encodeURIComponent(answer)}`
        })
        .then(response => response.json())
        .then(data => {
            const index = flashcards.findIndex(card => card.id === currentEditId);
            if (index !== -1) {
                flashcards[index] = data;
            }
            displayFlashcards();
            hideEditBox();
        });
    }
}

// Delete flashcard
function deleteFlashcard(id) {
    if (confirm('Are you sure you want to delete this flashcard?')) {
        fetch(`/delete/${id}`)
            .then(response => response.json())
            .then(data => {
                flashcards = flashcards.filter(card => card.id !== id);
                displayFlashcards();
            });
    }
}

// Initial load
fetchFlashcards();
