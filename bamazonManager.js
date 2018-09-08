var mysql = require("mysql");
var request = require("enquirer");
var EQ = new request();
var product, quantity, temp;

EQ.register('list', require('prompt-list'));

EQ.question(
  {
    name: 'ID',
    type: 'input',
    message: 'Please enter the ID of the desired product'
  }
);

EQ.question(
  {
    name: 'stock',
    type: 'input',
    message: 'Please enter the quantity to be added to stock.'
  }
);

EQ.question(
  {
    name: 'name',
    type: 'input',
    message: 'Please enter the Name of the Product.'
  }
);

EQ.question(
  {
    name: 'department',
    type: 'input',
    message: 'Please enter the Department in which the Product belongs to.'
  }
);

EQ.question(
  {
    name: 'price',
    type: 'input',
    message: 'Please enter the price per unit of the Product.'
  }
);

var questions = [
  {
    type: 'list',
    name: 'menu',
    default: 0,
    message: 'Hello Manager! Welcome to the Main Menu. Please Select an Option to Continue.',
    choices: [
      'View Products for Sale',
      'View Low Inventory',
      'Add to Inventory',
      'Add New Product'
    ]
  }
];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    EQ.ask(questions).then(function(answers) {
      switch(answers.menu.length) {
        //View Products for Sale
        case 22: display(true); break;
        //View Low Inventory (< 5)
        case 18: display(false); break;
        //Add to Inventory
        case 16: addToInventory(); break;
        //Add New Product
        case 15: addToProducts(); break;
        //View Products for Sale (Default)
        default: display(true); break;
      }
    })
    .catch(function(err){
      throw err;
    });
});

function display(bool) {
  if (bool === true) { temp = 'SELECT * FROM products'; }
  else if (!bool) { temp = 'SELECT * FROM products WHERE stock_quantity < 5'; }
  else { temp = 'SELECT * FROM products WHERE item_id = ' + bool; }
  //Product List || View low inventory
  connection.query(temp, function (err, res) {
    if (err) throw err;
    console.log("\n\n//////////////////////////////////////////////");
    for(var i = 0; i < res.length; i++) {
      console.log("Id:", res[i].item_id);
      console.log("Product:", res[i].product_name);
      console.log("Price: $" + res[i].price);
      console.log("Department:", res[i].department_name);
      console.log("Stock:", res[i].stock_quantity);
      console.log("//////////////////////////////////////////////");
    }
    connection.end();
  });
}

function addToInventory() {
  EQ.ask(['ID', 'stock']).then(function(input) {
    if (isNaN(input.stock) || isNaN(input.ID)) { console.log("Please enter numerical values!"); connection.end(); }
    else {
      connection.query("UPDATE products SET stock_quantity = stock_quantity + " + input.stock + " WHERE item_id = " + input.ID + ";", function(err, res) {
        if (err) throw err;
        console.log("Stock Added!");
      });
      display(input.ID);
    }
  });
}

function addToProducts() {
  EQ.ask(['name', 'price', 'stock', 'department']).then(function(input) {
    if (isNaN(input.stock) || isNaN(input.price) || !isNaN(input.department) || !isNaN(input.name) ) { console.log("Please enter numerical values for price and quantity, and words for Name and Department"); connection.end(); }
    else {
      var newInput = "'" + input.name + "', '" + input.department + "', " + input.price + ", " + input.stock;
      console.log("INSERT INTO products (product_name, department_name, price, stock_quantity) values(" + newInput + ");");
      connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) values(" + newInput + ");", function(err, res) {
        if (err) throw err;
      });
      display(true);
    }
  });
}
