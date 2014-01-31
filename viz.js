/*
 * Logic for D3 visualization of NFL data.
 * For CS 199, Spring 2014.
 * Authors: Jay Bensal, Raj Ramamurthy
 */

/* Data storage */
var players = new Array(); // array of all the players
var lives = {};            // dictionary of years and life expectancies

/* Load in the player data */
var loadPlayerData = function() {
  d3.csv("nfl_player_data.csv", function (player) {
    /* Fill in the player info */
    var playerInfo = {
      actual_name: player.actual_name,
      death_year: +player.death_year,
      death_age: +player.death_age,
      birth_year: +player.birth_year
    };
    players.push(playerInfo);
  }, function(error, rows) {
    /* Data is loaded */
    if (error) {
      console.log("Error loading player data: ", error);
    }
    loadLifeExpectancy();
  });
};

/* Load in life expectancy data */
var loadLifeExpectancy = function() {
  d3.csv("life_expectancy.csv", function(data) {
    lives[data.year] = parseFloat(data.male_life_expectancy);
  }, function(error, rows) {
    if (error) {
      console.log("Error loading life expectancy data:", error);
    }
    dataIsLoaded();
  });
};

/* The data is loaded at this point. */
var dataIsLoaded = function() {
  console.log("All data loaded.");
  console.log("Players:", players);
  console.log("Lives:", lives);
};

/* Run once the DOM is ready. */
var init = function() {
  loadPlayerData();
};

/* Add listener to load data on content ready */
window.addEventListener("DOMContentLoaded", init, false);
