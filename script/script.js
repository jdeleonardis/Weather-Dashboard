$(document).ready(function() {

    var inputCity = "";

    initDoc();

    //***** CLICKING EVENTS *****/
    //if the search button is clicked, then search.
    $("#search-btn").on("click", function() {
            if (saveCityList()) {
                retrieveWeather(true);
            };

    });
    //----or----
    //if the enter key is pressed, then fire the search btn click event.
    $(document).keyup(function (e) {
        if (e.keyCode == 13) {
            $("#search-btn").click();
        }
    });

    //if a previously retrieved city is clicked in the table, then
    //set the input city variable, save the last city searched, and retrieve the weather.
    //This is some wonky code I found by googling...appears to work correctly.
    $(document).on("click","td", function(e){
        inputCity = e.target.innerHTML;
        saveLastCitySearched(inputCity);
        retrieveWeather(false);
    });
    //*****END CLICKING EVENTS *****/


    //this function is used to retrieve the weather.  The 'needCity' argument is used
    //to determine if the city has been input by the user(true), or if the city is being retrieved
    //from local storage or clicked on exisiting city (false)
    function retrieveWeather(needCity){
        if (needCity) {
            getInputCity()
        }

        //get here, there should be a city to search with
        //alert(inputCity);
        buildTodaysWeather();
        buildFiveDayForecast();

    };

    //This function builds todays weather - the big section on the right
    function buildTodaysWeather () {
        $("#todays-weather").empty();
        var newDiv = $("<div>").addClass("card-body");
        var newH4 = $("<h4>",{class: "card-title", text: inputCity + " (04/20/2020) "});  //works with a variable for text
        var newI = $("<i>").addClass("fas fa-sun weathericon");
        newH4.append(newI);
        var newP1 = $("<p>",{class: "card-text", text: "Temperature: 91.05 °F"}); //  alt 0 1 7 6
        var newP2 = $("<p>",{class: "card-text", text: "Humidity: 43%"});
        var newP3 = $("<p>",{class: "card-text", text: "Wind Speed: 4.7 MPH"});                
        var newP4 = $("<p>",{class: "card-text", text: "UV Index: "}); 
        var newSpan = $("<span>",{class: "moderateuv", text: "5.40"});                        
        newP4.append(newSpan);
        newDiv.append(newH4, newP1, newP2, newP3, newP4);
        $("#todays-weather").append(newDiv);
    }

    //this function builds the five day forecast
    function buildFiveDayForecast () {
        $("#fivedaywords").empty();
        $("#fivedaysection").empty();        

        $("#fivedaywords").text("5-Day Forecast");

        for (i = 0; i < 5; i++) {
            var sectionNbr = "#section" + i;
            var newSection = $("<section>",{class: "col-lg-2", id: sectionNbr});           
            var newCard = $("<div>").addClass("card bg-primary text-white");            
            var newDiv = $("<div>").addClass("card-body");
            var newH5 = $("<h5>",{class: "card-title", text: "04/20/2020"});  //works with a variable for text
            var newI = $("<i>").addClass("fas fa-sun weathericon");
            var newP1 = $("<p>",{class: "card-text", text: "Temp: 91.05 °F"}); //  alt 0 1 7 6
            var newP2 = $("<p>",{class: "card-text", text: "Humidity: 43%"});
            newDiv.append(newH5, newI, newP1, newP2);
            $(newCard).append(newDiv);
            $(newSection).append(newCard);
            $("#fivedaysection").append(newSection);
        }
    }

    //*********ALL CODE FROM HERE DOWN RELATES TO SAVING CITY LIST, LAST CITY SEARCHED, ETC *******/

    //initialize the document.  Retrieve any previous
    //cities searched for.  Automatically retrieve the last city searched.
    function initDoc() {
        retrievePreviouslySearchedList();
        inputCity = retrieveLastCitySearched();
        if (inputCity != null) {
            retrieveWeather(false);
        }
    };

    //get the city that the user input.  return false if there is an empty string, true if text
    //is there
    function getInputCity(){
        inputCity =  $("#search-input").val();
        if (inputCity == "") {
            alert("Please enter a city to search for.")
            return false;
        }
        return true;
        
    }

    //save the last city searched
    function saveLastCitySearched(cityName){
        localStorage.setItem("lastCitySearched", cityName);
    };

    //retrieve the last city searched
    function retrieveLastCitySearched(){
        return localStorage.getItem("lastCitySearched");
    };    

    //save the list of cities.  as a user inputs cities, save them as an array locally
    function saveCityList() {        

        if (getInputCity()) {
            var cities = JSON.parse(window.localStorage.getItem('citiesPreviouslySearched'));
            if (cities === null) {
                cities = [];
            }
            //check to see if the city that was just searched already appears in the list of saved
            //cities.  If it does, no reason to save it again.
            if (cities.indexOf(inputCity) == -1) {
                cities.push(inputCity);
                localStorage.setItem("citiesPreviouslySearched", JSON.stringify(cities));
                retrievePreviouslySearchedList();
            };         
            //regardless of the previous if statement, still want to save as the last city searched
            saveLastCitySearched(inputCity);
            return true;
        };        
        return false;

    }

    //First, empty the body of the table.  Get all of the cities previously searched, and
    //add them to the table.
    function retrievePreviouslySearchedList(){
        $("tbody").empty();
        var cities = JSON.parse(window.localStorage.getItem('citiesPreviouslySearched'));
        if (cities != null) {
            for (i = 0; i < cities.length; i++) {
                var newTR = $("<tr>");
                var citySearched = $("<td>").text(cities[i]);
                newTR.append(citySearched)      
                $("tbody").append(newTR);                
            }
        } 
    }


});