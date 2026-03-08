const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const isAuth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/public/stats', complaintController.getPublicStats); // Public route
router.post('/', isAuth, upload.single('image'), complaintController.createComplaint);
router.get('/', isAuth, complaintController.getComplaints);
router.patch('/:id/status', isAuth, complaintController.updateStatus); // Admin mainly
router.delete('/:id', isAuth, complaintController.deleteComplaint); // Admin

module.exports = router;
