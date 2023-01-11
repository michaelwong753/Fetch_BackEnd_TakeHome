const express = require('express')
const bodyParser = require('body-parser');
const moment = require('moment')
const Receipt = require('./receipt')
const app = express()
const port = 3000

const receiptSchema = new Set(["retailer","purchaseDate","purchaseTime","items","total","shortDescription","price"])
var database = {}

function isValueValid(key,val){
	if (!receiptSchema.has(key)) return false
	else if (key == "retailer" || key == "shortDescription") return (val.length > 0)
	else if (key == "total" || key == "price") return /^\d+\.\d{2}$/.test(val)
	else if (key == "purchaseTime") return moment(val, "HH:mm", true).isValid()
	else if (key == "purchaseDate") return moment(val, "YYYY-MM-DD", true).isValid()
	else if (key == "items"){
		if (val.length < 1) return false
		for (var i = 0; i < val.length; i++){
			for (item in val[i]){
				if (!isValueValid(item,val[i][item])) return false
			} 
		}
		return true
	}
	return false
}

// support parsing of application/json type post data
app.use(bodyParser.json())

app.post('/receipts/process', (req,res) =>{
	var jsonReceipt = req.body
	for (var key in jsonReceipt){
		if (!isValueValid(key,jsonReceipt[key])){
			res.status(400).send("The receipt is invalid")
			return
		}
	}
	var receipt = new Receipt(jsonReceipt)
	database[receipt.id] = receipt
	res.send({"id": receipt.id})
})


app.get('/receipt/:id/points', (req,res) =>{
	var id = req.params.id
	if (database[id] == undefined){
		res.status(404).send("No receipt found for that id")
		return
	}
	res.send({"points":database[id].totalPoints})
})

app.listen(port, () => {
	console.log("Listening on port 3000")
})


