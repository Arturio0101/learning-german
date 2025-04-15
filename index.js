const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Подключение к базе данных
const db = mysql.createConnection({
    host: 'xxx',
    user: 'xxx',
    password: 'xxx',
    database: 'xxx'
});

db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        process.exit(1);
    }
    console.log('Подключение к базе данных успешно.');
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Настройка Google Text-to-Speech
const client = new textToSpeech.TextToSpeechClient({
    keyFilename: '/home/ps560160/arturstupenko.website/learning-app/nodal.json' // Укажите путь к вашему ключу JSON
});

// Маршрут для озвучивания текста
app.get('/speak', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.status(400).send('Текст не предоставлен');

    const request = {
        input: { text },
        voice: { languageCode: 'de-DE', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        res.set('Content-Type', 'audio/mp3');
        res.send(response.audioContent);
    } catch (err) {
        console.error('Ошибка при озвучке:', err);
        res.status(500).send('Ошибка при озвучке текста');
    }
});

app.get('/words', (req, res) => {
    const level = req.query.level;
    const query = `
        SELECT w.word, s.sentence, s.sentence_rus
        FROM words w
        JOIN sentences s ON s.word_id = w.id
        WHERE w.level = ?
        ORDER BY RAND()
        LIMIT 4`;

    db.query(query, [level], (err, results) => {
        if (err) {
            console.error('Ошибка при запросе слов и предложений:', err);
            return res.status(500).send('Ошибка при запросе слов и предложений');
        }
         const wordsWithSentences = results.map(row => ({
            word: row.word,
            sentence: row.sentence || 'Нет доступных предложений',
            sentence_rus: row.sentence_rus
        }));

        res.json(wordsWithSentences);
    });
});

// Маршрут для получения списка тем грамматики
app.get('/grammar-topics', (req, res) => {
    const query = 'SELECT grammar_id, title_grammar FROM grammar';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Ошибка при запросе тем грамматики:', err);
            return res.status(500).send('Ошибка при запросе тем грамматики');
        }
        res.json(results);
    });
});

// Маршрут для получения содержания выбранной темы грамматики
app.get('/grammar-content', (req, res) => {
    const grammarId = req.query.grammar_id;
    const query = 'SELECT content FROM grammar WHERE grammar_id = ?';
    db.query(query, [grammarId], (err, results) => {
        if (err) {
            console.error('Ошибка при запросе содержания грамматики:', err);
            return res.status(500).send('Ошибка при запросе содержания грамматики');
        }
        res.json(results[0] || { content: 'Содержание отсутствует' });
    });
});

app.get('/random-test', (req, res) => {
    const query = `
        SELECT 
            question_text, 
            answer_option1, 
            answer_option2, 
            answer_option3, 
            answer_option4, 
            correct_answer, 
            text_for_audio 
        FROM tests 
        ORDER BY RAND() 
        LIMIT 1`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Ошибка при запросе случайного вопроса:', err);
            return res.status(500).send('Ошибка при запросе случайного вопроса');
        }

        const result = results[0] || { content: 'Содержание отсутствует' };

        console.log('Результат из базы данных:', result); // Добавлено логирование
        res.json(result);
    });
});

// Запуск сервера
const server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Сервер активен и работает!');
});
