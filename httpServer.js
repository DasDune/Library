const express = require('express');
const app = express();
const port = 555;
const bodyParser = require('body-parser');

let person = {
  person: '<h2>Dune2</h2>',
  age: 65,
};

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/see', (req, res) => {
  res.sendFile(__dirname + '/Hello.html');
});

app.get('/see2', (req, res) => {
  res.render('profile', person);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
