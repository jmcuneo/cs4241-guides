# MongoDB

## Relational databases vs NoSQL databases
  - Relational databases require *schemas*, knowing in advance what types of data will be stored and how each type relates to each other type.
  - NoSQL (or non-relational) does not require a schema. Documents can be arbitrarily added to the database, making the database easier to scale in many situations
  - Relational databases are typically preferred for situations where requirements are known ahead of time and you have to guarantee maximum data integrity. NoSQL is typically preferred for databases that require replication across clusters and flexibility.

## MEAN / MERN stack
  - Mongo / Express / Angular / Node vs Mongo / Express / React / Node
  - A little bit disingenuous, as Angular is much more opinionated than React is... they are not really drop-in replacements for each other.
  - Good to know for jobs!
  
## MongoDB vs CouchDB

  - CouchDB is another common NoSQL database.
  - CouchDB uses *views* that can be easily called. Basically, you should know what you're going to be asking for ahead of time, so that these fetches can be optimized. In MongoDB you can create database queries on-the-fly.
    - Newer versions of CouchDB provide dynamic querying
  - CouchDB uses REST/HTTP protocols for communication, while MongoDB uses binary data communication, which is faster.
  - CouchDB provides more powerful replication, making it great for CDNs, client/server synchronization, etc.
  - Both uses JSON for storage (although in Mongo the documents are converted to/from binary).

## Setting up a free MongoDB account
  - Most hosting services (like Render, Heroku, etc.) do not provide a running MongoDB database. You have to provide an external DB.
    - Some VM providers (like DigitalOcean) will give you MongoDB in addition to Node
  - We'll use [MongoDB](https://www.mongodb.com/) to get a free database cluster (with backup redundancy) on a cloud provider
    - Your choice of AWS, Google Cloud Platform, or Microsoft Azure, but MongoDB Atlas abstracts the differences away.
  - After you create your account, you need to complete five steps before accessing your database from Node:
    1. Define a cluster
    2. Define account(s) to access your cluster
       - `Security > Database Access`
    3. Define which IP addresses can access your cluster (whitelist)
      - `Security > Network Access`
      - Use `0.0.0.0` to whitelist all connections, which is fine for this class
      - If you have a static IP address for your Node.js server, you would normally want to enter that here.
    4. Make a database
      - `Clusters > Browse Collections > Create Database`
    5. Get the correct URL to access your database
      - We'll need to store this URL along with authentication in a `.env` file in Render
      - You can find the connection information at `Clusters > Connect > Drivers` 
    6. (optional) We can also initialize our data using the Atlas web API

## Using the MongoDB core driver
  - There are two main ways to use MongoDB:
    1. [The MongoDB Node.js driver](https://github.com/mongodb/node-mongodb-native)
    2. [Mongoose](https://mongoosejs.com)
  - Mongoose provides schemas / validation, while MongoDB is more flexible (no schema required). We'll use the MongoDB node.js driver for this example.
  - In your project, create a simple `.env` file to hold your authentication data. *MAKE SURE TO PUT THE HOST VALUE IN QUOTATION MARKS*:

```
USERNM=xxxxx
PASS=xxxxx
HOST="cluster0-xxxxxxxx.mongodb.net"
```

  You can also use the [dotenv library](https://www.npmjs.com/package/dotenv).
  - You can get all of the above information by going to Clusters > Connect > Drivers
  - Take a look at the [Collection API](https://mongodb.github.io/node-mongodb-native/6.19/classes/Collection.html) to get a feel for what is possible.

The Atlas system uses MongoDB 6.x by default, which [requires us to use at least version 16 of Node.js](https://www.mongodb.com/docs/drivers/node/current/compatibility/). We can change our Node version by adding the following field to `package.json`:

```json
  "engines": {
    "node": "16.x"
  },
```

Make sure to only include the final comma in the above example if you are putting this somewhere in the middle of your package.json file (in which case there is more information to come); otherwise you should omit it.
  
### Basic connection:
Make sure to replace `XXXtest` and `XXXtodos` with the name of your database and collection respectively.

```js
const express = require("express"),
      { MongoClient, ObjectId } = require("mongodb"),
      app = express()

app.use(express.static("public") )
app.use(express.json() )

const uri = `mongodb+srv://${process.env.USERNM}:${process.env.PASS}@${process.env.HOST}`
const client = new MongoClient( uri )

let collection = null

async function run() {
    await client.connect()
    collection = await client.db("datatest").collection("test")

    // route to get all docs
    app.get("/docs", async (req, res) => {
        if (collection !== null) {
            const docs = await collection.find({}).toArray()
            res.json( docs )
        }
    })
}

run()

app.listen(3000)
```

### Add middleware to check connection

```js
app.use( (req,res,next) => {
    if( collection !== null ) {
        next()
    } else {
        res.status( 503 ).send()
    }
})
````

### Add a route to insert a todo

```js
app.post( '/add', async (req,res) => {
    const result = await collection.insertOne( req.body )
    res.json( result )
})
```

Note that the value returned from this includes a unique ID we can use to reference the newly added object in the database. We'll use that to remove an object below.

### Add a route to remove a todo
All documents get a unique id, and we'll use that as the key to remove a particular document. However, we need to wrap the id value using the `mongodb.ObjectID()` function in order to correctly find it. We can also use [query operators](https://docs.mongodb.com/manual/reference/operator/query/#query-selectors) to find particular documents for removal that match specified conditions.

```js
// assumes req.body takes form { _id:5d91fb30f3f81b282d7be0dd } etc.
app.post( '/remove', async (req,res) => {
    const result = await collection.deleteOne({ 
        _id:new ObjectId( req.body._id ) 
    })
  
    res.json( result )
})
```

### Add a route to update a document
We can use the [update operators](http://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html) to apply a variety of transformations to a document:

```js
app.post( '/update', async (req,res) => {
    const result = await collection.updateOne(
        { _id: new ObjectId( req.body._id ) },
        { $set:{ name:req.body.name } }
    )

    res.json( result )
})
```
