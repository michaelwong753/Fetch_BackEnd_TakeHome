# Fetch_BackEnd_TakeHome
Author: Michael Wong

# How to Install
Build Docker Image
```
docker build . -t your_username/node-web-app
```

Run Docker (please clear all program running on port 3000 first)
```
docker run --publish 3000:3000 your_username/node-web-app
```

# Design Consideration
- In POST method, we will ignore all key-value pair in JSON that does not belong to the required schema specified in the docs. For example
```
{
  "retailer": "M&M Corner Market",
  "purchaseDate": "2022-03-20",
  "purchaseTime": "14:33",
  "location": "California",
  "items": [
    {
      "shortDescription": "Gatorade",
      "price": "2.25"
    }
  ],
  "total": "9.00"
}
```
**"location": "California"** will be ignored as it is not part of the schema, and no error will be returned. This is to make sure that any accidental changes from the Front-End won't cause an error.

- Ordering of the JSON key-value pair does not matter (e.g "items" can come first before "retailer")
- PurchaseDate follows YYYY-MM-DD pattern 
- PurchaseTime follows HH:mm pattern
