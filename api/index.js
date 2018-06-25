import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';

let testString;
let test = [];
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('libraryDb');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");

//   var stmt = db.prepare("INSERT INTO user VALUES (?,?,?,?)");
//   for (var i = 0; i < 10; i++) {
  
//   var d = new Date();
//   var n = d.toLocaleTimeString();
//   var x = "book title";
//   var y = "category"
//   stmt.run(i, n, x, y);
//   }
//   stmt.finalize();

//   db.each("SELECT id, author, book, category FROM user", function(err, row) {
// 	  console.log("User id : "+row.id, row.author, row.book, row.category);
//   });
});

db.each("SELECT author, book, category, borrowBook FROM user", function(err, row) {
	console.log("Author: "+ row.author," Book: " + row.book," Category: " + row.category);
});

// db.close();

function insertData(bookTitle, bookCategory, bookAuthor){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  
	    var stmt = db.prepare("INSERT INTO user VALUES (?,?,?,?)");
	    stmt.run(bookAuthor, bookTitle, bookCategory, 0);  
	    stmt.finalize();
	  
	    db.each("SELECT author, book, category, borrowBook FROM user", function(err, row) {
			console.log("Author: "+ row.author," Book: " + row.book," Category: " + row.category, "Borrowed Book: " + row.borrowBook);
		});
	  });
}

function searchData(book){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  });
	
	  db.each("SELECT book FROM user", function(err, row) {
		  console.log(" Book: " + row.book);
		  testString += row.book+" / ";
	  });
}

  

let bodyParser = require('body-parser');

export default ({ config, db }) => {
	let api = Router();
	api.use(bodyParser.urlencoded());
	api.use(bodyParser.json());

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root

	api.post('/post', (req, res) => {
		const action = req.body.queryResult.action;
		const searchBook = req.body.queryResult.parameters.searchBook;
		const bookCategory = req.body.queryResult.parameters.bookCategory;
		const getAuthor = req.body.queryResult.parameters.getAuthor;
		const bookTitle = req.body.queryResult.parameters.bookTitle;

		const addBook = req.body.queryResult.parameters.addBook;
		const addAuthor = req.body.queryResult.parameters.addAuthor;
		let botMessage;
		let ctr = 0;

		console.log(action);

		switch(action){

			case 'Category':
					botMessage = `Searching category of ${bookCategory}`;
					//... search available category
					res.json({"fulfillmentText" : botMessage});
				break;
			case 'searchBook':
					botMessage = `Searching book: ${searchBook}`;
					//... search book in db
					searchData(searchBook);
					console.log("in searchBook");
					res.json({"fulfillmentText" : testString.replace("undefined","")});
				break;
			case 'getAuthor':
					botMessage = `Looking for author ${getAuthor[0]}`;
					//... search author
					res.json({"fulfillmentText" : botMessage});		
				break;
			case 'addBook':
					botMessage = `adding book, Title: ${addBook}, Category: ${bookCategory}, author: ${addAuthor}.`
					insertData(addBook,bookCategory,addAuthor);
					res.json({"fulfillmentText" : botMessage});
				break;
			case 'getBookTitle':
					botMessage = `getting book: ${bookTitle}`;
					if(bookCategory === '' && getAuthor === ''){
						//do something for booktitle
					}else if(bookCategory === ''){
						//do something for booktitle and author
					}else if(getAuthor === ''){
						//do something for booktitle and book category
					}else{
						//do something
					}
					res.json({"fulfillmentText" : botMessage});
				break;	

		}

		
	});

	api.get('/', (req, res) => {
		const data = req.body;
		console.log(data);
		return res.json({data});
	});

	return api;	
}
