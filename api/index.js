import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';


var mysql = require('mysql');
const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "root",
	database: "mydb"
  });

// con.connect(function(err) {
// 	if (err) throw err;
// 	console.log("Connected!");

// 	if (err) throw err;
// 	con.query("SELECT author FROM user", function (err, result, fields) {
// 	if (err) throw err;
// 	console.log(result);
// 	});
// });

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
		let botMessage = "";

		console.log(action);

		switch(action){

			case 'Category':
					con.connect(function(err) {
						console.log("Connected!");
						console.log("err ", err);
						console.log("category: ", bookCategory);
						con.query(`SELECT book, author, category FROM user WHERE category LIKE '%${bookCategory}%'`, function (err, result, fields) {
						if(err){
							console.log(err);
						}
						console.log(result.length);
						if(result.length > 0){
							for(var i = 0; i < Math.floor(result.length/2);i++){
								botMessage += `Book Title: "${result[i].book}" \nAuthor: "${result[i].author}"\n\n`
							}
							// botMessage = result[0].book;
							console.log(result);
							console.log("botMessage: ", botMessage);
							res.json({"fulfillmentText" : botMessage});
						}else{
							res.json({"fulfillmentText" : "The category you were looking for is not available. :("});
						}
					});
				});
				break;

			case 'searchBook':
					con.connect(function(err) {
						console.log("Connected!");
						con.query(`SELECT book, author FROM user WHERE book LIKE '%${searchBook}%'`, function (err, result, fields) {
						if(err){
							console.log(err);
						}
						console.log("result.length: ", result.length);
						
						if(result.length > 0){
							for(var i = 0; i < result.length;i++){
								botMessage += `Book Title: "${result[i].book}" \nAuthor: "${result[i].author}"\n\n`
							}
							// botMessage = result[0].book;
							console.log(result);
							console.log("botMessage: ", botMessage);
							res.json({"fulfillmentText" : botMessage});
						}else{
							res.json({"fulfillmentText" : "The book you were looking for is not available. :("});
						}
					});
				});
					
				break;
			case 'getAuthor':
					//... search author
					con.connect(function(err) {
						console.log("Connected!");
						con.query(`SELECT book, author FROM user WHERE author LIKE '%${getAuthor[0]}%'`, function (err, result, fields) {
						if(err){
							console.log(err);
						}
						console.log("result.length: ", result.length);
						
						if(result.length > 0){
							for(var i = 0; i < result.length;i++){
								botMessage += `Found author "${result[i].author}" with the book "${result[i].book}"\n\n`
							}
							// botMessage = result[0].book;
							console.log(result);
							console.log("botMessage: ", botMessage);
							res.json({"fulfillmentText" : botMessage});
						}else{
							res.json({"fulfillmentText" : "The author you were looking for is not available. :("});
						}
					});
				});
				break;
			case 'addBook':
					botMessage = `adding book, Title: ${addBook}, Category: ${bookCategory}, author: ${addAuthor}.`
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
					res.json({"fulfillmentText" : botMessage});
				break;
			case 'showBorrowBook':
					console.log(showBorrowBook);
					res.json({"fulfillmentText" : "in showBookBook"});
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

