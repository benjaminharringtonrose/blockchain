import express from 'express';

const app = express();

app.get('/blockchain', function (req, res) {
  res.send('Hello World');
});

app.post('/transaction', function (req, res) {});

app.post('/mine', function (req, res) {});

app.listen(3000, function () {
  console.log('Listening on port 3000...');
});
