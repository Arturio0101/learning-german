const http = require('https');

const options = {
  hostname: 'learning-app.arturstupenko.website',
  port: 443,
  path: '/', // <--- важное изменение
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`Wake-up ping sent. Status code: ${res.statusCode}`);
});

req.on('error', (e) => {
  console.error(`Problem with wake-up request: ${e.message}`);
});

req.end();