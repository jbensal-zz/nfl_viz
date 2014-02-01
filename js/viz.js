/*
 * Logic for D3 visualization of NFL data.
 * For CS 199, Spring 2014.
 * Authors: Jay Bensal, Raj Ramamurthy
 */

/* Data storage */
var players = new Array(); // array of all the players

/* Load in the player data */
var loadPlayerData = function() {
  d3.csv('data/nfl_player_data.csv', function (player) {
    /* Needed to filter out players born before 1900 because don't have
     * life expectancy data for them. */
    if (player.birth_year < 1900) return;

    /* Fill in the player info */
    var playerInfo = {
      name: player.actual_name,
      deathYear: +player.death_year,
      deathAge: +player.death_age,
      birthYear: +player.birth_year
    };
    players.push(playerInfo);
  }, function(error, rows) {
    /* Player data is loaded */
    if (error) {
      console.log('Error loading player data: ', error);
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
  calculate();
  makeDOMRepresentation();
};

/* Calculate the difference between how long a player lived and their life expectancy based on their birth year. */
var points = new Array();
var calculate = function(){
  for(var i = 0 ; i < players.length; i++){
    var p = new Array();
    p.push(players[i].birthYear);
    p.push(players[i].deathAge - players[i].lifeExpectancy);
    points.push(p);
  }
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
}

/* Add listener to load data on content ready */
window.addEventListener("DOMContentLoaded", init, false);
