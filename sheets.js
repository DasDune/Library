//Google sheets  

const config = require('./config.json');
const { google } = require("googleapis");

//cells objects used by batch update

//update values
let valUpt =
{
    updateCells: {
        range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 0,
            startColumnIndex: 0,
            endColumnIndex: 0,
        },
        fields: 'userEnteredValue',
        rows: [{
            values: [{
                userEnteredValue: {
                    // key/val set dynamically vs value type to pass
                },
            }],
        }],
    },
}

//format cells
let fCell =
{
    repeatCell: {
        range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 0,
            startColumnIndex: 0,
            endColumnIndex: 0,
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment )',
        cell: {
            "userEnteredFormat": {
                "backgroundColor": {
                    "red": 1,
                    "green":1,
                    "blue": 1
                },
                "horizontalAlignment": "LEFT",
                "verticalAlignment": "MIDDLE",
                "textFormat": {
                    "foregroundColor": {
                        "red": 0,
                        "green": 0,
                        "blue": 0
                    },
                    "fontSize": 10,
                    "bold": false
                }
            }
        },
    },
}

//update note
let noteUpt =
{
    updateCells: {
        range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 0,
            startColumnIndex: 0,
            endColumnIndex: 0,
        },
        fields: 'note',
        rows: [{
            values: [{
                note: {
                    // key/val set dynamically vs value type to pass
                },
            }],
        }],
    },
}




//named range add object template
nrAdd = {
    "addNamedRange": {
        "namedRange": {
            "name": "",
            "range": {
                "sheetId": 0,
                "startRowIndex": 0,
                "endRowIndex": 0,
                "startColumnIndex": 0,
                "endColumnIndex": 0,
            },
        }
    }
}





//named range update object template
nrUpt = {
    "updateNamedRange": {
        "namedRange": {
            "name": "",
            "namedRangeId": "",
            "range": {
                "sheetId": 0,
                "startRowIndex": 0,
                "endRowIndex": 0,
                "startColumnIndex": 0,
                "endColumnIndex": 0,
            },
        },
        "fields": "*"
    }
}
//future code






















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







// sheets info
sheetsInfo = async (sheetsId) => {

    let spreadsheetId = sheetsId

    //Get sheets info
    sheetsData = await sheets.spreadsheets.get({
        spreadsheetId,
    });

    return (sheetsData.data)
}













//get sheet info
sheetInfo = async (sheetName) => {

    const { data } = sheetsData
    const spreadsheetId = data.spreadsheetId

    let ssData = data.sheets
    let sheet = ssData.filter((ssData) => ssData.properties.title == sheetName)
    let sheetId = sheet[0].properties.sheetId;
    let row = sheet[0].properties.gridProperties.rowCount;
    let col = sheet[0].properties.gridProperties.columnCount;

    const getRows = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${sheetName}!R1C1:R${row}C${col}`,
        // range: `${sheetName}!A1:${colLetter}${row}`,
    });

    //Get all the tags from the sheet
    let rowsData = getRows.data.values

    return ({ sheetId: sheetId, rowsData: rowsData })
}

//populate named ranges for updated tags for the current sheet
popNamedRanges = async (sheet) => {

    const { data } = sheetsData
    const spreadsheetId = data.spreadsheetId
    const namedRanges = data.namedRanges
    const { sheetId, rowsData } = sheet

    let nr = [];
    let nr2s = [];

    // let patt = new RegExp(/^U$/);

    // let header = rowsData.shift();
    // let tagsFlt = rowsData.filter(((tag) => patt.test(tag[0])))

    rowsData.map((tag) => {

        //Check if named range already exist if yes we need to update instead of adding a namedrange
        //If you don't the namedrange add method will produce the error : 'already exist'
        nrName = `NR_${tag[0].replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))

        if (nr.length == 0) {
            //need to do a deep object copy of th object to make sure the variables
            //do not refer to the same object 
            anr2 = JSON.parse(JSON.stringify(nrAdd));
            // nrn = nr2.addNamedRange.namedRange.name
            anr = anr2.addNamedRange.namedRange
            anr.name = nrName;
            anr.range.sheetId = sheetId;
            row = rowsData.indexOf(rowsData.filter((tg) => tg[0] == tag[0])[0])
            anr.range.startRowIndex = row;
            anr.range.endRowIndex = row + 1;
            anr.range.startColumnIndex = 0;
            anr.range.endColumnIndex = rowsData[0].length;
            nr2s.push(anr2)
        }

        else {
            //need to do a deep object copy of th object to make sure the variables
            //do not refer to the same object 
            unr2 = JSON.parse(JSON.stringify(nrUpt));
            unr = unr2.updateNamedRange.namedRange
            unr.name = nrName;
            unr.namedRangeId = nr[0].namedRangeId;
            unr.range.sheetId = sheetId;
            row = rowsData.indexOf(rowsData.filter((tg) => tg[0] == tag[0])[0])
            unr.range.startRowIndex = row;
            unr.range.endRowIndex = row + 1;
            unr.range.startColumnIndex = 0;
            unr.range.endColumnIndex = rowsData[0].length;
            nr2s.push(unr2)
        }

    })

    //Wait until all the named ranges has been sent prior to send the tags to DB
    //Because DB use the named range to access the sheet tags
    try {
        await sheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: nr2s
            },
        }
        );
    }
    catch (err) {
        console.log(`popNamedRanges :: ${err.stack}`)
    }

};

