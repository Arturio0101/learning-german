document.getElementById('load-words').addEventListener('click', () => {
    const level = document.getElementById('level-select').value;
    fetch(`/words?level=${level}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Сетевая ошибка: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const wordsList = document.getElementById('words-list');
            wordsList.innerHTML = ''; // Очистка списка перед новым выводом

            data.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div>
                        <strong>${item.word}</strong>: <br/>
                        <p class="examples">${item.sentence}<button class="speak-button" onclick="speakSentence('${item.sentence}')">
                        <span class="icon-sound"></span></button></p>
                        <p class="examples">${item.sentence_rus}</p>
                    </div>`;
                wordsList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Данные недоступны: интернет-соединение отсутствует или сервер не отвечает.');
        });
});

function registerSync() {
    // Регистрируем задачу для синхронизации, если нет интернета
    navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-words').catch((error) => {
            console.error('Ошибка регистрации синхронизации:', error);
        });
    });
}

function speakSentence(sentenceText) {
    const audio = new Audio(`/speak?text=${encodeURIComponent(sentenceText)}`);
    audio.play().catch(error => {
        console.error('Ошибка воспроизведения аудио:', error);
        alert('Ошибка воспроизведения аудио.');
    });
}

function showTab(tabId) {
    const buttons = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    
    // Сброс активного состояния
    buttons.forEach(button => button.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active-tab'));
    
    // Установка активной вкладки
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active-tab');
    
    // Сохранение состояния вкладки
    localStorage.setItem('activeTab', tabId);

    // Если открыта вкладка "Тест", загружаем вопрос
    if (tabId === 'test') {
        const loadTestButton = document.getElementById('load-test');
        loadTestButton.click(); // Имитация клика для загрузки случайного вопроса
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('activeTab') || 'words';
    showTab(savedTab);
});

document.getElementById('grammar-topic-select').addEventListener('change', () => {
    const topicId = document.getElementById('grammar-topic-select').value;
    if (topicId) {
        fetch(`/grammar-content?grammar_id=${topicId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('grammar-content').innerHTML = data.content;
            })
            .catch(error => console.error('Ошибка загрузки содержания грамматики:', error));
    }
});

function loadGrammarTopics() {
    fetch('/grammar-topics')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const select = document.getElementById('grammar-topic-select');
            select.innerHTML = '<option>Выберите тему</option>';
            data.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.grammar_id;
                option.textContent = topic.title_grammar;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Ошибка загрузки тем грамматики:', error));
}

let images = [
    "images/image1.jpg",
    "images/image2.jpg",
    "images/image3.jpg",
    "images/image4.jpg",
    "images/image5.jpg",
    "images/image6.jpg",
    "images/image7.jpg",
    "images/image8.jpg",
    "images/image9.jpg",
    "images/image10.jpg",
    "images/image11.png",
    "images/image12.png",
    "images/image13.png",
    "images/image14.jpg",
    "images/image15.jpg",
    "images/image16.jpg",
    "images/image17.jpg",
    "images/image18.jpg",
    "images/image19.jpg",
];

let currentIndex = 0;

function changeRandomImage() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * images.length);
    } while (randomIndex === currentIndex); // Исключаем повтор
    currentIndex = randomIndex;

    const sliderImage = document.getElementById("slider-image");

    // Добавляем класс для анимации скрытия
    sliderImage.classList.add("hidden");

    // Заменяем изображение после завершения анимации
    setTimeout(() => {
        sliderImage.src = images[currentIndex];
        sliderImage.classList.remove("hidden");
    }, 500); // Тайм-аут синхронизирован с длительностью анимации
}

let totalQuestions = 10; // Количество вопросов в тесте
let currentQuestion = 0; // Номер текущего вопроса
let correctAnswers = 0; // Количество правильных ответов
let incorrectAnswers = 0; // Количество неправильных ответов

document.getElementById('load-test').addEventListener('click', startTest);

function startTest() {
    // Сбрасываем состояние для нового теста
    currentQuestion = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;

    loadQuestion(); // Загружаем первый вопрос
}

function loadQuestion() {
    // Проверяем, если тест завершён
    if (currentQuestion >= totalQuestions) {
        showResults(); // Показываем результаты
        return;
    }

    // Скрываем кнопку «Загрузить тест» (если ещё видна)
    const loadTestButton = document.getElementById('load-test');
    loadTestButton.style.display = 'none';

    fetch(`/random-test?${new Date().getTime()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Сетевая ошибка: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const container = document.querySelector('#test .content-container');
            let questionHTML = '';

            // Отображение номера вопроса
            questionHTML += `<h3>Вопрос ${currentQuestion + 1} из ${totalQuestions}</h3>`;

            // Логика отображения текста/аудио вопроса
            if (data.text_for_audio && data.text_for_audio.trim()) {
                questionHTML += `<div class="audio-text">
                                    <button class="audio_text" onclick="speakSentence('${data.text_for_audio}')">
                                        <span class="icon-sound"></span>
                                    </button>
                                    <button id="toggle-text" onclick="toggleText()">Показать текст</button>
                                    <p id="text_for_audio" style="display: none;">${data.text_for_audio}</p>
                                 </div>`;
            }

            questionHTML += `<p>${data.question_text}</p>`;
            questionHTML += `
                <ul id="answer-options" class="grammar-list">
                    <li>${data.answer_option1}</li>
                    <li>${data.answer_option2}</li>
                    <li>${data.answer_option3}</li>
                    <li>${data.answer_option4}</li>
                </ul>
                <button id="submit-answer" disabled>Ответить на вопрос</button>
            `;

            container.innerHTML = questionHTML;

            const options = document.querySelectorAll('#answer-options li');
            const submitButton = document.getElementById('submit-answer');
            let selectedOption = null;

            // Логика выбора ответа
            options.forEach((option, index) => {
                option.addEventListener('click', () => {
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedOption = index + 1;
                    submitButton.disabled = false;
                });
            });

            // Логика проверки ответа
            submitButton.addEventListener('click', () => {
                if (selectedOption === null) return;

                const correctAnswerIndex = parseInt(data.correct_answer, 10);

                // Подсветка правильного и неправильного ответа
                options.forEach((option, index) => {
                    if (index + 1 === correctAnswerIndex) {
                        option.classList.add('correct');
                    } else if (index + 1 === selectedOption) {
                        option.classList.add('incorrect');
                    }
                });

                // Обновление статистики
                if (selectedOption === correctAnswerIndex) {
                    correctAnswers++;
                } else {
                    incorrectAnswers++;
                }

                // Блокировка повторного выбора
                options.forEach(option => option.classList.add('disabled'));
                submitButton.disabled = true;

                // Переход к следующему вопросу
                const nextQuestionButton = document.createElement('button');
                nextQuestionButton.id = 'next-question';
                nextQuestionButton.textContent = 'Следующий вопрос';
                nextQuestionButton.addEventListener('click', () => {
                    currentQuestion++;
                    loadQuestion(); // Загружаем следующий вопрос
                });

                container.appendChild(nextQuestionButton);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Ошибка при загрузке вопроса');
        });
}

function showResults() {
    const container = document.querySelector('#test .content-container');
    container.innerHTML = `
        <h2>Результаты теста</h2>
        <p>Правильных ответов: ${correctAnswers}</p>
        <p>Неправильных ответов: ${incorrectAnswers}</p>
        <button id="restart-test">Начать тест заново</button>
    `;

    // Кнопка для перезапуска теста
    document.getElementById('restart-test').addEventListener('click', () => {
        document.getElementById('load-test').style.display = 'block'; // Показываем кнопку «Загрузить тест»
        startTest(); // Перезапуск теста
    });
}

function toggleText() {
    const audioText = document.getElementById('text_for_audio');
    const toggleButton = document.getElementById('toggle-text'); // Кнопка

    if (audioText.classList.contains('visible')) {
        // Если текст видим, скрываем его
        audioText.style.height = `${audioText.scrollHeight}px`; // Устанавливаем текущую высоту
        requestAnimationFrame(() => {
            audioText.style.height = '0'; // Схлопываем высоту до 0
        });
        audioText.classList.remove('visible');
        audioText.style.opacity = '0'; // Прозрачность
        toggleButton.textContent = 'Показать текст'; // Меняем текст кнопки
    } else {
        // Если текст скрыт, показываем его
        audioText.style.display = 'block'; // Делаем блок видимым для вычисления высоты
        const height = audioText.scrollHeight; // Получаем высоту контента
        audioText.style.height = '0'; // Устанавливаем начальную высоту
        requestAnimationFrame(() => {
            audioText.style.height = `${height}px`; // Анимируем до полной высоты
        });
        audioText.classList.add('visible');
        audioText.style.opacity = '1'; // Прозрачность
        toggleButton.textContent = 'Скрыть текст'; // Меняем текст кнопки
    }

    // Удаляем height после завершения анимации для авто-адаптации
    audioText.addEventListener('transitionend', () => {
        if (audioText.classList.contains('visible')) {
            audioText.style.height = 'auto';
        } else {
            audioText.style.display = 'none'; // Скрываем, если текст невиден
        }
    }, { once: true });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker зарегистрирован:', registration);
    })
    .catch((error) => {
      console.error('Ошибка регистрации Service Worker:', error);
    });
}

// Загружаем темы грамматики при переключении на вкладку "Грамматика"
document.querySelector('[onclick="showTab(\'grammar\')"]').addEventListener('click', loadGrammarTopics);

if ('serviceWorker' in navigator && 'SyncManager' in window) {
    console.log('Фоновая синхронизация поддерживается');
} else {
    console.log('Фоновая синхронизация не поддерживается');
}