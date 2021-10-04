// ***Library server  ***
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use('/pub', express.static('pub'));

const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors({
    origin: "*",
    credentials: true,
}));

app.listen(port, () => {
    console.log(`TagLinker listening at port ${port}`);
});


// Home page
app.get('/', (req, res) => {
    res.send('Library ready');
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

