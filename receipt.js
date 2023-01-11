const uuid = require('uuid')
const moment = require('moment')

class Receipt{
    constructor(receiptObj){
        this.id = uuid.v4()
        this.retailer = receiptObj.retailer
        this.purchaseDate = receiptObj.purchaseDate
        this.purchaseTime = receiptObj.purchaseTime
        this.items = receiptObj.items
        this.total = receiptObj.total
        this.totalPoints = this.extractRetailer() +  this.extractPurchaseDate() + this.extractPurchaseTime() 
                           + this.extractTotal() + this.extractItem()
    }


    extractRetailer(){
        return this.retailer.replace(/[^a-z0-9]/gi, '').length
    }

    extractPurchaseDate(){
        let date = parseInt(moment(this.purchaseDate, "YYYY-MM-DD").format("D"))
        if (date % 2 != 0){
            return 6
        }
        return 0
    }

    extractPurchaseTime(){
        let hour = parseInt(moment(this.purchaseTime, "HH:mm").format("HH"))
        if (hour >= 14 && hour <= 16){
            return 10
        }
        return 0
    }

    extractTotal(){
        let lastTwoChars = this.total[this.total.length-2] + this.total[this.total.length-1]
        if (lastTwoChars == "00"){
            return 75
        }
        else if (lastTwoChars == "25" || lastTwoChars == "50" ||  lastTwoChars == "75" ){
            return 25
        }
        return 0
    }

    extractItem(){
        var total = (Math.floor(this.items.length / 2) * 5)
        this.items.forEach(element => {
            if (element.shortDescription.trim().replace(/\s\s+/g, ' ').length % 3 == 0){
				total += Math.ceil(element.price * 0.2)
			}
        });
        return total
    }

}

module.exports = Receipt