let { google } = require('googleapis');
let authentication = require("./authentication");
var sheets = google.sheets('v4');
const express = require('express');
const bodyParser = require('body-parser');


const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const spreadsheetId = 'your spreadsheet id';
app.post('/insert', (request, response) => {
    return authentication.authenticate().then((auth) => {
        const data = getData(auth, request.body);
        response.send(200);
    });
});
function getData(auth, body) {
    // Fetching complete data from the google sheet
    sheets.spreadsheets.values.batchGetByDataFilter({
        auth: auth,
        spreadsheetId,
        resource: {
            dataFilters: [
                {
                    gridRange: {
                        sheetId: 0
                    }
                }
            ]
        }
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var rows = response.data && response.data.valueRanges && response.data.valueRanges[0];
        const reasons = body.reasons && body.reasons.join(',');
        sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `A${rows.valueRange.values.length}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[body.mood, reasons]]
            },
            auth: auth
        }, function () {
            return "Successfully written";
        });
    });
}

// Startung the server on port 3000
app.listen(3000, () => {
    console.log(`App up at http://localhost:${3000}/`); // eslint-disable-line
});

module.exports = app;