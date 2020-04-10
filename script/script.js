$(document).ready(function() {

    var inputCity = "";
    // APIKey
    var APIKey = "3454e50c3bf841b68c9335f9ed3061d2";  

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
    //This could should work on any td's already existing or added as the app is used.
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
        //AJAX and building cards.  Since asyncrhonous, I dont care which one loads first and second.
        buildTodaysWeather();
        buildFiveDayForecast();
    };

    //This function builds todays weather - the big section on the right
    //The function is expecting two things - the response object and the uv data
    //retrieved from the five day forecast API call.
    function buildTodaysWeather () {
        var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + inputCity +"&appid=" + APIKey;

        $.ajax({
            url: currentWeatherURL,
            method: "GET"
          }).then(function(todaysWeather) {

            //clear the 'todays-weather' div for new data
            $("#todays-weather").empty();
            //create a new card body
            var newDiv = $("<div>").addClass("card-body");
            //city name
            var newH4 = $("<h4>",{class: "card-title", text: inputCity + " (Current) "});  //works with a variable for text
            //get the icon and appened to the h4
            var icon =todaysWeather.weather[0].icon;
            var iconURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png"
            var newI = $("<img>").attr("src", iconURL);            
            newH4.append(newI);
            
            //temp, converted from kelvin
            var tempFromKelvin = (todaysWeather.main.temp - 273.15) * 1.80 + 32
            var newP1 = $("<p>",{class: "card-text", text: "Temperature: " + tempFromKelvin.toFixed(1) + " °F"}); //  alt 0 1 7 6
            //humidity
            var newP2 = $("<p>",{class: "card-text", text: "Humidity: " + todaysWeather.main.humidity +"%"});
            //wind speed
            var newP3 = $("<p>",{class: "card-text", text: "Wind Speed: " + todaysWeather.wind.speed + " MPH"});                
            //uv index
            var newP4 = $("<p>",{class: "card-text", text: "UV Index: "});
            
            //getting the actual uv index is a little more painful.  The current weather api doesnt have the uv - gotta hit a different
            //api for that using the location coordinates.  Get those from the current weather api and pass them to the uv api.  Then,
            //build the elements
            var latValue = todaysWeather.coord.lat;
            var lonValue = todaysWeather.coord.lon;

            var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + latValue + "&lon=" + lonValue;

            $.ajax({
                url: uvURL,
                method: "GET"
            }).then(function(uvWeather) {
                
                var uvValue = uvWeather.value;
                
                //get the uv colors based on the uv index
                var uvColor = "";
                if (uvValue < 3){
                    uvColor = "lowuv"
                }
                else if (uvValue < 6){
                    uvColor = "mediumuv"                    
                }
                else if (uvValue < 8){
                    uvColor = "highuv"                    
                }                
                else if (uvValue < 11){
                    uvColor = "veryhighuv"                    
                }                  
                else {
                    uvColor = "extremelyhighuv"                    
                };

                var newSpan = $("<span>",{class: uvColor, text: uvValue});                        
                newP4.append(newSpan);
                newDiv.append(newH4, newP1, newP2, newP3, newP4);
                $("#todays-weather").append(newDiv);
            });
        });


    }

    //this function builds the five day forecast
    //function expects the five day forecast object
    function buildFiveDayForecast () {

        var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + inputCity + "&appid=" + APIKey;

        //get the 5 day forecast, and build 5 different cards
        $.ajax({
            url: fiveDayURL,
            method: "GET"
          }).then(function(fiveDaysWeather) {
            console.log(fiveDaysWeather);
            $("#fivedaywords").empty();
            $("#fivedaysection").empty();        
    
            $("#fivedaywords").text("5-Day Forecast");
    
            for (i = 0; i < 40; i+=8) {
                var sectionNbr = "#section" + i;
                var newSection = $("<section>",{class: "col-lg-2", id: sectionNbr});           
                var newCard = $("<div>").addClass("card bg-primary text-white");            
                var newDiv = $("<div>").addClass("card-body");
                var newH5 = $("<h5>",{class: "card-title", text: moment(fiveDaysWeather.list[i].dt_txt).format('MM/DD/YYYY')});
                //get the weather icon and include it in the card
                var icon =fiveDaysWeather.list[i].weather[0].icon;
                var iconURL = "https://openweathermap.org/img/wn/" + icon + ".png"
                var newI = $("<img>").attr("src", iconURL);  
                //get temp and humidity too
                var tempFromKelvin = (fiveDaysWeather.list[i].main.temp - 273.15) * 1.80 + 32
                var newP1 = $("<p>",{class: "card-text", text: "Temp: " + tempFromKelvin.toFixed(1) + " °F"}); //  alt 0 1 7 6
                var newP2 = $("<p>",{class: "card-text", text: "Humidity: " + fiveDaysWeather.list[i].main.humidity +"%"});
                newDiv.append(newH5, newI, newP1, newP2);
                $(newCard).append(newDiv);
                $(newSection).append(newCard);
                $("#fivedaysection").append(newSection);
            }            

        });


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
        inputCity =  $("#search-input").val().trim();
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