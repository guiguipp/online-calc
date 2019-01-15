// Initializing Firebase
const config = {
  apiKey: "AIzaSyDmLmBDY_t6wDgrlPaPHmdgwQwePRiH7uY",
  authDomain: "online-calculator-2a29e.firebaseapp.com",
  databaseURL: "https://online-calculator-2a29e.firebaseio.com",
  projectId: "online-calculator-2a29e",
  storageBucket: "online-calculator-2a29e.appspot.com",
  messagingSenderId: "745602329511"
};

firebase.initializeApp(config);
const database = firebase.database();
const calculations = database.ref("/calc");

$(document).ready(function() {
  // Global variables while performing the operations
  let firstNumber;
  let secondNumber;
  let operator;
  let result;
  let isOperatorChosen;
  let isCalculated;

  // Function to initialize our calculator. When the user hits clear, the app is reset.
  const initializeCalculator = () => {
    firstNumber = "";
    secondNumber = "";
    operator = "";
    isOperatorChosen = false;
    isCalculated = false;

    $("#first-number, #second-number, #operator, #result").empty();
  }

  // Adding an on click listener to all elements that have the class "number"
  $(".number").on("click", function() {
    // If we've already ran a calculation, just return.
    if (isCalculated) return;
    // If operator is chosen, we should be writing the secondNumber, otherwise, the firstNumber
    if (isOperatorChosen) {
      secondNumber += $(this).val();
      $("#second-number").text(secondNumber);
    }
    else {
      firstNumber +=  $(this).val();
      $("#first-number").text(firstNumber);
    }
  });

  // Adding an on click listener to all elements that have the class "operator"
  $(".operator").on("click", function() {
    // Check if a first number has already been selected
    // Or we've already run a calculation, if so we just exit.
    if (!firstNumber || isCalculated) return;
    // Set isOperatorChosen to true so we start writing to secondNumber
    isOperatorChosen = true;
    // Store off the operator
    operator =  $(this).val();
    // Set the HTML of the #operator to the text of what was clicked
    $("#operator").text($(this).text());
  });

  // Add an on click listener to all elements that have the class "equal"
  $(".equal").on("click", function() {
    // If we already clicked equal, don't do the calculation again
    if (isCalculated) return;
    isCalculated = true;
    // Use parseInt to convert our string into integers
    firstNumber = parseInt(firstNumber);
    secondNumber = parseInt(secondNumber);
    if(Number.isInteger(firstNumber) && Number.isInteger(secondNumber)) {
      if (operator === "plus") {
        operator = "+"
        result = firstNumber + secondNumber;
      }
      else if (operator === "minus") {
        operator = "-"
        result = firstNumber - secondNumber;
      }
      else if (operator === "times") {
        operator = "*"
        result = firstNumber * secondNumber;
      }
      else if (operator === "divide") {
        operator = "/"
        if (secondNumber !== 0) {
          result = firstNumber / secondNumber;
        }
        else {
          result = "You cannot divide by 0"
        }
      }
      else if (operator === "power") {
        operator = "^"
        result = Math.pow(firstNumber, secondNumber);
      }
      $("#result").text(result);
      // we log and send the data to Firebase
      sendToFirebase(`${firstNumber} ${operator} ${secondNumber} = ${result}`)
    }
  });

  // Getting a snapshot from calculation data saved in Firebase. 
  // Parsing it, and displaying it on the page
  calculations.on("value", function(snapshot) {
    $("#history").empty()
    let currentVal = snapshot.val();
    let parsedVal = []
    for(let i in currentVal)
      parsedVal.push(currentVal[i].data);
    // appending last 10 operations from most recent to oldest
    for (let i = parsedVal.length -1; i > parsedVal.length - 11 ; i--) {
      $("#history").append(`<li>${parsedVal[i]}</li>`)
    }
  })

  // Send data to Firebase
  const sendToFirebase = (input) => {
    calculations.push({
      data: input,
      time: firebase.database.ServerValue.TIMESTAMP,
    });
  };

  // Add an on click listener to all elements that have the class "clear"
  $(".clear").on("click", function() {
    // Call initializeCalculater so we can reset the state of our app
    initializeCalculator();
  });
  // Call initializeCalculater so we can set the state of our app
  initializeCalculator();
});

