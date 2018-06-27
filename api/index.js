import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';

var bookString;
var globalBook;
var globalCategory;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('libraryDb');
var listCategory = [];

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");

});

// db.each("SELECT author, book, category, borrowBook FROM user", function(err, row) {
// 	console.log("Author: "+ row.author," Book: " + row.book," Category: " + row.category, "Book borrowed: " + row.borrowBook);
// 	console.log("Category: "+ row.category.toUpperCase());
// 	listCategory = row.category;
// });



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

function searchBookf(){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  });
	console.log("book: ", globalBook.toUpperCase());

	if(globalBook !== ""){
		db.each("SELECT author FROM user", function(err, row) {
			var dbBook = row.author.toUpperCase();
			if(globalBook.toUpperCase() === dbBook){
				bookString = `Found the book "${globalBook}"! Do you want to borrow it?`;
				console.log(bookString);
			}else{
				bookString = "Seems the book you were looking for is unavailable.";
				console.log(bookString);
			}
		});
	}
}

function searchCategory(){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  });
	console.log("category: ", globalCategory.toUpperCase());
	bookString = `Books under the category ${globalCategory}: \n`;

	if(globalCategory !== ""){
		db.each("SELECT category, author FROM user", function(err, row) {
			var dbCategory = row.category.toUpperCase();
			if(dbCategory.includes(globalCategory.toUpperCase())){
				bookString = bookString + row.author + " / ";
				console.log(bookString);
			}
		});
	}
	

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
					globalCategory = bookCategory;
					searchCategory();
					console.log(bookString);
					res.json({"fulfillmentText" : bookString});
				break;
			case 'searchBook':
					botMessage = `Searching book: ${searchBook}`;
					//... search book in db
					console.log("in searchBook ", searchBook);
					globalBook = searchBook;
					searchBookf();	
					res.json({"fulfillmentText" : bookString});
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

