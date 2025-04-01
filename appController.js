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

// show PlayerHas table
router.get('/viewPlayerHas', async (req, res) => {
    const tableContent = await appService.viewPlayerHas();
    res.json({data: tableContent});
});

// for division on Achievement
router.get('/divAchievement', async (req, res) => {
    const tableContent = await appService.divAchievement();
    res.json({data: tableContent});
});

router.post('/updatePlayer', async (req, res) => {
    const { username, xp, email } = req.body;
    const result = await appService.updatePlayer(username, xp, email);
    res.json({ message: result.message });
});

// for projection on Mob1
router.get("/projMob", async (req, res) => {
    const params = req.query.atts;
    const tableContent = await appService.projMob(params);
    res.json({ data: tableContent });
});


module.exports = router;