let CLIENT_ID = '137672712461-j295hi3qjd3ujn9752u6muaa7c912fsk.apps.googleusercontent.com';
let API_KEY = 'AIzaSyCTPWWPhH4ha-r4-F8XZ1QvXuGJVHy3g24'; // Replace with your actual API key
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let authorizeButton = document.getElementById('authorize_button');
let signoutButton = document.getElementById('signout_button');
let content = document.getElementById('content');

function handleClientLoad() {
    console.log('Loading Google API client...');
    gapi.load('client:auth2', initClient);
}

function initClient() {
    console.log('Initializing client...');
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        console.log('Client initialized.');
        gapi.auth2.init({client_id: CLIENT_ID});
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }).catch((error) => {
        console.error('Error initializing client:', error);
    });
}

function updateSigninStatus(isSignedIn) {
    console.log('Signin status changed:', isSignedIn);
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
    console.log('Authorizing...');
    gapi.auth2.getAuthInstance().signIn().catch((error) => {
        console.error('Error during sign-in:', error);
    });
}

function handleSignoutClick(event) {
    console.log('Signing out...');
    gapi.auth2.getAuthInstance().signOut();
}

function listProjects() {
    console.log('Listing projects...');
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1qICVu7Gxs9FnRPIRnlNct3sty9cCstVyu3lU3jy0SFM',
        range: 'Sheet1!A2:B',
    }).then((response) => {
        console.log('Projects listed:', response);
        let range = response.result;
        if (range.values.length > 0) {
            let table = document.getElementById('projects_table');
            table.innerHTML = '<tr><th>Project</th><th>Priority</th></tr>'; // Reset table contents
            for (let i = 0; i < range.values.length; i++) {
                let row = table.insertRow(-1);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                cell1.innerHTML = range.values[i][0];
                cell2.innerHTML = range.values[i][1];
            }
        }
    }).catch((error) => {
        console.error('Error listing projects:', error);
    });
}

function addProject() {
    console.log('Adding project...');
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
        console.log('Project added:', response);
        listProjects(); // Refresh the list after adding a project
    }).catch((error) => {
        console.error('Error adding project:', error);
    });
}

document.addEventListener('DOMContentLoaded', handleClientLoad);
