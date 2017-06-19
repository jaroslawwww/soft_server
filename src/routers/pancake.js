const express = require('express');
const bodyParser = require('body-parser');
const accessController = require('../middleware/access-controller.js');

const pancakeModel = require('../model/pancake.js');
const router = express.Router();
const linebot = require('linebot');
router.use(bodyParser.json());
router.use(accessController);

var bot = linebot({
	channelId: "1515127136",
	channelSecret: "9de755f353567c29dd87da5ae957af2b",
	channelAccessToken: "zRRdvGSLBfKnoJ3ca00C0DgUPvQq3JV8WPHhZk+fxUrjJ9SQ8r7dT2rEf+I3Gb2eca56S7IIwLJPGS+OjgpSkUw1iOgxXALBrZ8wUBJWnkIj4UMNgcRXjyC1TZPAArEk7Cidunvz8UCHnX8hHLiuRwdB04t89/1O/w1cDnyilFU="
});

router.post('/orders', function(req, res, next) {
    const {name, email, phone ,time, products, message, total_price} = req.body;
    console.log(req.body);
    if (!name || !email || !phone || !time || !products) {
        const err = new Error('Your profiles are required to offer an order');
        err.status = 400;
        throw err;
    }
    bot.push('U1ef817118f77297ebd80888a16998044', message);

    pancakeModel.create(name, email, phone, time, products, total_price).then(pancake =>{
        res.json(pancake);
    }).catch(next);
});

router.post('/user', function(req, res, next) {
			const {userid, name, email} = req.body;
			console.log(req.body);
			if(!userid || !name || !email){
				const err = new Error('Your profiles are required to offer an order');
        err.status = 400;
        throw err;
			}
			pancakeModel.createUser(userid, name, email).then(pancakeUser => {
					res.json(pancakeUser);
			}).catch(next);
});

router.post('/record', function(req, res, next){
		const {userid, name, email} = req.body;
		pancakeModel.listOrder(userid, name, email).then(orders =>{
				console.log(JSON.stringify(orders));
				res.json(orders);
		}).catch(next);
});

module.exports = router;
