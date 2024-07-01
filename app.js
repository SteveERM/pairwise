let CLIENT_ID = '137672712461-j295hi3qjd3ujn9752u6muaa7c912fsk.apps.googleusercontent.com';
let API_KEY = 'AIzaSyCTPWWPhH4ha-r4-F8XZ1QvXuGJVHy3g24'; // Replace with your actual API key
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let signoutButton;
let content;

function handleClientLoad() {
    console.log('Loading Google API client...');
    gapi.load('client', initClient);
}

function initClient() {
    console.log('Initializing client...');
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS
    }).then(() => {
        console.log('Client initialized.');
    }).catch((error) => {
        console.error('Error initializing client:', error);
    });
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

    // Ensure elements are correctly referenced
    signoutButton = document.getElementById('signout_button');
    content = document.getElementById('content');

    if (signoutButton && content) {
        // Show the content and signout button
        signoutButton.style.display = 'block';
        content.style.display = 'block';

        listProjects();
    } else {
        console.error('Error: signoutButton or content element not found');
    }
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function handleSignoutClick() {
    console.log('Signing out...');
    // Hide the content and signout button
    if (signoutButton && content) {
        signoutButton.style.display = 'none';
        content.style.display = 'none';
    }

    // Clear the Google Identity Services data
    google.accounts.id.disableAutoSelect();
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

document.addEventListener('DOMContentLoaded', () => {
    handleClientLoad();

    // Ensure elements are loaded
    signoutButton = document.getElementById('signout_button');
    content = document.getElementById('content');
});
