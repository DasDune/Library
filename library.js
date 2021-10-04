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

const init = (async() => {

    const sheetsAPIInfo = await sheetsInit()
    sheets = sheetsAPIInfo.sheets;
    auth = sheetsAPIInfo.auth;
    
    })()



// sheets info
sheetsInfo = async (sheetsId) => {

    let spreadsheetId = sheetsId

    //Get sheets info
    sheetsData = await sheets.spreadsheets.get({
        spreadsheetId,
    });

    return (sheetsData.data)
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

// Sheets info
app.get('/sheetsInfo', async (req, res) => {

    const sheetsData = await sheetsInfo('1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4');

    let answer = `<h1 style='color:blue'>sheetsInfo<h1>
    <h2 style='color:green'>sheetsData</h2>
    <h2>namedRange :: <span style='color:peru'> ${sheetsData.namedRanges.length}</span></h2>
    <h2>properties.title :: <span style='color:peru'>${sheetsData.properties.title}</span></h2>
    <h2>sheets :: <span style='color:peru'>${sheetsData.sheets.length}</span> sheets</h2>
    <h2>spreadsheetId :: <span style='color:peru'>${sheetsData.spreadsheetId}</span></h2>
    <h2>spreadsheetUrl :: <span style='color:peru'>${sheetsData.spreadsheetUrl}</span></h2>
    `

    res.send(answer);
    // res.sendFile(`${__dirname}/pub/signIn.html`);
});
