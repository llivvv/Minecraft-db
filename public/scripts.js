/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

let isShowPlayers = false;
let isShowAcByAll = false;
let isShowHaving = false;

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

function makeTableRows(resData, tableBody) {
	resData.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchAndDisplayPlayers() {
    const tableElement = document.getElementById('allPlayers');
    const tableBody = document.getElementById('tbodyAllPlayers');

    const response = await fetch('/players', {
        method: 'GET'
    });
    const responseData = await response.json();
    const playersContent = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    playersContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });

    const playerSection = document.getElementById('playerSection');
    playerSection.classList.remove('hide');
}

async function insertPlayer(event) {
    event.preventDefault()

    const usernameValue = document.getElementById('insertUsername').value;
    const userCredentialsValue = document.getElementById('insertUserCredentials').value;
    const xpValue = document.getElementById('insertXp').value;
    const emailValue = document.getElementById('insertEmail').value;
    const skinValue = document.getElementById('insertSkin').value;
    const iidValue = document.getElementById('insertIid').value;

    const response = await fetch('/insertPlayer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameValue,
            user_credentials: userCredentialsValue,
            xp: xpValue,
            email: emailValue,
            skin: skinValue,
            iid: iidValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Player inserted successfully!";
    } else {
        messageElement.textContent = "Error inserting Player!";
    }

    fetchAndDisplayPlayers();
}

async function updatePlayerEmail(e) {
    e.preventDefault();

    const usernameValue = document.getElementById('updateUsername').value;
    const emailValue = document.getElementById('updateEmail').value;

    const response = await fetch('/update-player-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameValue,
            email: emailValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateEmailResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Email updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating email!";
    }
}

async function deletePlayer(e) {
    e.preventDefault();

    const usernameValue = document.getElementById('delUsername').value;

    const response = await fetch('/delete-player', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameValue,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('delPlayerResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Player deleted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error deleting player!";
    }
}

// fetches achievements achieved by all and displays it
async function viewAcByAll() {
	const tableElement = document.getElementById('divAchievement');
    const tableBody = document.getElementById('tbodyDivAchievement');

	// hide table
    if (isShowAcByAll) {
        tableElement.classList.add("hide");
        document.getElementById("divAchievementBtn").innerHTML = 'View Achievements achieved by all players';

    //fetch and show table
    } else {
        document.getElementById("divAchievementBtn").innerHTML = 'Hide Achievements achieved by all players';

        const response = await fetch('/divAchievement', {
            method: 'GET'
        });

        const responseData = await response.json();
        const acByAll = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        makeTableRows(acByAll, tableBody);
        tableElement.classList.remove("hide");
    }

    isShowAcByAll = !isShowAcByAll;
}

// for Mob1 projection
async function projMob(e) {
  e.preventDefault();
  const tableElement = document.getElementById('showProjMob');
  const tableBody = document.getElementById('tbodyProjMob');
  const tableTr = document.getElementById('trProjMob');
  const form = document.getElementById('formProjMob');
  const hideBtn = document.getElementById('hideMobBtn');
  const formData = new FormData(form);

  const arrData = formData.getAll('atts');
  // handle user not selecting any checkbox
    if (arrData.length == 0) {
      alert('Please select at least 1 attribute');
      return;
    }
  const strData = arrData.join(",");

  // reset column names
  if (tableTr) {
     tableTr.innerHTML = "";
  }

  // get column names
  arrData.map((att) => {
    let trElem = document.createElement('th');
    trElem.innerHTML = att;
    tableTr.appendChild(trElem);
  });

  const response = await fetch(`/projMob?atts=${strData}`, {
    method: 'GET',
  });

  const responseData = await response.json();
  const projMob = responseData.data;

  if (tableBody) {
    tableBody.innerHTML = '';
  }

  makeTableRows(projMob, tableBody);
  tableElement.classList.remove('hide');
  hideBtn.classList.remove('hide');
}

function closeProjMobTable() {
	const tableElement = document.getElementById('showProjMob');
	const hideBtn = document.getElementById('hideMobBtn');
	tableElement.classList.add('hide');
	hideBtn.classList.add('hide');
}

// fetches popular worlds (having query)
async function viewHaving() {
	const tableElement = document.getElementById('having');
    const tableBody = document.getElementById('tbodyHaving');

	// hide table
    if (isShowHaving) {
        tableElement.classList.add("hide");
        document.getElementById("havBtn").innerHTML = 'View Popular Worlds';

    //fetch and show table
    } else {
        document.getElementById("havBtn").innerHTML = 'Hide Popular Worlds';

        const response = await fetch('/havingSaved', {
            method: 'GET'
        });

        const responseData = await response.json();
        const acByAll = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        makeTableRows(acByAll, tableBody);
        tableElement.classList.remove("hide");
    }

    isShowHaving = !isShowHaving;
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    document.getElementById("viewPlayersTable").addEventListener("click", fetchAndDisplayPlayers);
    document.getElementById("insertPlayer").addEventListener("submit", insertPlayer);
    document.getElementById("updatePlayerEmail").addEventListener("submit", updatePlayerEmail);
    document.getElementById("divAchievementBtn").addEventListener("click", viewAcByAll);
    document.getElementById("formProjMob").addEventListener("submit", projMob);
    document.getElementById('hideMobBtn').addEventListener("click", closeProjMobTable);
    document.getElementById("delPlayer").addEventListener("submit", deletePlayer);
    document.getElementById("havBtn").addEventListener("click", viewHaving);
};

// General function to refresh the displayed table data.
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayPlayers();
}
