const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;
var fs = require("fs");
const { Extractor } = require('@angular/compiler');

app.use(cors())

app.listen(port, function () {
  console.log(`CORS-enabled web server listening on port ${port}`)
})

function readJsonFileSync(filepath, encoding){
    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getData(file){
    var filepath = __dirname + '/' + file;
    return readJsonFileSync(filepath);
}

app.get('/browse', (req, res) =>{
  let data = [];
  data = getData('mock_data.json'); //file that was given
  let queryParams = req.query;
  let searchQuery = queryParams.searchQuery?queryParams.searchQuery:undefined;
  if(searchQuery){
    if(!(searchQuery.startsWith("\"") && searchQuery.endsWith("\""))){       //checking for partial match condition
      searchQuery = searchQuery.substr(1, searchQuery.length - 2 ).replace(" ",".*");      //replacing space by any character for partial match
    }
    data = data.filter( item => new RegExp(searchQuery,'i').test(item.name) || new RegExp(searchQuery,'i').test(item.description) ); //filtering over two fields
  }
  res.send(data);
})

function filterExact(item){
  new RegExp(searchQuery,'i').test(item.name);
}