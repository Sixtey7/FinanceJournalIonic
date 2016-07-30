/**
 * Created by patri on 7/19/2016.
 */
angular.module('financeJournal', ['ionic', 'financeJournal.controllers','financeJournal.services','financeJournal.filters'])

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $stateProvider
    .state('app.viewFinances', {
      url: '/viewFinances',
      views: {
        'mainView' : {
          templateUrl: 'templates/addTransaction.html',
          controller: 'viewFinancesController'
        }
      }
    });

     $urlRouterProvider.otherwise('/app/viewFinances');

    $ionicConfigProvider.scrolling.jsScrolling(false);

  });
