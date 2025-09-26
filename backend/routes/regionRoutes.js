const express = require('express');
const router = express.Router();
const Region = require('../models/Region');
const regionController = require('../controllers/regionController');

router.get('/', regionController.getAllRegions);
router.post('/', regionController.addRegion);
router.delete('/:id', regionController.deleteRegion);

module.exports = router;
