/**
 * Created by patri on 7/19/2016.
 */
angular.module('financeJournal', ['ionic', 'financeJournal.controllers','financeJournal.services'])

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app.viewFinances', {
      url: '/viewFinances',
      views: {
        'mainView' : {
          templateUrl: 'templates/transactionList.html',
          controller: 'viewFinancesController'
        }
      }
    });

     // $urlRouterProvider.otherwise('/app/viewFinances');
  });
