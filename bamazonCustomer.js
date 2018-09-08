var mysql = require("mysql");
var request = require("enquirer");

var EQ = new request();
var product, quantity, cost;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

EQ.question('ID', 'ID of desired Product:');
EQ.question('stock', "Quantity Desired:");

connection.connect(function(err) {
    if (err) throw err;
    displayAll();
    setTimeout(productSelection ,500);
});

function displayAll() {
  //Product List
  connection.query("SELECT * FROM products", function (err, res) {
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
  });

}

function productSelection() {
  EQ.prompt('ID').then(function(input) {
    product = input.ID;
    console.log(product);
    setTimeout(quantitySelection, 500);
  });
}

function quantitySelection() {
  EQ.prompt('stock').then(function(input) {
    quantity = input.stock;
    connection.query("SELECT * FROM products WHERE item_id = " + product, function(err, res) {
      if (err) throw err;
      if(res[0].stock_quantity >= quantity) {
        //update values on DB
        var remaining = res[0].stock_quantity - quantity;
        updateProduct(product, remaining);
        //calculating cost for users
        cost = res[0].price * quantity;
        console.log("\nYour Total:", "$" + cost);
        console.log("\nThank You! We hope to see you again soon!");

        connection.query("UPDATE products SET product_sales = product_sales + " + cost + " WHERE item_id = " + product + ";", function(err, res) {
          if (err) throw err;
        });

      } else {
        //If the quantity desired > quantity in stock
        console.log("Insufficient Quantity!")
      }
      connection.end();
    });
  });

}

function updateProduct(id, qty) {
  connection.query("UPDATE products SET stock_quantity = " + qty + " WHERE item_id = " + id + ";", function (err, res) {
    if (err) throw err;
  });
}
