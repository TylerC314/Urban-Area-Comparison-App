`use strict`;
const teleportURL = "https://api.teleport.org/api/cities/";

var arr = [];

function formatParameters(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join("&");
}

function formatCityScores(scores) {
    console.log("City Scores: ", scores);
}

function getAllCityScores(cities) {
    let cityURLArray = cities.map(city => {
        let cityURL = {
            search: city,
            embed: "city:search-results/city:item/city:urban_area/ua:scores",
        }
        const queryString = formatParameters(cityURL);
        return `${teleportURL}?${queryString}`;
    });

    Promise.all(cityURLArray.map(city => {
        return fetch(city)
        .then(response => response.json());
    }))
    .then(responseJson => {
        console.log("ResponseJson", responseJson);
        let cityGraphArray = getGraphData(responseJson);
        displayGraph(cityGraphArray);
    });
}

function getGraphData(responseJson) {
    let graphArray = responseJson.map(city => {
        let scores = city._embedded["city:search-results"][0]._embedded["city:item"]
        ._embedded["city:urban_area"]._embedded["ua:scores"].categories;
        console.log("scores", scores);

        let cityData = {
            x: [],
            y: [],
            name: city._embedded["city:search-results"][0].matching_full_name,
            type: "bar",
        }

        scores.forEach(score => {
            cityData.x.push(score.name);
            cityData.y.push(score.score_out_of_10);
        });
        return cityData;
    });
    return graphArray;
}

function displayGraph(graphArray) {
    let layout = {
        barmode: "group",
        autosize: false,
        width: 1000,
        height: 500,
        yaxis: {
            range: [0, 10],
            automargin: true,
        },
        legend: {
            x: 0,
            y: 1,
        }
    }
    const display = document.getElementsByClassName("cities-display");
    Plotly.newPlot(display[0], graphArray, layout);
}

function handlers() {
    $("#city-form").submit(event => {
        event.preventDefault();
        $(".cities-display").html("");
        const city1 = `${$("#first-city-name").val()}`;
        const city2 = `${$("#second-city-name").val()}`;
        console.log("cities", city1, city2);
        getAllCityScores([city1, city2]);
    });
}

$(handlers());