//delete named ranges
delNamedRanges = async (sheet) => {

    const { data } = sheetsData
    const spreadsheetId = data.spreadsheetId
    const namedRanges = data.namedRanges
    const { sheetId, rowsData } = sheet

    let nrDel = {
            "deleteNamedRange": {
            "namedRangeId": '',
            }
        }  

    // let nr = [];
    let nrDels = [];    

    namedRanges.map((nr)=> {

        nrDel2 = JSON.parse(JSON.stringify(nrDel));
        // nrn = nr2.addNamedRange.namedRange.name
        nrDel2.deleteNamedRange.namedRangeId = nr.namedRangeId
        nrDels.push(nrDel2)

    })

    try {
        await sheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: nrDels
            },
        }
        );
    }
    catch (err) {
        console.log(`popNamedRanges :: ${err.stack}`)
    }

}









//format cell on tag/header position
formatCell = async (tag, key, format) => {

    const {bBlue, bGreen, bRed, fBlue, fGreen, fRed, bold, fontSize, hAlign, vAlign } = format

    const { data } = sheetsData
    const spreadsheetId = data.spreadsheetId
    const namedRanges = data.namedRanges
    let sheetId = 0;

    let nr = [];
    let fCell2 = {};
    let fCell2s = [];

    try {

        nrName = `NR_${tag.replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))
        if (nr[0].range.sheetId !== undefined) sheetId = nr[0].range.sheetId;
        let sheets2 = data.sheets
        let sheet = sheets2.filter((sheets) => sheets.properties.sheetId == sheetId)
        let sheetName = sheet[0].properties.title;
        let row = sheet[0].properties.gridProperties.rowCount;
        let col = sheet[0].properties.gridProperties.columnCount;

        //strong copy of object template
        fCell2 = JSON.parse(JSON.stringify(fCell));
        bg = fCell2.repeatCell.cell.userEnteredFormat.backgroundColor
        text = fCell2.repeatCell.cell.userEnteredFormat.textFormat
        align = fCell2.repeatCell.cell.userEnteredFormat
        bg.blue = bBlue !== undefined ? bBlue/255 : bg.blue
        bg.green = bGreen !== undefined ? bGreen/255 : bg.green
        bg.red = bRed !== undefined ? bRed/255 : bg.red
        text.foregroundColor.blue = fBlue !== undefined ? fBlue/255 : text.foregroundColor.blue
        text.foregroundColor.green = fGreen !== undefined ? fGreen/255 : text.foregroundColor.green
        text.foregroundColor.red = fRed !== undefined ? fRed/255 : text.foregroundColor.red
        text.bold = bold !== undefined ? bold : text.bold 
        text.fontSize = fontSize !== undefined ? fontSize : text.fontSize
        align.horizontalAlignment = hAlign !== undefined ? hAlign : align.horizontalAlignment
        align.verticalAlignment = vAlign !== undefined ? vAlign : align.verticalAlignment

        fRng = fCell2.repeatCell.range
        fRng.sheetId = sheetId;
        fRng.startRowIndex = nr[0].range.startRowIndex;
        fRng.endRowIndex = nr[0].range.startRowIndex + 1;

        //Get header array
        const getRowsInfo = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheetName}!R1C1:R${1}C${col}`,
        });

        header = getRowsInfo.data.values[0]
        // rowData = getRowsInfo.data.values

        keyIndex = header.indexOf(key)

        fRng.startColumnIndex = keyIndex;
        fRng.endColumnIndex = keyIndex + 1;

        fCell2s.push(fCell2);

        // valUpt2s.push(noteUpt2);

    }
    catch (err) {
        console.log(`${err.stack}`)
    }

    try {
        await sheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: fCell2s
            },
        }
        );
        // console.log(`${color.fgGreen}"Update" updated : ${color.reset} ${valUpt2s.length}`)
    }
    catch (err) {
        console.log(`${err.stack}`)
    }
  
}














