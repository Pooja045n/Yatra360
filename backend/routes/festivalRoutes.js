const express = require('express');
const router = express.Router();
const festivalController = require('../controllers/festivalController');

router.get('/', festivalController.getAllFestivals);
router.post('/', festivalController.addFestival);
router.put('/:id', festivalController.updateFestival);
router.delete('/:id', festivalController.deleteFestival);

module.exports = router;
