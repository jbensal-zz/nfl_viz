/*
 * Logic for D3 visualization of NFL data.
 * For CS 199, Spring 2014.
 * Authors: Jay Bensal, Raj Ramamurthy
 */

/* Data storage */
var players = new Array(); // array of all the players
var playersPos = {};
var playersPosArr = [];

var margin = {top: 20, right: 40, bottom: 30, left: 40},
    width = 1060 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

/* Load in the player data */
var loadPlayerData = function() {
  d3.csv('data/all_dead_nfl_player_metadata.csv', function (player) {
    /* Needed to filter out players born before 1900 because don't have
     * life expectancy data for them. */
    if (player.birth_year < 1900) return;
    /* Fill in the player info */
    var playerInfo = {
      name: player.actual_name,
      deathYear: +player.death_year,
      deathAge: +player.death_age,
      birthYear: +player.birth_year, 
      college: player.college,
      draftYear: +player.draft_year,
      draftRound: +player.draft_round,
      draftPick: +player.draft_pick,
      position: player.position_type,
      plocation: player.positon_location
    };
    players.push(playerInfo);

    if (player.position_type != "NA" && player.height_inches != "NA" && player.weight != "NA"){
//      weight (lb) / [height (in)]2 x 703
      var bmi = +player.weight / Math.pow(+player.height_inches, 2) * 703;
      if (playersPos[player.position_type] == undefined) {
        playersPos[player.position_type] = {
          count: 0,
          total: bmi,
          avg: function() {
            if (this.count == 0) return 0;
            return this.total / this.count;
          }
        };
      } else {
        playersPos[player.position_type].count++;
        playersPos[player.position_type].total += bmi;
      }
    } // end if

  }, function(error, rows) {
    /* Player data is loaded */
    if (error) {
      console.log('Error loading player data: ', error);
    }
    for (var i in playersPos) {
      var newObj = {
        pos: i,
        avg: playersPos[i].avg()
      }
      playersPosArr.push(newObj);
    }
    loadLifeExpectancy();
  });
};

/* Load in life expectancy data */
var loadLifeExpectancy = function() {
  var lives = {};
  d3.csv('data/life_expectancy.csv', function(data) {
    lives[data.year] = parseFloat(data.male_life_expectancy);
  }, function(error, rows) {
    /* Life expectancy data is loaded */
    if (error) {
      console.log('Error loading life expectancy data:', error);
    }
    /* Match life expectancy to player */
    for (var i = 0; i < players.length; i++) {
      players[i].lifeExpectancy = lives[players[i].birthYear];
    }
    dataIsLoaded();
  });
};

/* The data is loaded at this point. */
var dataIsLoaded = function() {
  console.log('All data loaded.');
  makeGraph();
  makeSecondGraph();
  makeThirdGraph();
  makeDOMRepresentation();
};

/* Make a scatterplot graph for the life expectancies*/
var makeGraph = function(){
  
  // set up X
  var xValue = function(p){
    return p.birthYear;
  };

  var xScale = d3.scale.linear().range([0,width]);

  var xMap = function(p){
      return xScale(xValue(p));
  };

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  // set up Y
  var yValue = function(p){
    return p.deathAge - p.lifeExpectancy;
  };

  var yScale = d3.scale.linear().range([height, 0]);

  var yMap = function(p){
      return yScale(yValue(p));
  };

  var yAxis = d3.svg.axis().scale(yScale).orient("left");

// draw on SVG
  var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // avoid overlap between dots and axis
  xScale.domain([d3.min(players, xValue)-1, d3.max(players, xValue)+1]);
  yScale.domain([d3.min(players, yValue)-1, d3.max(players, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Time");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Deviation from mean");

  // draw circles    
  svg.selectAll(".dot")
   .data(players)
   .enter()
   .append("circle")
   .attr("class", "dot")
   .attr("r", 2)
   .attr("cx", xMap)
   .attr("cy", yMap);
}; // end makeGraph function

var makeSecondGraph = function(){

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], 1);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10, "");

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(playersPosArr.map(function(d) { return d.pos }));
  y.domain([0, d3.max(playersPosArr, function(d) { return d.avg; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .text("Position");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Average BMI");

  svg.selectAll(".bar")
      .data(playersPosArr)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.pos); })
      .attr("width", 10)
      .attr("y", function(d) { return y(d.avg); })
      .attr("height", function(d) { return height - y(d.avg); });
};

makeThirdGraph = function(){
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var xScale = d3.scale.ordinal()
  .rangeRoundBands([0, width], 1);

  var yScale = d3.scale.linear()
  .range([height, 0]);

  // set up X-value
  var xValue = function(p){
    return p.position;
  };

  // set up Y-value
  var yValue = function(p){
    return p.deathAge;
  };

  var xMap = function(p){
    return xScale(xValue(p));
  }

  var yMap = function(p){
      return yScale(yValue(p));
  };

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(10, "");

  var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// domain info
 xScale.domain(players.map(function(p) { return p.position }));
 yScale.domain([0, d3.max(players, function(p) { return p.deathAge; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .text("Position");

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Death Age");

  // draw circles    
  svg.selectAll(".dot2")
   .data(players)
   .enter()
   .append("circle")
   .attr("class", "dot2")
   .attr("r", 2)
   .attr("cx", xMap)
   .attr("cy", yMap);

};

/* Draw the table to the DOM. */
var makeDOMRepresentation = function() {
  /* Using a string is the fastest way, especially with lots of data */
  var DOMRepresentation = '<table class="table table-striped"><thead><th>Name</th><th>Born</th><th>Died</th><th>Expectancy</th><th> Age at Death</th></thead><tbody>';
  for (var i = 0; i < players.length; i++) {
    DOMRepresentation += '<tr><td>' + players[i].name + '</td><td>' + players[i].birthYear + '</td><td>' + players[i].deathYear + '</td><td>' + players[i].lifeExpectancy + '</td><td>' + players[i].deathAge + '</td></tr>';
  }
  DOMRepresentation += '</tbody></table>';
  var tableWrapper = document.createElement('div');
  tableWrapper.id = 'js-table-data';
  tableWrapper.innerHTML = DOMRepresentation;
  tableWrapper.style.display = "none";
  document.getElementById('wrap').appendChild(tableWrapper);
  /* Hide loading message */
  document.getElementById('message').style.display = 'none';
  /* Show toggle */
  document.getElementById('toggle').style.display = 'block';
};

/* Called when DOM is ready */
var init = function() {
  document.getElementById('toggle').addEventListener('click', function(e) {
    e.preventDefault();
    var div = document.getElementById('js-table-data');
    if (div.style.display !== 'none') {
      div.style.display = 'none';
      this.innerHTML = 'Show';
    }
    else {
      div.style.display = 'block';
      this.innerHTML = 'Hide';
    }
  }, false);
  loadPlayerData();
};

/* Add listener to load data on content ready */
window.addEventListener("DOMContentLoaded", init, false);