//set a cells for a given tag and a given column 
setCell = async (sheets, tag, link) => {

    const { data } = sheetsData
    const spreadsheetId = data.spreadsheetId
    const namedRanges = data.namedRanges
    const { sheetId, rowsData } = sheet

    let valUpt2 = {};
    let valUpt2s = [];

    try {
        //Get sheets info for the tag
        nrName = `NR_${tag.replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))

        let sheetId = nr[0].range.sheetId;
        let sheetsList = data.data.sheets
        let sheet = sheetsList.filter((sheetsList) => sheetsList.properties.sheetId == sheetId)
        let sheetName = sheet[0].properties.title;

        let row = nr[0].range.startRowIndex;
        let col = nr[0].range.endColumnIndex;

        const header = await gs.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheetName}!R${1}C${1}:R${1}C${col}`,
            valueRenderOption: 'FORMULA',
            // range: `${sheetName}!A1:${colLetter}${row}`,
        });

        console.log(header)

        //strong copy of object template
        valUpt2 = JSON.parse(JSON.stringify(valUpt));
        valUpt2.updateCells.range.sheetId = sheetId;

        valUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
        valUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;

        colIndex = header.data.values[0].indexOf(link)

        valUpt2.updateCells.range.startColumnIndex = colIndex
        valUpt2.updateCells.range.endColumnIndex = colIndex + 1

        valUpt2.updateCells.rows[0].values[0].userEnteredValue.stringValue = '';
        valUpt2s.push(valUpt2);

        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: valUpt2s
            },
        }
        );
        console.log(`clearCells :: Cleared doc link on column ${link} for tag ${tag} on sheet ${sheetName}`)

    }

    catch (err) {
        console.log(`${color.fgRed}${err.stack}${color.reset}`)
    }
}






//populate tags from sheet 
popTagsFromSheet = async (sheet) => {

    const { rowsData } = sheet

    let header = rowsData[0];
    let patt = new RegExp(/^U$|^D$/);
    let tagsFlt = rowsData.filter(((tag) => patt.test(tag[0])))

    let tags = [];

    // Convert to an array of tags object to be sent to DB
    try {

        tagsFlt.map((tag) => {
            tagObj = {};
            tag.map((val, i) => {
                if (header[i] == 'Update') {
                    // user = 'toto@toto.com';
                    // tagObj[header[i]] = userEmail + '\n' + getDateTime();
                }
                else if (val != '') tagObj[header[i]] = val

            })
            tags.push(tagObj)
        })

    }
    catch (err) {
        console.log(`err.stack}`)
        return (tags)
    }

    return tags;

}














//Update <Update> first column
updateUpdate = async (sheet, tags) => {

    const { data } = sheetsData
    const spreadsheetId = data.spreadsheetId
    const namedRanges = data.namedRanges
    const { sheetId } = sheet

    let valUpt2 = {};
    let valUpt2s = [];

    try {
        tags.map(async (tag) => {

            try {

                nrName = `NR_${tag.Name.replace(/[-\/]/g, '_')}`;
                if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))
                //strong copy of object template
                valUpt2 = JSON.parse(JSON.stringify(valUpt));
                valUpt2.updateCells.range.sheetId = sheetId;
                valUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
                valUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;
                valUpt2.updateCells.range.startColumnIndex = 0;
                valUpt2.updateCells.range.endColumnIndex = 1;
                valUpt2.updateCells.rows[0].values[0].userEnteredValue.stringValue = tag.Update;
                valUpt2s.push(valUpt2);
            }
            catch (err) {
                console.log(`${err.stack}`)
            }
        })
    }
    catch (err) {
        console.log(`${err.stack}`)
    }

    try {
        await sheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: valUpt2s
            },
        }
        );
    }
    catch (err) {
        console.log(`${err.stack}`)
    }
}

