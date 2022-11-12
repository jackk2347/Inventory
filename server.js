//Port
const port = 8099;
//html 
const html = require('html');
const url = require('url');
const assert = require('assert');
//File
const fs = require('fs');
const formidable = require('express-formidable');
//MongoDB
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


const mongourl = 'mongodb+srv://Jack:Jack2347@cluster0.elkxcg8.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'test';
//express
const express = require('express');
const app = express();

const session = require('cookie-session'); // the session
const bodyParser = require('body-parser'); // the bodyparser
const { Buffer } = require('safe-buffer');

//Main Body
app.set('view engine', 'ejs');
app.use(formidable());

// Middleware
// set the static file: css
app.use(express.static('public/css'));
app.use(bodyParser.json());
//Cookie 
app.use(session({
    name: 'session',
    keys: ['th1s1stheSerrectykey']
}));

// Set the user
var users = new Array({ userid: "demo", password: "" });
var DOCS = {};



////////////////////////////////Handle Session ////////////////////////////////////////////////////

//Handle find
const handle_Find = (req, res, standard) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected the Mongodb successfully !!");
        const db = client.db(dbName);
        //callback()
        findDocument(db, {}, (docs) => {
            client.close();
            console.log("Mongodb connection is closed");
            res.status(200).render('home', { userid: `${req.session.userid}`, inventory_length: docs.length, inventory: docs });
        })
    })
}





// Handle the Delete 
const handle_Deletes = (res, standard) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        console.log("Connected the mogodb server successfully");
        const db = client.db(dbName);

        let finddocid = {};
        finddocid['_id'] = ObjectID(standard._id);
        finddocid['owner'] = standard.owner;
        deleteDocument(db, finddocid, (results) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', { message: "Document is deleted ." });
        })
    });
    client.close();
    res.status(200).render('info', { message: "Document is deleted ." });
}


// show detail

const Show_Detail = (res, standard) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected to the MongoDb server !!");
        const db = client.db(dbName);

        let finddocid = {};
        finddocid['_id'] = ObjectID(standard._id);
        findDocument(db, finddocid, (docs) => {
            client.close();
            console.log("The MongoDB connection is closed !!");
            res.status(200).render('detail', { inventory: docs[0] });
        })
    })
}


////////////////////////////////End handleSession //////////////////////////////////////////


///////////////////////////////Create/Edit/Update/Delete document session //////////////////////////////////////
//find document with standard
const findDocument = (db, standard, callback) => {
    let cursor = db.collection('inventory').find(standard);
    console.log(`findDocument : ${JSON.stringify(standard)}`);
    cursor.toArray((err, docs) => {
        assert.equal(err, null);
        console.log(`findDocument : ${ docs.length }`);
        callback(docs);
    })
}





//create new inventory documents
const createDocument = (db, createDOCS, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected to the Database server.");
        const db = client.db(dbName);

        db.collection('inventory').insertOne(createDOCS, (err, results) => {
            if (err) throw err;
            console.log(results);
            callback();
        });
    });
}

// update Document 
const updateDocument = (standard, updateDocs, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected the mongodb successfully ")
        const db = client.db(dbName);

        db.collection('inventory').updateOne(standard, {
                $set: updateDocs
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}


// delete the document
const deleteDocument = (db, standard, callback) => {
        db.collection('inventory').deleteOne(
            standard,
            (err, results) => {
                assert.equal(err, null);
                console.log(results);
                callback();
            }
        )
    }
    /////////////////////////////////////////End Create/Edit/Update/Delete document session //////////////////////////////////////////////

////////////////////////////////////////////Restful API session ///////////////////////////////////////////////////////////

//use the inventory name to find the document and parse it to json value
app.get('/api/inventory/name/:name', (req, res) => {
    console.log(`Use the Rest API`);
    console.log("the name : " + req.params.name);
    if (req.params.name) {
        let standard = {};
        standard['name'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to mongodb successfully");
            const db = client.db(dbName);

            findDocument(db, standard, (doc) => {
                client.close();
                console.log("Closed the mongodb connection");
                res.status(200).json(doc);
            });
        });
    } else {
        res.status(500).json({ "error": "missing name" });
    }
})

//use the inventory type to find the document and parse it to json value
app.get('/api/inventory/type/:type', (req, res) => {
    console.log(`Use the Rest API`);
    console.log("the type" + req.params.type);
    if (req.params.type) {
        let standard = {};
        standard['type'] = req.params.type;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to mongodb successfully");
            const db = client.db(dbName);

            findDocument(db, standard, (doc) => {
                client.close();
                console.log("Closed the mongodb connection");
                res.status(200).json(doc);
            });
        });
    } else {
        res.status(500).json({ "error": "missing name" });
    }
})

