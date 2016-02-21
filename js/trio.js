var ref = new Firebase("https://trioweb.firebaseio.com");
var scoresRef = ref.child("scores");
var authData = ref.getAuth();
var idRef;
var uid = "";
var team = -1;
var colors = ["red", "green", "blue"];
var themes = ["danger", "success", "info"];
var slogans = ["right at 'em, red.", "go get 'er, green.", "blow it outta the water, blue."]

//auth callback
ref.onAuth(updateAuth);

//update user info
function updateAuth(authData) {
    $("#topbox").empty();
    if (authData) {
        console.log(authData);
        jQuery('<h1/>', {
            text: "click like there's no tomorrow."
        }).appendTo("#topbox");
        jQuery('<p/>', {
            text: "your team depends on you. click the button right below."
        }).appendTo("#topbox");
        console.log("logged in");
        uid = authData.uid;
        idRef = ref.child("users").child(uid);
        idRef.once("value", idReturn);
    }
    else {
        jQuery('<h1/>', {
            text: "join the mad clicking."
        }).appendTo("#topbox");
        jQuery('<a/>', {
            class: "btn btn-lg btn-primary",
            role: "button",
            text: "login using facebook",
            onclick: "login()"
        }).appendTo("#topbox");
        console.log("logged out");
        uid = "";
    }
}

//login and id setup
function idReturn(data){
    var id = data.val();
    if (id === null) {
        team = Math.floor(Math.random()*3);
        idRef.child("team").set(team);
    }
    else {
        team = id["team"];
    }
    jQuery('<a/>', {
        class: "clicky btn btn-lg btn-" + themes[team],
        role: "button",
        text: slogans[team],
        onclick: "clicky()"
    }).appendTo("#topbox");
    jQuery('<p/>', {
        id: "logout"
    }).appendTo("#topbox");
    jQuery('<a/>', {
        class: "",
        role: "button",
        text: "logout",
        onclick: "logout()"
    }).appendTo("#logout");
    console.log("your team is:" + team);
}

//login button
function login(){
    ref.authWithOAuthPopup("facebook", function(error) {
        if (error) {
            if (error.code === "TRANSPORT_UNAVAILABLE") {
              // fall-back to browser redirects, and pick up the session
              // automatically when we come back to the origin page
              ref.authWithOAuthRedirect("facebook", function(error) {});
            }
            console.log("Login Failed!", error);
        } else {
            // We'll never get here, as the page will redirect on success.
        }
    });
    authData = ref.getAuth();
}

//logout button
function logout(){
    ref.unauth();
    authData = ref.getAuth();
}

//clicky call
function clicky(){
    console.log("clicky.");
    ref.child("scores").child(team).transaction(function (current_value) {
        return (current_value || 0) + 1;
    });
}

scoresRef.on("value", update);

function update(data){
    var scores = data.val();
    var total = scores["0"] + scores["1"] + scores["2"];
    for(i =0; i < 3; i++){
        var score = scores[i];
        var percentage = Number(((score/total)*100).toFixed(1));
        
        $("#bar-" + colors[i]).attr("style", "width: " + percentage + "%;");
        $("#bar-" + colors[i]).attr("aria-valuenow", score);
        $("#bar-" + colors[i]).attr("aria-valuemin", 0);
        $("#bar-" + colors[i]).attr("aria-valuemax", total);
        
        $("#" + colors[i] + "Num").text(colors[i] + ": " + scores[i] + "/" + total);
    }
}