//Update sheet cell from TagLinker client 
updateCell = async (sheets, userEmail, tag, key, val) => {

    // get fresh sheets
    const { spreadsheetId, auth, namedRanges, data } = sheets

    let valUpt2 = {};
    let noteUpt2 = {};
    let UptArr = [];

    try {

        nrName = `NR_${tag.replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))
        let sheetId = nr[0].range.sheetId;
        let sheets = data.data.sheets
        let sheet = sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
        let sheetName = sheet[0].properties.title;
        let row = sheet[0].properties.gridProperties.rowCount;
        let col = sheet[0].properties.gridProperties.columnCount;

        //strong copy of object template
        valUpt2 = JSON.parse(JSON.stringify(valUpt));
        valUpt2.updateCells.range.sheetId = sheetId;
        valUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
        valUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;

        noteUpt2 = JSON.parse(JSON.stringify(noteUpt));
        noteUpt2.updateCells.range.sheetId = sheetId;
        noteUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
        noteUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;

        const getRowsInfo = await gs.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheetName}!R1C1:R${1}C${col}`,
            // range: `${sheetName}!A1:${colLetter}${row}`,
        });

        header = getRowsInfo.data.values[0]
        // rowData = getRowsInfo.data.values

        keyIndex = header.indexOf(key)

        valUpt2.updateCells.range.startColumnIndex = keyIndex;
        valUpt2.updateCells.range.endColumnIndex = keyIndex + 1;
        valUpt2.updateCells.rows[0].values[0].userEnteredValue.stringValue = val;
        UptArr.push(valUpt2);

        noteUpt2.updateCells.range.startColumnIndex = keyIndex;
        noteUpt2.updateCells.range.endColumnIndex = keyIndex + 1;

        let note = `[ ${getDateTime()} ]\n${userEmail}\nChange: ${val}`;


        noteUpt2.updateCells.rows[0].values[0].note = note;



        UptArr.push(noteUpt2);

    }
    catch (err) {
        console.log(`${color.fgRed}${err.stack}${color.reset}`)
    }


    try {
        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: UptArr
            },
        }
        );
        // console.log(`${color.fgGreen}"Update" updated : ${color.reset} ${valUpt2s.length}`)
    }
    catch (err) {
        console.log(`${color.fgRed}${err.stack}${color.reset}`)
    }

    // console.log(`${color.fgGreen}function :: updateUpdate completed.${color.reset}`)
}

