process.env.NODE_ENV = 'test';
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var Receipt = require('../receipt');
var fs  = require('fs')
var path = require('path')
var should = chai.should();

chai.use(chaiHttp);

describe('API Request Test', () => {
  describe('/POST receipt', () => {  
        it('it SHOULD NOT accept a receipt with wrong value for "total"', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/wrongTotal.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.eql("The receipt is invalid");
                done();
            });
        });

        it('it SHOULD NOT accept a receipt with wrong value for "purchaseDate"', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/wrongDate.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.eql("The receipt is invalid");
                done();
            });
        });

        it('it SHOULD NOT accept a receipt with wrong value for "purchaseTime"', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/wrongTime.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.eql("The receipt is invalid");
                done();
            });
        });

        it('it SHOULD NOT accept a receipt with 0 item', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/noItem.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.eql("The receipt is invalid");
                done();
            });
        });

        it('it SHOULD NOT accept a receipt with incomplete required fields', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/incompleteField.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.eql("The receipt is invalid");
                done();
            });
        });

        it('it SHOULD accept a receipt with ordered required fields', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/completeField.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                done();
            });
        });

        it('it SHOULD accept a receipt with unordered required fields', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/completeFieldUnordered.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                done();
            });
        });

    });

    describe('/GET receipt', () => {  
        it('it SHOULD NOT accept an invalid id', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/point28.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                chai.request(server)
                .get('/receipt/123456/points')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.text.should.eql("No receipt found for that id");
                });
                done();
            });
        });

        it('it SHOULD extract 28 points from the receipt', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/point28.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                chai.request(server)
                .get('/receipt/' + res.body.id + '/points')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('points').eql(28);
                });
                done();
            });
        });

        it('it SHOULD extract 109 points from the receipt', (done) => {
            var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/point109.json')));
            chai.request(server)
            .post('/receipts/process')
            .send(data)
            .end((err, res) => {
                chai.request(server)
                .get('/receipt/' + res.body.id + '/points')
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('points').eql(109);
                });
                done();
            });
        });
    });
});

describe('Function Test', () => {
    var receipt_one;
    var receipt_two;

    before(function () {
        receipt_one = new Receipt(JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/point28.json'))))
        receipt_two = new Receipt(JSON.parse(fs.readFileSync(path.resolve(__dirname, './testData/point109.json'))))
    });
    
    it('it SHOULD ignore non-alphanumeric character in retailer and return 14 points', (done) => {
        receipt_two.extractRetailer().should.eql(14)  
        done()
    });

    it('it SHOULD return 6 points if purchase date is odd', (done) => {
        receipt_one.extractPurchaseDate().should.eql(6)  
        done()
    });

    it('it SHOULD return 0 points if purchase date is even', (done) => {
        receipt_two.extractPurchaseDate().should.eql(0)  
        done()
    });

    it('it SHOULD return 10 points if purchase time is between 2:00pm and 4:00pm', (done) => {
        receipt_two.extractPurchaseTime().should.eql(10)  
        done()
    });

    it('it SHOULD return 0 points if purchase time is not between 2:00pm and 4:00pm', (done) => {
        receipt_one.extractPurchaseTime().should.eql(0)  
        done()
    });

    it('it SHOULD return 75 points if total is a round dollar & multiple of 0.25', (done) => {
        receipt_two.extractTotal().should.eql(75)  
        done()
    });

    it('it SHOULD return 75 points if total is not a round dollar & not multiple of 0.25', (done) => {
        receipt_one.extractTotal().should.eql(0)  
        done()
    });

    it('it SHOULD return 16 points if there is a total of 4 items with 2 items having len(short description) % 3 & price = 2.4', (done) => {
        receipt_one.extractItem().should.eql(16)  
        done()
    });

});