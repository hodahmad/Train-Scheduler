//The first thing we do is create a config var with our firebase database info.
var config = {
    apiKey: "AIzaSyBHvrGJlPpegEUA2-diGpYl1yG0OYRLKug",
    authDomain: "train-scheduler-5ba39.firebaseapp.com",
    databaseURL: "https://train-scheduler-5ba39.firebaseio.com",
    projectId: "train-scheduler-5ba39",
    storageBucket: "",
    messagingSenderId: "708755803122",
    appId: "1:708755803122:web:c7a29b58f4a7cc94df396b"
  };
  
  //initialize and create variables for the form blanks
  firebase.initializeApp(config);
  
  var database = firebase.database();
  
  var trainName = "";
  var destination = "";
  var startTime = "";
  var frequency = 0;

//create a function that grabs each input into the blanks and removes white spaces
  $(".form-control").on("keyup", function() {
    var trainT = $("#name-input").val().trim();
    var cityT = $("#destination-input").val().trim();
    var timeT = $("#firstTrain-input").val().trim();
    var frequencyT = $("#frequency-input").val().trim();
  
//store these inputs into firebase
    sessionStorage.setItem("train", trainT);
    sessionStorage.setItem("city", cityT);
    sessionStorage.setItem("time", timeT);
    sessionStorage.setItem("freq", frequencyT);
  });
  
//grab these inputs from the database in order to later create function that puts it back into the table  
  $("#name-input").val(sessionStorage.getItem("train"));
  $("#destination-input").val(sessionStorage.getItem("city"));
  $("#firstTrain-input").val(sessionStorage.getItem("time"));
  $("#frequency-input").val(sessionStorage.getItem("freq"));
  
//create function that will then add the above info from the database into the table in respective columns
  $("#add-train").on("click", function(event) {
    event.preventDefault();
  
//alert user if they leave anything blank.    
    if ($("#name-input").val().trim() === "" ||
      $("#destination-input").val().trim() === "" ||
      $("#firstTrain-input").val().trim() === "" ||
      $("#frequency-input").val().trim() === "") {
  
      alert("Please fill in all details to add new train");
  
    } else {
  
      trainName = $("#name-input").val().trim();
      destination = $("#destination-input").val().trim();
      startTime = $("#firstTrain-input").val().trim();
      frequency = $("#frequency-input").val().trim();
  
      $(".form-control").val("");
  
//push back to database object
      database.ref().push({
        trainName: trainName,
        destination: destination,
        frequency: frequency,
        startTime: startTime,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
      });
  
      sessionStorage.clear();
    }
  
  });

//create snapshot function 
  database.ref().on("child_added", function(childSnapshot) {
    var startTimeConverted = moment(childSnapshot.val().startTime, "hh:mm").subtract(1, "years");
    var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
    var timeRemain = timeDiff % childSnapshot.val().frequency;
    var minToArrival = childSnapshot.val().frequency - timeRemain;
    var nextTrain = moment().add(minToArrival, "minutes");
    var key = childSnapshot.key;
  
//append each new snapshot or entered value to the table itself in column/row form
    var newrow = $("<tr>");
    newrow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
    newrow.append($("<td>" + childSnapshot.val().destination + "</td>"));
    newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
    newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
    newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
    newrow.append($("<td class='text-center'><button class='arrival btn btn-danger btn-xs' data-key='" + key + "'>X</button></td>"));
  
    if (minToArrival < 6) {
      newrow.addClass("info");
    }
  
    $(".table").append(newrow);
  
  });
  
  $(document).on("click", ".arrival", function() {
    keyref = $(this).attr("data-key");
    database.ref().child(keyref).remove();
    window.location.reload();
  });
  
  currentTime();
  
  setInterval(function() {
    window.location.reload();
  }, 60000);