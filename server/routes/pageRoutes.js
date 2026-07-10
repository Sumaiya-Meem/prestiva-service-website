const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pageController');
const adminAuth = require('../middleware/adminAuth');

router.get('/nav', ctrl.listNav);              // public: in-nav published pages
router.get('/slug/:slug', ctrl.getBySlug);    // public: one published page
router.get('/', adminAuth, ctrl.listAll);      // admin: all pages
router.post('/', adminAuth, ctrl.create);      // admin: create
router.put('/:id', adminAuth, ctrl.update);    // admin: update
router.delete('/:id', adminAuth, ctrl.remove); // admin: delete

module.exports = router;