app.get('/api/inventory/name/:name/type/:type', (req, res) => {
    console.log("Use Rest API");
    console.log("The name is " + req.params.name + "and type is" + req.params.type);
    if (req.params.name && req.params.type) {
        let standard = {};
        standard['name'] = req.params.name;
        standard['type'] = req.params.type;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected the Mongodb !!");
            const db = client.db(dbName);

            findDocument(db, standard, (doc) => {
                client.close();
                console.log("Close the mongodb");
                res.status(200).json(doc);
            })
        })
    } else {
        res.status(500).json({ "error": "missing name or type" })
    }
})

/////////////////////////////////////////End Restful API session //////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////Router session ///////////////////////////////////////////////////////////////////////
// set the different router
app.get('/', (req, res) => {
    if (!req.session.auth) {
        console.log('Please Authenticated first , directing to login page ');
        res.redirect('/login');
    }
    console.log(`${ req.session.userid } is welcome back `);
    handle_Find(req, res, {});
})

app.get('/login', (req, res) => {
    console.log('Welcom to login page');
    res.status(200).render("login");
});

app.post('/login', (req, res) => {
    console.log('Try to login');
    users.forEach((user) => {
        if (user.userid == req.fields.userid && user.password == req.fields.password) {
            req.session.auth = true;
            req.session.userid = req.fields.userid;
            res.status(200).redirect("/home");
        }
    });
    res.redirect("/");
})

app.get('/home', (req, res) => {
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    console.log(`${ req.session.userid }...Wecome to home page `);
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected the mongodb successfully !");
        const db = client.db(dbName);
        // callback * seach all document
        findDocument(db, {}, (docs) => {
            client.close();
            console.log('MongoDB is closed');
            res.status(200).render('home', { userid: `${req.session.userid}`, inventory_length: docs.length, inventory: docs });
        })
    })
})

app.get('/create', (req, res) => {
    console.log(req.session.auth);
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    console.log(`The user ${req.session.userid}  ready to create document`);
    res.status(200).render('create');
})

//Post to create new document 
app.post('/create', (req, res) => {
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    console.log(`The user ${req.session.userid} create a new document !!`);
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);

        // get the timestamp in second
        var timestamp = Math.floor(new Date().getTime() / 1000);
        //create a date with the timestamp
        var timestampDate = new Date(timestamp * 100);

        //create a new ObjectID with a specific timestamp
        var objectid = new ObjectID(timestamp);

        //insert the form value to DOCS
        console.log(`Start to puting data in to DOCS`);
        DOCS['_id'] = objectid;
        DOCS['inv_id'] = req.fields.inv_id;
        DOCS['name'] = req.fields.name;
        DOCS['type'] = req.fields.type;
        DOCS['quantity'] = req.fields.quantity;
        DOCS['owner'] = req.session.userid;
        console.log("putting the address data to AddDOCS");
        var AddDOCS = {};
        AddDOCS['building'] = req.fields.building;
        AddDOCS['country'] = req.fields.country;
        if (req.fields.latitude && req.fields.longitude) {
            AddDOCS['coord'] = [req.fields.latitude, req.fields.longitude];
        }
        AddDOCS['street'] = req.fields.street;
        AddDOCS['zipcode'] = req.fields.zipcode;
        DOCS['address'] = AddDOCS;
        console.log("End to insert the all data expect the photo");
        //End for insert the data 


        //Ready for insert the photo data and set the photo type , title and let the photo parse to base64 format 
        console.log("Ready for insert the photo data ");
        var photoDOC = {};
        if (req.files.photo && req.files.photo.size > 0 && (req.files.photo.type == 'image/jpeg' || req.files.photo.type == 'image/png')) {
            fs.readFile(req.files.photo.path, (err, data) => {
                assert.equal(err, null);
                photoDOC['title'] = req.fields.title;
                photoDOC['data'] = new Buffer.from(data).toString('base64');
                photoDOC['mimetype'] = req.files.photo.type;
            })
        }
        DOCS['photo'] = photoDOC;
        console.log(`End the insert the photo data `);

        if (DOCS.name && DOCS.owner) {
            console.log(` ${ req.session.userid } creating the document `);
            createDocument(db, DOCS, (docs) => {
                client.close();
                console.log("Closed the DB connection");
                res.status(200).render('info', { message: "Document created" });
            })
        } else {
            client.close;
            console.log("Closed the DB connection")
            res.status(200).render('info', { message: "Invalid entry - Name and Owner is " });
        }
    })
})

