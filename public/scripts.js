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
let isShowGroupBy = false;
let isShowNestedAgg = false;

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

    makeTableRows(playersContent, tableBody);

}

function showHidePlayers() {
    const playerSection = document.getElementById('playerSection');

	if (isShowPlayers) {
		playerSection.classList.add('hide');
        document.getElementById("viewPlayersTable").innerHTML = 'View All Players';
	} else {
		document.getElementById("viewPlayersTable").innerHTML = 'Hide All Players';
		playerSection.classList.remove('hide');
		fetchAndDisplayPlayers();
	}
	isShowPlayers = !isShowPlayers;
}

// new insert function
async function insertPlayer(e) {
  e.preventDefault();

  const form = document.getElementById("insertPlayer");
  const formData = new FormData(form);

  const response = await fetch('/insert-player', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
  });

  const responseData = await response.json();
  const messageElement = document.getElementById('insertResultMsg');

  if (responseData.success) {
      messageElement.textContent = "Player inserted successfully!";
      fetchTableData();
  } else {
      messageElement.textContent = "Error inserting Player!";
  }

  form.reset();
}

async function updatePlayerEmailXp(e) {
  e.preventDefault();

  const form = document.getElementById("updatePlayerEmailXp");
  const formData = new FormData(form);
//
//    const usernameValue = document.getElementById('updateUsername').value;
//    const emailValue = document.getElementById('updateEmail').value;

  const response = await fetch('/update-player-email-xp', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
  });

  const responseData = await response.json();
  const messageElement = document.getElementById('updateEmailXpResultMsg');

  if (responseData.success) {
      messageElement.textContent = "Email and Xp updated successfully!";
      fetchTableData();
  } else {
      messageElement.textContent = "Error updating email and Xp!";
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

// for AGGREGATION BY GROUP BY of Achieve
async function viewGroupBy() {
    const tableElement = document.getElementById('groupBy');
    const tableBody = document.getElementById('tbodyGroupBy');

    // hide table
    if (isShowGroupBy) {
        tableElement.classList.add("hide");
        document.getElementById("groupBtn").innerHTML = 'View';

        //fetch and show table
    } else {
        document.getElementById("groupBtn").innerHTML = 'Hide';

        const response = await fetch('/groupByAchieve', {
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

    isShowGroupBy = !isShowGroupBy;
}

// for join Player and Achieve
async function joinPlayer(e) {
    e.preventDefault();

    const usernameValue = document.getElementById('joinUsername').value;
    const tableElement = document.getElementById('tableJoinTable');
    const tableBody = document.getElementById('tbodyJoinResult');

    const response = await fetch(`/join-player-achieve?username=${encodeURIComponent(usernameValue)}`, {
        method: 'GET'
    });
    const responseData = await response.json();
    const joinsContent = responseData.data;

    tableBody.innerHTML = '';

    joinsContent.forEach(row => {
        const newRow = tableBody.insertRow();
        row.forEach((cellVal) => {
            const cell = newRow.insertCell();
            cell.textContent = cellVal;
        });
    });

    tableElement.classList.remove('hide');
}

// for nested aggregation on Player and Achieve
async function nestedProgress() {
    const tableElement = document.getElementById('nestedAggTable');
    const tableBody = document.getElementById('tbodyNestAgg');

    if (isShowNestedAgg) {
        tableElement.classList.add('hide');
        document.getElementById("nestedAggBtn").innerHTML = 'View Average Progress';
    } else {
        document.getElementById("nestedAggBtn").innerHTML = 'Hide Average Progress';

        const response = await fetch('/nested-agg-avg', {
            method: 'GET'
        });
        const responseData = await response.json();
        const nestedContent = responseData.data;

        if (tableBody) tableBody.innerHTML = '';

        nestedContent.forEach(row => {
            const newRow = tableBody.insertRow();
            row.forEach((cellVal) => {
                const cell = newRow.insertCell();
                cell.textContent = cellVal;
            });
        });
        tableElement.classList.remove('hide');
    }
    isShowNestedAgg = !isShowNestedAgg;
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    document.getElementById("viewPlayersTable").addEventListener("click", showHidePlayers);
    document.getElementById("insertPlayer").addEventListener("submit", insertPlayer);
    document.getElementById("updatePlayerEmailXp").addEventListener("submit", updatePlayerEmailXp);
    document.getElementById("divAchievementBtn").addEventListener("click", viewAcByAll);
    document.getElementById("formProjMob").addEventListener("submit", projMob);
    document.getElementById('hideMobBtn').addEventListener("click", closeProjMobTable);
    document.getElementById("delPlayer").addEventListener("submit", deletePlayer);
    document.getElementById("havBtn").addEventListener("click", viewHaving);
    document.getElementById('joinPlayerAndAchieve').addEventListener("submit", joinPlayer);
    document.getElementById("groupBtn").addEventListener("click", viewGroupBy);
    document.getElementById('nestedAggBtn').addEventListener("click", nestedProgress);
};

// General function to refresh the displayed table data.
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayPlayers();
}
