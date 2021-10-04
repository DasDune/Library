// ***Library server  ***
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use('/pub', express.static('pub'));

const port = process.env.PORT || 8080;

const cors = require('cors');
app.use(cors({
    origin: "*",
    credentials: true,
}));

const config = require('./config.json');
const { google } = require("googleapis");

app.listen(port, () => {
    console.log(`Library listening at port ${port}`);
});

// *** Sheets functions  ***

//init sheets with auth
sheetsInit = async () => {

    const keyFile = config['keysSheets'];

    //authorization
    auth = new google.auth.GoogleAuth({
        keyFile: keyFile,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const clientSheets = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: clientSheets });

    return ({ sheets: googleSheets, auth: auth })
}

// *** Sheets functions  ***




// Home page
app.get('/', (req, res) => {
    res.send('Library ready');
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});


// Sheets initialization
app.get('/sheetsInit', async (req, res) => {

    const sheetsObj = await sheetsInit();

    res.send(`sheets objects ${sheetsObj}`);
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});

