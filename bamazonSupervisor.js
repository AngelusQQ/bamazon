var mysql = require("mysql");
var request = require("enquirer");
var EQ = new request();

EQ.register('list', require('prompt-list'));

var questions = [
  {
    type: 'list',
    name: 'menu',
    default: 0,
    message: 'Hello Supervisor! Welcome to the Main Menu. Please Select an Option to Continue.',
    choices: [
      'View Product Sales by Department',
      'Create New Department'
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
        //View Product Sales By Department
        case 32: productSales(); break;
        //Create New Department
        case 21: newDepartmentPrompt(); break;
      }
    })
    .catch(function(err){
      throw err;
    });
});

//Product Sales Option (#1)
function productSales() {
  console.log("\n------------------------------------------------------------------------------------");
  console.log("| Department ID | Department Name |  Overhead Cost  | Product Sales | Total Profit |");
  console.log("| ------------- | --------------- | --------------- | ------------- | ------------ |");
  connection.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) FROM departments INNER JOIN products ON products.department_name=departments.department_name GROUP BY departments.department_name;" ,function(err, res){
    if (err) throw err;
    //console.log(res[0]["SUM(products.product_sales)"]);
    for(var i = 0; i < res.length; i++) {
      var name = "";
      var cost = "";
      var sales = "";
      var profit = res[i]["SUM(products.product_sales)"] - res[i].over_head_costs;
      var profitDisplay = "";
      if(res[i].department_id < 10) { var temp = "0" } else { var temp = "" }
      for(var j = 15; j > res[i].department_name.length; j--) {
        name += " ";
      }
      for(var k = 14; k > res[i].over_head_costs.toString().length; k--) {
        cost += " ";
      }
      for(var l = 13; l > res[i]["SUM(products.product_sales)"].toString().length; l--) {
        sales += " ";
      }
      for(var m = 12; m > profit.toString().length; m--) {
        profitDisplay += " ";
      }
      console.log("| " + temp + res[i].department_id + "            | " + res[i].department_name + name + " | $" + res[i].over_head_costs + cost + " | $" + res[i]["SUM(products.product_sales)"] + sales + "| $" + profit + profitDisplay + "|");
    }
    console.log("------------------------------------------------------------------------------------");
  });
  connection.end();
}
//New Department Option (#2)
EQ.question(
  {
    name: 'name',
    type: 'input',
    message: 'What is the name of the new Department:'
  }
);

EQ.question(
  {
    name: 'cost',
    type: 'input',
    message: 'What are the overhead costs for the new Department:'
  }
);

function newDepartmentPrompt() {
  EQ.ask(['name', 'cost']).then(function(input) {
    connection.query("SELECT * FROM departments WHERE department_name = '" + input.name + "';", function(err, res) {
      if(res.length === 0) {
        connection.query("INSERT INTO departments (department_name, over_head_costs) VALUES ('" + input.name +"'," + input.cost + ");", function(err, res){
          console.log('Department "' + input.name + '" has been implemented with overhead costs at $' + input.cost);
        });
      }
      else if(res[0].department_name) {
        console.log("This department already exists under ID:", res[0].department_id);
      }
      connection.end();
    });
  })
  .catch(function(err) {
    throw err;
  });
}
