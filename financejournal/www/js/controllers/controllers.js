/**
 * Created by patri on 7/19/2016.
 */
angular.module('financeJournal.controllers', [])

  .controller('viewFinancesController', function ($scope, $stateParams, Finances, MassageService) {

    console.log('Standing up the View Finances Controller!');
    $scope.finances = MassageService.massageEntryArray(Finances.all());
    console.log('Post finances');
  });
