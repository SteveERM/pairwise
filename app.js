let CLIENT_ID = '137672712461-j295hi3qjd3ujn9752u6muaa7c912fsk.apps.googleusercontent.com';
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let authorizeButton;
let signoutButton;
let content;

function handleClientLoad() {
    console.log('Loading Google API client...');
    gapi.load('client:auth2', initClient);
}

function initClient() {
    console.log('22Initializing client...');
    gapi.client.init({
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        console.log('Client initialized.');
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch((error) => {
        console.error('Error initializing client:', error);
    });
}

function updateSigninStatus(isSignedIn) {
    authorizeButton = document.getElementById('authorize_button');
    signoutButton = document.getElementById('signout_button');
    content = document.getElementById('content');

    if (isSignedIn) {
        if (authorizeButton && signoutButton && content) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            content.style.display = 'block';
            listProjects();
        } else {
            console.error('Error: authorizeButton, signoutButton or content element not found');
        }
    } else {
        if (authorizeButton && signoutButton && content) {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
            content.style.display = 'none';
        }
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function handleCredentialResponse(response) {
    console.log('Credential Response:', response);
    const responsePayload = parseJwt(response.credential);

    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log('Given Name: ' + responsePayload.given_name);
    console.log('Family Name: ' + responsePayload.family_name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);

    updateSigninStatus(true);
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function listProjects() {
    console.log('Listing projects...');
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1qICVu7Gxs9FnRPIRnlNct3sty9cCstVyu3lU3jy0SFM',
        range: 'Sheet1!A2:B',
    }).then((response) => {
        console.log('Projects listed:', response);
        let range = response.result.values;
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
    }).catch((error) => {
        console.error('Error listing projects:', error);
    });
}

function addProject() {
    console.log('Adding project...');
    let project = document.getElementById('project_name').value;
    let priority = document.getElementById('project_priority').value;

    // Ensure the user is signed in
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: '1qICVu7Gxs9FnRPIRnlNct3sty9cCstVyu3lU3jy0SFM',
            range: 'Sheet1!A:B',
            valueInputOption: 'RAW',
            resource: {
                values: [[project, priority]]
            }
        }).then((response) => {
            console.log('Project added:', response);
            listProjects(); // Refresh the list after adding a project
        }).catch((error) => {
            console.error('Error adding project:', error);
        });
    } else {
        console.error('User is not signed in');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    handleClientLoad();

    // Ensure elements are loaded
    authorizeButton = document.getElementById('authorize_button');
    signoutButton = document.getElementById('signout_button');
    content = document.getElementById('content');
    console.log('DOM fully loaded and parsed');
    console.log('authorizeButton:', authorizeButton);
    console.log('signoutButton:', signoutButton);
    console.log('content:', content);

    // Add event listeners for buttons
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
});
