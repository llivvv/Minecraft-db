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

// fetches data from PlayerHas and displays it
async function viewAllPlayers() {
    const sectionElement = document.getElementById('playerSection');
    const tableBody = document.getElementById('tbodyAllPlayers');

	// hide table
    if (isShowPlayers) {
        sectionElement.classList.add("hide");
        document.getElementById("viewAllPlayersBtn").innerHTML = 'View All Players';
    } else {
        document.getElementById("viewAllPlayersBtn").innerHTML = 'Hide All Players';

        const response = await fetch('/viewPlayerHas', { method: 'GET' });
        const responseData = await response.json();
        const allPlayersContent = responseData.data;

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        makeTableRows(allPlayersContent, tableBody);
        sectionElement.classList.remove("hide");
    }

    isShowPlayers = !isShowPlayers;
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

async function updatePlayer() {
    const username = document.getElementById('updateUsername');
    const xp = document.getElementById('updateXp');
    const email = document.getElementById('updateEmail');

    const response = await fetch('/updatePlayer', {
        method: 'POST'
    });

    const responseData = await response.json();
    viewAllPlayers();
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


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    document.getElementById("viewAllPlayersBtn").addEventListener("click", viewAllPlayers);
    document.getElementById("divAchievementBtn").addEventListener("click", viewAcByAll);
    document.getElementById("updatePlayer").addEventListener("submit", updatePlayer);
    document.getElementById("formProjMob").addEventListener("submit", projMob);
    document.getElementById('hideMobBtn').addEventListener("click", closeProjMobTable);
};

// General function to refresh the displayed table data.
// You can invoke this after any table-modifying operation to keep consistency.
//function fetchTableData() {
//    fetchAndDisplayUsers();
//}