app.get('/detail', (req, res) => {
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    Show_Detail(res, req.query);
})

// show the doc information to user to edit
app.get('/edit', (req, res) => {
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    console.log(`${req.session.userid} ... Update page`);
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected the MongoDb successfully !");
        const db = client.db(dbName);

        let findDOCIDs = {};
        findDOCIDs['_id'] = ObjectID(req.query._id);

        findDocument(db, findDOCIDs, (docs) => {
            client.close();
            console.log("Close DB connection");
            console.log(docs[0]);
            res.status(200).render('edit', { inventory: docs[0] });
        })

    });
});

// Update the document information 
app.post('/update', (req, res) => {
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    updateDOCS = {}; // create the updatedocs
    console.log(`user ${req.session.userid} Update the information`);
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected the Mongodb successfully !!");
        console.log("Start to check the owner");
        console.log("req.fields.owner : " + req.fields.owner);
        console.log("req.session.userid" + req.session.userid);
        // idenfiy the owner 
        if (req.fields.owner == req.session.userid) {
            if (req.fields.name) { // if user set the data from from send
                updateDOCS['inv_id'] = req.fields.inv_id;
                updateDOCS['name'] = req.fields.name;
                updateDOCS['type'] = req.fields.type;
                updateDOCS['owner'] = `${req.session.userid}`;
                var Addressdoc = {};
                Addressdoc['building'] = req.fields.building;
                Addressdoc['country'] = req.fields.country;
                Addressdoc['street'] = req.fields.street;
                Addressdoc['zipcode'] = req.fields.zipcode;
                Addressdoc['coord'] = [req.fields.latitude, req.fields.longitude];
                updateDOCS['address'] = Addressdoc;

                //find the DOCID
                var Docid = {};
                Docid['_id'] = ObjectID(req.fields._id);
                console.log("req.files.photo.size" + req.files.photo.size);
                if (req.files.photo.size > 0) {
                    var photodoc = {}; // create the photo document
                    fs.readFile(req.files.photo.path, (err, data) => {
                        assert.equal(err, null);
                        photodoc['title'] = req.fields.title;
                        photodoc['data'] = new Buffer.from(data).toString('base64');
                        photodoc['mimetype'] = req.files.photo.type;
                    });
                    updateDOCS['photo'] = photodoc;
                    updateDocument(Docid, updateDOCS, (docs) => {
                        client.close();
                        console.log("The DB connection is Closed !!");
                        res.status(200).render('info', { message: "Update successfully !." });
                    });
                } else {
                    updateDocument(Docid, updateDOCS, (docs) => {
                        client.close();
                        console.log("The DB connection is Closed !!");
                        res.status(200).render('info', { message: "Update successfully !." });
                    });
                }
            } else {
                res.status(200).render('info', { message: "Invalid entry - Name is compulsory!" })
            }
        } else {
            res.status(200).render('info', { message: "Only the owner can update the page!" });
        }
    })
})


//Delete document 
app.get('/delete', (req, res) => {
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    console.log(req.query.owner);
    if (req.session.userid == req.query.owner) {
        console.log(`The owner ${req.session.id} want to delete document`);
        handle_Deletes(res, req.query);
    } else {
        res.status(200).render('info', { message: "Sorry , the owner is other . you cannot delete this" });
    }
})

app.get('/logout', (req, res) => {
    if (req.session.auth != true) {
        console.log(`Not auth want to check this page !!`);
        res.status(400).render('nullpath');
    }
    req.session = null;
    req.auth = false;
    res.redirect('/');
})

// other not define path 
app.get('/*', (req, res) => {
    res.status(404).render("nullpath", { path: ` ${ req.path } - Unkown request ` });
})

///////////////////////////////////End router session //////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || port, (err) => {
    if (err) console.log("Error in the server setup");
    console.log(`Server listening on Port ${port}`)
});