//router
const express = require('express');
const bodyParser = require('body-parser');
const accessController = require('../middleware/access-controller.js');

const todoModel = require('../model/todos.js');
const router = express.Router();

router.use(bodyParser.json());
router.use(accessController);

// List
router.get('/todos', function(req, res) {
  //console.log(req.query.unaccomplishedOnly.toString());
    todoModel.list(req.query.searchText, req.query.unaccomplishedOnly.toString(),req.query.start).then(todos => {
        res.json(todos);
    });
});

// Create
router.post('/todos', function(req, res) {
    const {mood, text} = req.body;
    if (!mood || !text) {
        const err = new Error('Mood and text are required');
        err.status = 400;
        throw err;
    }
    todoModel.create(mood, text).then(todo => {
        res.json(todo);
    });
});

// accomplished
router.post('/todos/:id', function(req, res) {
    const {id} = req.params;
    if (!id) {
        const err = new Error('Todo ID and accomplished are required');
        err.status = 400;
        throw err;
    }
    todoModel.accomplished(id).then(todo => {
        res.json(todo);
    });
});
module.exports = router;