//Update rows from tags
updateRows = async (sheets, tagNames, urlKey, urlVal, linkName, fileName2) => {

    const { gs, spreadsheetId, auth, namedRanges, data } = sheets

    let valUpt2 = {};
    let fCellObj2 = {};
    let UptArr = [];
    let UptArr2 = [];
    let headers = { header: [] }
    let headerFlag = false;

    for (let tagName of tagNames) {

        try {

            headerFlag = false;
            //Get sheets info for the tag
            nrName = `NR_${tagName.replace(/[-\/]/g, '_')}`;
            if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))

            let sheetId = nr[0].range.sheetId;
            let sheets = data.data.sheets
            let sheet = sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
            let sheetName = sheet[0].properties.title;
            // let row = sheet[0].properties.gridProperties.rowCount;
            let col = sheet[0].properties.gridProperties.columnCount;

            //check if we have already the header to avoid to call values/get for our Google sheets API quotas
            for (const [key, val] of Object.entries(headers)) {

                if (key === sheetId.toString()) headerFlag = true;

            }

            if (!headerFlag) {

                const getRowsInfo = await gs.spreadsheets.values.get({
                    auth,
                    spreadsheetId,
                    range: `${sheetName}!R1C1:R1C${col}`,
                    // range: `${sheetName}!A1:${colLetter}${row}`,
                });

                headers[sheetId] = getRowsInfo.data.values[0]

            }

            let header = headers[sheetId];

            //strong copy of update values object
            valUpt2 = JSON.parse(JSON.stringify(valUpt));
            valUpt2.updateCells.range.sheetId = sheetId;
            valUpt2.updateCells.range.startRowIndex = nr[0].range.startRowIndex;
            valUpt2.updateCells.range.endRowIndex = nr[0].range.startRowIndex + 1;

            //Process the header and tagRow updates
            for (key of header) {
                //check if new header key/val
                if (header.indexOf(urlKey) == -1) {
                    header.push(urlKey);
                    headers[sheetId] = header;
                    keyIndex = header.indexOf(urlKey);
                    valUpt3 = JSON.parse(JSON.stringify(valUpt));
                    valUpt3.updateCells.range.sheetId = sheetId;
                    valUpt3.updateCells.range.startRowIndex = 0;
                    valUpt3.updateCells.range.endRowIndex = 1;
                    valUpt3.updateCells.range.startColumnIndex = keyIndex;
                    valUpt3.updateCells.range.endColumnIndex = keyIndex + 1;
                    valUpt3.updateCells.rows[0].values[0].userEnteredValue.stringValue = urlKey;
                    UptArr2.push(valUpt3);

                    fCellObj2 = JSON.parse(JSON.stringify(fCellObj));
                    fCellObj2.repeatCell.range.sheetId = sheetId;
                    fCellObj2.repeatCell.range.startRowIndex = 0;
                    fCellObj2.repeatCell.range.endRowIndex = 1;
                    fCellObj2.repeatCell.range.startColumnIndex = keyIndex;
                    fCellObj2.repeatCell.range.endColumnIndex = keyIndex + 1;
                    UptArr2.push(fCellObj2);

                    //append a new formatted column at the end prior to update the new header key
                    try {
                        await gs.spreadsheets.batchUpdate({
                            auth,
                            spreadsheetId,
                            requestBody: {
                                requests: [
                                    {
                                        "appendDimension": {
                                            "sheetId": sheetId,
                                            "dimension": "COLUMNS",
                                            "length": 1
                                        }
                                    }
                                ]
                            },
                        }
                        );
                        console.log(`Append column #${keyIndex} on sheet ${sheetName}`)
                    }
                    catch (err) {
                        console.log(`${color.fgRed}${err.stack}${color.reset}`)
                    }

                    //update the key name (presently null)
                    try {
                        await gs.spreadsheets.batchUpdate({
                            auth,
                            spreadsheetId,
                            requestBody: {
                                requests: UptArr2
                            },
                        }
                        );
                        console.log(`New header key ${urlKey} on sheet ${sheetName}`)
                    }
                    catch (err) {
                        console.log(`${color.fgRed}${err.stack}${color.reset}`)
                    }
                }
                else keyIndex = header.indexOf(urlKey);


            }

            //update the cell with doc hyperlink
            valUpt2.updateCells.range.startColumnIndex = keyIndex;
            valUpt2.updateCells.range.endColumnIndex = keyIndex + 1;
            val2 = `=hyperlink("${urlVal}","${linkName}")`
            // val3 = val2.substring(1, 100)
            valUpt2.updateCells.rows[0].values[0].userEnteredValue.formulaValue = val2;
            UptArr.push(valUpt2);



        }

        catch (err) {
            console.log(`updateRows :: ${err.stack}`)
        }
    }

    try {
        await gs.spreadsheets.batchUpdate({
            auth,
            spreadsheetId,
            requestBody: {
                requests: UptArr
            },
        }
        );
        // console.log(`${color.fgGreen}tags updated : ${color.reset} ${UptArr.length}`)
    }
    catch (err) {
        console.log(`updateRows :: ${err.stack}`)
    }


    // console.log(`${color.fgGreen}function :: updateRows completed.${color.reset}`)
}

//populate status from sheet 
popStatus = async (sheets, sheet, userEmail) => {

    console.log(`${color.fgYellow}function :: popStatus started...${color.reset}`)

    const { rowsData, sheetId } = sheet
    const { spreadsheetId } = sheets

    let sheetsName = sheets.data.data.properties.title
    let sheetsId = sheets.spreadsheetId

    sheet = sheets.data.data.sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
    let sheetName = sheet[0].properties.title;



    let header = rowsData[0];
    let patt = new RegExp(/^U$|^D$/);
    let tagsFlt = rowsData.filter(((tag, i) => patt.test(tag[0])))
    let tags = [];
    let tagRow = 0;

    // let tagRow = rowsData.filter(((tag, i) => tag.test(tag[1])))

    // Convert to an array of tags object to be sent to DB
    try {
        // let tags = [];
        // let nrs = [];

        // tagRow2 = rowsData.findIndex(tagRow)
        // nrObj = {};
        // nrName = `NR_${tag[1].replace(/[-]/g, '_')}`;
        // nrObj['name'] = nrName;
        // nrObj['row'] = sheetTags.indexOf(tag) + 1;
        // nrObj['col'] = col;
        // nrs.push(nrObj);
        tagObj = {};




        tagsFlt.map((tag) => {

            tag.map((val, i) => {
                if (header[i] == 'Update') {

                    tagObj[header[i]] = userEmail + '\n' + getDateTime();
                }
                else if (val != '') tagObj[header[i]] = val
            })

            tags.push(tagObj)
        })
        console.log(`${color.fgBlue}tags populated : ${color.reset}${Object.keys(tagObj).length}`)

    }
    catch (err) {
        console.log(`${color.fgRed}${err.stack}${color.reset}`)
    }

    console.log(`${color.fgGreen}function :: popTagsFromSheet completed.${color.reset}`)

    try {
        return tags;
    }
    catch (err) {
        console.log(`${color.fgRed}${err.stack}${color.reset}`)
    }

}



