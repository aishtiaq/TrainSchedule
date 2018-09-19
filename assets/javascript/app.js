var update=false;
var updateKey;
var validated=false;
var name="", dest="", time="", duration=0, timeFormatted;
$(document).ready(function() {  

    

    var config = {
        apiKey: "AIzaSyC9pE2ORuZUcAnZM_4fnUDSScgurVLBbN8",
        authDomain: "gwbootcamp-97ba0.firebaseapp.com",
        databaseURL: "https://gwbootcamp-97ba0.firebaseio.com",
        projectId: "gwbootcamp-97ba0",
        storageBucket: "gwbootcamp-97ba0.appspot.com",
        messagingSenderId: "454079581913"
      };
      
    firebase.initializeApp(config);
    var database = firebase.database();
    
    var intervalId;

    clearInterval(intervalId);
    intervalId = setInterval(function (){
        database.ref('/train').once("value", function(snapshot){
            snapshot.forEach(function(child){
                var data = child.val();
                
                var minAndTime= calcNextTrainAndTime(data.time,data.duration);
         
                
                $("#row_"+child.key+' .next').html(minAndTime[1]);
                $("#row_"+child.key+' .minTill').html(minAndTime[0]);
            });
        });
    }, 1000);

    $("#submit").on("click", function(event){

        event.preventDefault();
        $("#nameInput").removeClass("is-invalid");
        $("#destinationInput").removeClass("is-invalid");
        $("#firstTrainInput").removeClass("is-invalid");
        $("#frequencyInput").removeClass("is-invalid");
        validate(event);
        
        
        if(validated) {

        
            // Grabbed values from text boxes
            name = $("#nameInput").val().trim();
            dest = $("#destinationInput").val().trim();
            time = $("#firstTrainInput").val().trim();
            duration = $("#frequencyInput").val().trim();

            
            
            if(update === true) {
                
                var ref=firebase.database().ref();
                ref.child('train').child(updateKey).update( {
                    name: name,
                    dest: dest,
                    time: time,
                    duration: duration
                });
                var minAndTime= calcNextTrainAndTime(time,duration);
         
                $("#row_"+updateKey+' .name').html(name);
                $("#row_"+updateKey+' .dest').html(dest);
                $("#row_"+updateKey+' .time').html(time);
                $("#row_"+updateKey+' .duration').html(duration);
                $("#row_"+updateKey+' .next').html(minAndTime[1]);
                $("#row_"+updateKey+' .minTill').html(minAndTime[0]);
                update=false;
                
            } else {
                database.ref('/train').push({
                    name: name,
                    dest: dest,
                    time: time,
                    duration: duration
                });
            }

            $("#nameInput").val("");
            $("#destinationInput").val("");
            $("#firstTrainInput").val("");
            $("#frequencyInput").val("");

            validated=false;
        }

    });    

    database.ref('/train').on("child_added", function(snapshot) {
        // storing the snapshot.val() in a variable for convenience
        var sv = snapshot.val();
        
        var key = snapshot.key;
       
        var minAndTime= calcNextTrainAndTime(sv.time,sv.duration);
         
        var tr = $("<tr>");
        tr.attr("id","row_"+key);
        
        var td_name = $("<td class='name'>");
        td_name.text(sv.name);
        tr.append(td_name);

        var td_dest = $("<td class='dest'>");
        td_dest.text(sv.dest);
        tr.append(td_dest);

        var td_duration = $("<td class='duration'>");
        td_duration.text(sv.duration);
        tr.append(td_duration);

        var td_next = $("<td class='next'>");
        td_next.text(minAndTime[1]);
        tr.append(td_next);

        var td_minTill = $("<td class='minTill'>");
        td_minTill.text(minAndTime[0]);
        tr.append(td_minTill);
        

        var del_update = $("<button class='update my-1'>");
        del_update.attr("id",key);
        del_update.text("Update");
        tr.append(del_update);

        var del_button = $("<button class='delete my-1'>");
        del_button.attr("id",key);
        del_button.text("Delete");
        tr.append(del_button);


        $("#schedule").append(tr);

        // Handle the errors
        }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    
    $(document).on("click",".delete",function(){
        
        var id= $(this).attr("id");
        
        

        var ref=firebase.database().ref('/train');

        ref.on("child_added", function(snapshot) {
            if(snapshot.key === id) {
                
                ref.child(snapshot.key).remove();
                
            }
            
        });
    
        $(this).parent().remove();

    });

    $(document).on("click",".update",function(){
        
        updateKey= $(this).attr("id");
        
        var ref=firebase.database().ref();

        
        ref.child('train').orderByKey().equalTo(updateKey).on("child_added", function(sv) {
            
            console.log(sv.val().name);
            var snapshot=sv.val();
            $("#nameInput").val(snapshot.name);
            $("#destinationInput").val(snapshot.dest);
            $("#firstTrainInput").val(snapshot.time);
            $("#frequencyInput").val(snapshot.duration);
            update=true;
        });
        
        
       
            

    });

});

function calcNextTrainAndTime(time, duration) {
    var firstTimeConverted = moment(time, "HH:mm").subtract(1, "years");
            
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

        var tRemainder = diffTime % duration;
    
        var tMinutesTillTrain = duration - tRemainder;
    
        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes").format('hh:mm a'); 
    
        return [tMinutesTillTrain,nextTrain]
}

function validate(e){
    
    name = $("#nameInput").val().trim();
    dest = $("#destinationInput").val().trim();
    time = $("#firstTrainInput").val().trim();
    duration = $("#frequencyInput").val().trim();
    
    var errors;

	if (!checkLength(name,1,100)) {
        errors = true; 
        $("#nameInput").addClass("is-invalid");
	}
    
	if (!checkLength(dest,1,100)) {
        errors = true; 
        $("#destinationInput").addClass("is-invalid");
    }
    
    if (time=="" || time.indexOf(':')<0) {
        errors = true; 
        $("#firstTrainInput").addClass("is-invalid");
    } else if(!validateTime(time)) {
        errors = true; 
        $("#firstTrainInput").addClass("is-invalid");
    } 

    if (isNaN(duration) || duration=="") {
        errors = true; 
        $("#frequencyInput").addClass("is-invalid");
    }
    
	if (errors) {
		
        e.preventDefault();
        
	} else {
        validated=true;
    }


}

function checkLength(text, min, max){

	if (text.length < min || text.length > max) {
		return false;
	}
	return true;
}



function validateTime(obj)
{
    var timeValue = obj;
    
    var sHours = timeValue.split(':')[0];
    var sMinutes = timeValue.split(':')[1];
    console.log("hours is "+parseInt(sHours)+" and minutes is  "+sMinutes);

    if(sHours == "" || isNaN(sHours) || parseInt(sHours)>23)
    {
        return false;
    }
    else if(parseInt(sHours) == 0)
        sHours = "00";
    else if (sHours <10)
        sHours = "0"+sHours;

    if(sMinutes == "" || isNaN(sMinutes) || parseInt(sMinutes)>59)
    {
        
        return false;
    }
    else if(parseInt(sMinutes) == 0)
        sMinutes = "00";
    else if (sMinutes <10)
        sMinutes = "0"+sMinutes;    

    timeFormatted= sHours+":"+sMinutes;      
    

    return true;    
}