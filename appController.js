const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

// fetch Players table
router.get('/players', async (req, res) => {
    const tableContent = await appService.fetchPlayersFromDb();
    res.json({ data: tableContent });
});

router.post('/insertPlayer', async (req, res) => {
    const { username, user_credentials, xp, email, skin, iid } = req.body;
    const insertResult = await appService.insertPlayer(username, user_credentials, xp, email, skin, iid);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// for update on PlayerHas
router.post("/update-player-email", async (req, res) => {
    const { username, email } = req.body;
    const updateResult = await appService.updatePlayerTable(username, email);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// for delete on PlayerHas
router.post("/delete-player", async (req, res) => {
    const { username } = req.body;
    const deleteResult = await appService.deletePlayer(username);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// for division on Achievement
router.get('/divAchievement', async (req, res) => {
    const tableContent = await appService.divAchievement();
    res.json({data: tableContent});
});

// for projection on Mob1
router.get('/projMob', async (req, res) => {
    const params = req.query.atts;
    const tableContent = await appService.projMob(params);
    res.json({ data: tableContent });
});

// for having on Saved relation
router.get('/havingSaved', async (req, res) => {
    const tableContent = await appService.havingSaved();
    res.json({data: tableContent});
});

// for join on Player and Achieve
router.get('/join-player-achieve', async (req, res) => {
    const { username } = req.query;
    const updateResult = await appService.joinPlayerAchieve(username);
    res.json({ data: updateResult });
});


module.exports = router;
