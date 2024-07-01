let CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
let API_KEY = 'YOUR_API_KEY';
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let authorizeButton = document.getElementById('authorize_button');
let signoutButton = document.getElementById('signout_button');
let content = document.getElementById('content');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        listProjects();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function listProjects() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1qICVu7Gxs9FnRPIRnlNct3sty9cCstVyu3lU3jy0SFM',
        range: 'Sheet1!A2:B',
    }).then((response) => {
        let range = response.result;
        if (range.values.length > 0) {
            let table = document.getElementById('projects_table');
            for (let i = 0; i < range.values.length; i++) {
                let row = table.insertRow(-1);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                cell1.innerHTML = range.values[i][0];
                cell2.innerHTML = range.values[i][1];
            }
        }
    });
}

function addProject() {
    let project = document.getElementById('project_name').value;
    let priority = document.getElementById('project_priority').value;

    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: '1qICVu7Gxs9FnRPIRnlNct3sty9cCstVyu3lU3jy0SFM',
        range: 'Sheet1!A:B',
        valueInputOption: 'RAW',
        resource: {
            values: [[project, priority]]
        }
    }).then((response) => {
        listProjects();
    });
}

document.addEventListener('DOMContentLoaded', handleClientLoad);
