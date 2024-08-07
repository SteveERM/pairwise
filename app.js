let CLIENT_ID = '137672712461-j295hi3qjd3ujn9752u6muaa7c912fsk.apps.googleusercontent.com';
let API_KEY = 'YOUR_NEW_API_KEY'; // Replace with your actual API key
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let signoutButton;
let content;
let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.querySelector('.g_id_signin').style.display = 'block';
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        await listProjects();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken('');
            document.getElementById('content').style.display = 'none';
            document.getElementById('signout_button').style.display = 'none';
            document.querySelector('.g_id_signin').style.display = 'block';
        });
    }
}

async function listProjects() {
    console.log('Listing projects...');
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1qICVu7Gxs9FnRPIRnlNct3sty9cCstVyu3lU3jy0SFM',
            range: 'Sheet1!A2:B',
        });
        console.log('Projects listed:', response);
        const range = response.result.values;
        if (range && range.length > 0) {
            let table = document.getElementById('projects_table');
            table.innerHTML = '<tr><th>Project</th><th>Priority</th></tr>'; // Reset table contents
            for (let i = 0; i < range.length; i++) {
                let row = table.insertRow(-1);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                cell1.innerHTML = range[i][0];
                cell2.innerHTML = range[i][1];
            }
        } else {
            console.log('No data found.');
        }
    } catch (error) {
        console.error('Error listing projects:', error);
    }
}

async function addProject() {
    console.log('Adding project...');
    let project = document.getElementById('project_name').value;
    let priority = document.getElementById('project_priority').value;

    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: '1qICVu7Gxs9FnRPIRnlNct3sty9cCstVyu3lU3jy0SFM',
            range: 'Sheet1!A:B',
            valueInputOption: 'RAW',
            resource: {
                values: [[project, priority]],
            },
        });
        console.log('Project added:', response);
        listProjects(); // Refresh the list after adding a project
    } catch (error) {
        console.error('Error adding project:', error);
    }
}

function setBuildDate() {
    const buildDate = new Date().toISOString();
    document.getElementById('build_date').innerText = `Build Date: ${buildDate}`;
}

document.addEventListener('DOMContentLoaded', () => {
    signoutButton = document.getElementById('signout_button');
    content = document.getElementById('content');
    console.log('DOM fully loaded and parsed');
    console.log('signoutButton:', signoutButton);
    console.log('content:', content);

    setBuildDate(); // Set the build date on the screen

    gapiLoaded();
    gisLoaded();
});

function handleCredentialResponse(response) {
    console.log('Credential Response:', response);
    const responsePayload = parseJwt(response.credential);

    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log('Given Name: ' + responsePayload.given_name);
    console.log('Family Name: ' + responsePayload.family_name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);

    document.getElementById('content').style.display = 'block';
    document.getElementById('signout_button').style.display = 'block';
    document.querySelector('.g_id_signin').style.display = 'none';

    listProjects();
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
