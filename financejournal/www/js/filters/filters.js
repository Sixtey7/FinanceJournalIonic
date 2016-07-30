/**
 * Created by patri on 7/24/2016.
 */
var module = angular.module('financeJournal.filters', []);

  var MONTH_NAMES = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  module.filter('dateFilter', function() {
    return function(dateObj) {
      if (dateObj) {
        return MONTH_NAMES[dateObj.getMonth()] + ' ' + dateObj.getDate();
      }
      else {
        return '';
      }
    }
  })