//Get Sheet info for a given tag
let getSheetInfoFromTag = async (sheets, tag) => {

    // get fresh sheets
    const { namedRanges, data } = sheets

    let nr = []

    try {

        nrName = `NR_${tag.replace(/[-\/]/g, '_')}`;
        if (namedRanges !== undefined) nr = (namedRanges.filter((nr) => nr.name == nrName))
        let sheetId = nr[0].range.sheetId;
        let sheets = data.data.sheets
        let sheet = sheets.filter((sheets) => sheets.properties.sheetId == sheetId)
        let row = nr[0].range.endRowIndex;
        let col = sheet[0].properties.gridProperties.columnCount;
        let info = { sheetId: sheetId, range: `B${row}` }
        return info
    }
    catch (err) {
        console.log(`getSheetInfoFromTag :: ${err.stack}`)
        return { sheetId: `not found`, range: `not found` }
    }
}

//Update header based on document type
updateHeader = async (sheets, sheet) => {

    console.log(`${color.fgYellow}function :: updateHeader started...${color.reset}`)

    const { gs, spreadsheetId, auth, namedRanges, data } = sheets
    const { rowsData } = sheet

    //batch update cells object template
    let valUpt =
    {
        updateCells: {
            range: {
                sheetId: 2054546716,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 1,
            },
            fields: 'userEnteredValue',
            rows: [{
                values: [{
                    userEnteredValue: {
                        // key/val set dynamically vs value type to pass
                    },
                }],
            }],
        },
    }

    let valUpt2 = {};
    let valUpt2s = [];

    let header = rowsData[0];

    console.log(header)

    let typeIndex = header.indexOf('Type');
    let arrTypes = []

    rowsData.map((typeData, i) => {
        if (i != 0) {
            console.log(typeData[typeIndex])
            if (arrTypes.indexOf(typeData[typeIndex]) == -1) arrTypes.push(typeData[typeIndex])
        }
    })

    console.log(arrTypes)









}




// let sheets = {}
// let auth = {}

module.exports = { sheetsInit, sheetsInfo, sheetInfo, popNamedRanges, delNamedRanges, formatCell }


let sheetsTester = (async () => {

    // const sheetsAPIInfo = await sheetsInit()

    // console.log(sheetsAPIInfo);

    // sheets = sheetsAPIInfo.sheets;
    // auth = sheetsAPIInfo.auth;

    // const sheetsData = await sheetsInfo('1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4')

    // console.log(sheets)
    // const sheet = await sheetInfo('Library')

    // await popNamedRanges(sheet);

    // const tags = await popTagsFromSheet(sheet)

    // console.log(tags)
  
    // tags = [{Name:'Tag4', Update:'update4'}, {Name:'Tag8', Update:'update8'},]

    // await updateUpdate(sheet, tags);

    // await updateCell(sheets, 'taglinker@gmail.com', '2400-LIT-2101', 'IOType', 'OOP')

    // const info = await getSheetInfoFromTag(sheets, '2400-LIT-2101')

    // console.log(info)

    // await updateRows(sheets, ['0-TEST'], 'PDF', 'https://www.google.com/', 'PDF', '0-TEST')

    // await formatCell(sheets, '2400-LIT-2101', 'Status')

    // console.log(sheet)
    // await popNamedRanges(sheet);

    // let tags = await popStatus(sheets, sheet, 'toto@toto.com');

    // let tags = await popTagsFromSheet2(sheets, sheet, 'toto@toto.com');
    // console.log(tags);
    // dbSet(tags)

    // await updateUpdate(sheets, sheet, tags);

    // urlKey = 'P&ID'
    // urlVal = 'https://firebasestorage.googleapis.com/v0/b/taglinker-admin.appspot.com/o/DSOT-DW-2400-IC-8021.html?alt=media&token=13f50298-cf04-4c92-b640-26c480eacce8'

    // tagNames = ['2400-15-PLOH-SB2I-024', '2400-15-PLOH-SB2I-025', '2400-TSHH-2120', '2400-FV-2170', '2200-PLC-01-20031-55']


    // await updateRows(sheets, tags);
    // await updateRows2(sheets, tagNames, urlKey, urlVal)

    // await updateHeader(sheets, sheet);


})()
