import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';

var bookString;
var searchBookMessage;
var borrowBookMessage;
var globalBook;
var globalBorrowBook;
var globalCategory;
var showBorrowBook = "";

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('libraryDb');
var listCategory = [];

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");

});

// db.each("SELECT author, book, category, borrowBook FROM user", function(err, row) {
	// console.log("Author: "+ row.author," Book: " + row.book," Category: " + row.category, "Book borrowed: " + row.borrowBook);
	// console.log("Category: "+ row.category.toUpperCase());
// 	if (row.borrowBook == 1){
// 		console.log("borrowed book is ", row.author);
// 	}

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

function searchBookf(book){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  });
	console.log("book: ", book.toUpperCase());
	if(book !== ""){
		db.each("SELECT author FROM user", function(err, row) {
			var dbBook = row.author.toUpperCase();
			// if(globalBook.toUpperCase() === dbBook){
			if(dbBook.includes(book.toUpperCase())){
				searchBookMessage = `Found the book "${book}"! Do you want to borrow it?`;
				console.log("in function", searchBookMessage);
				console.log("TRUE in search function");
				
			}
		});
	}
}

function searchCategoryf(){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  });
	console.log("category: ", globalCategory.toUpperCase());
	bookString = `Books under the category ${globalCategory}: \n`;

	if(globalCategory !== ""){
		db.each("SELECT category, author FROM user", function(err, row) {
			var dbCategory = row.category.toUpperCase();
			if(dbCategory.includes(globalCategory.toUpperCase())){
				bookString += row.author + " / ";
				console.log(bookString);
			}
		});
	}
}

function borrowBookf(){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  });
	console.log("borrowBook: ", globalBorrowBook.toUpperCase());
	if(globalBorrowBook !== ""){
		db.each("SELECT author, borrowBook FROM user", function(err, row) {
			var dbBorrowBook = row.author.toUpperCase();
			if(dbBorrowBook.includes(globalBorrowBook.toUpperCase())){
				bookString = "TRUE in borrowBook";
				console.log(bookString);
				if(row.borrowBook === 0){
					db.serialize(function() {
						db.run(`UPDATE user SET borrowBook = 1 WHERE author = '${row.author}'` );
						console.log("updated");
					});
				}else{
					console.log("book is borrowed");
				}
			}
		});

	}
}

function showBorrowBookf(){
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS user (author TEXT, book TEXT, category TEXT, borrowBook INT)");
	  });

	db.each("SELECT category, author, borrowBook FROM user", function(err, row) {
			if(row.borrowBook === 1){
				showBorrowBook += row.author + "/";
			}
		});
	
	console.log("in function", showBorrowBook);
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
		const borrowBook = req.body.queryResult.parameters.borrowBook;

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
					bookString = "";
					searchCategoryf();
					console.log("bookString",bookString);
					res.json({"fulfillmentText" : bookString});
				break;
			case 'searchBook':
					searchBookf(searchBook);
					botMessage = `Searching book: ${searchBook}`;
					//... search book in db
					console.log("in searchBook ", searchBook);
					console.log("searchBookMessage searchBook:",searchBookMessage);
					if(searchBookMessage){	
						res.json({"fulfillmentText" : searchBookMessage});
					}
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
			case 'borrowBook':
					console.log("In borrowBook");
					botMessage = `In borrowBook! ${borrowBook}`;
					globalBorrowBook = borrowBook;
					bookString = "";
					borrowBookf();
					res.json({"fulfillmentText" : botMessage});
				break;
			case 'showBorrowBook':
					showBorrowBookf();
					console.log(showBorrowBook);
					res.json({"fulfillmentText" : showBorrowBook});
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

