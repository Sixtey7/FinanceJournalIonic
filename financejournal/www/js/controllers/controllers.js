/**
 * Created by patri on 7/19/2016.
 */
angular.module('financeJournal.controllers', [])

  .controller('viewFinancesController', function ($scope, $stateParams, $log, $ionicModal, Finances, MassageService) {

    /******************************
     * Initial Standup of the Modal
     */
     $ionicModal.fromTemplateUrl('templates/transactionForm.html', {
      scope : $scope,
      animation : 'slide-in-up'
    }).then(function(modal) {
      $scope.transactionModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/filterDateEntry.html', {
      scope : $scope,
      animation : 'slide-in-up'
    }).then(function (modal) {
      $scope.filterModal = modal;
    });

    /******************************
     * Callback Method for Getting All Entries
     * @param err err if an error was returned from the service
     * @param entries the entries retrieved from the backend
       */
     var handleDataResponse = function(err, entries, startingBalance) {
      if (err) {
        console.log('Got an error: ' + err)
      }
      else {
        $scope.finances = MassageService.massageEntryArray(entries, startingBalance);
      }
    };

    var handleFilterResponse = function(err, response) {
      if (err) {
        $log.error('Got an error: ' + err);
      }
      else {
        handleDataResponse(null, response.entryArray, response.startingBalance);
      }
    }

    /******************************
     * Generic Form Crap
     */
    $scope.submitEntryForm = function() {
      if ($scope.formEditMode) {
        $log.debug('Edit Form Submitted');
        $scope.commitEditTransaction();
      }
      else {
        $log.debug('Create Form Submitted');
        $scope.addNewTransaction();
      }
    };


    $scope.cancelTransactionForm = function() {
      $log.debug('Cancel the transaction form');
      $scope.formEntry = {};
      $scope.transactionModal.hide();
    };

    /******************************
     * Transaction Add Crap
     */
     $scope.newTransaction = function() {
      $log.debug('New Transaction Is Running!');
      $scope.formEntry = {};
      $scope.formEditMode = false;

      $scope.transactionModal.show();
      document.getElementById('datePicker').valueAsDate = new Date();

     };

    $scope.addNewTransaction = function() {
      $log.debug('Posted new entry: ' + JSON.stringify(this.formEntry));

      //Posted: {"source":"Source","amount":1209,"date":"2016-07-22T06:00:00.000Z","estimate":true,"planned":true,"notes":"Notes"}
      var entryToAdd = {
        source : this.formEntry.source,
        amount : this.formEntry.amount,
        date : this.formEntry.date,
        estimate : this.formEntry.estimate,
        planned : this.formEntry.planned,
        notes : this.formEntry.notes
      };

      $scope.transactionModal.hide();

      $log.debug('Created the entry: ' + JSON.stringify(entryToAdd));
      Finances.put(entryToAdd);
    };

    /******************************
     * Edit transaction crap
     */
    $scope.editEntry = function(entryToEdit) {
        $log.debug('The user has selected to edit the entry: ' + JSON.stringify(entryToEdit));

        $scope.formEntry = {
          source : entryToEdit.source,
          amount : entryToEdit.amount,
          date : new Date(entryToEdit.date),
          estimate : entryToEdit.estimate,
          planned : entryToEdit.planned,
          notes : entryToEdit.notes
        };

        $scope.formEditMode = true;
        $scope.transactionModal.show();
    };

    $scope.commitEditTransaction = function() {
      $log.debug('Posted to edit: ' + JSON.stringify(this.formEntry));
    };

    $scope.deleteEntry = function(entryToDelete) {
      $log.debug('The user has selected to delete the entry: ' + JSON.stringify((entryToDelete)));

      
    };

    /******************************
     * Filter Form Crap
     */
    $scope.showFilterDialog = function() {
      $log.debug('The user has selected to filter the entries');

      $scope.dateFilterEntry = {};

      //might want to change the default range to be a few days, month, something like that 
      $scope.dateFilterEntry.startDate = new Date();
      $scope.dateFilterEntry.endDate = new Date();

      $scope.filterModal.show();

    }

    $scope.cancelFilterForm = function() {
      $log.debug('The user has selected to cancel the filter form');

      $scope.dateFilterEntry = {};
      $scope.filterModal.hide();
    }

    $scope.submitFilterForm = function() {
      $log.debug('The user selected to filter: ' + JSON.stringify($scope.dateFilterEntry));

      //deep copy the object so that we don't have to worry about losing
      var dateFilterObj = JSON.parse(JSON.stringify($scope.dateFilterEntry));

      $scope.filterModal.hide();

      Finances.range(handleFilterResponse, dateFilterObj);
    }


    $scope.onHold = function() {
      $log.debug('DETECTED ON HOLD');
    }

      /******************************
       * Modal Maintenance
       */
    $scope.$on('$destroy', function() {
        $scope.transactionModal.remove();
        $scope.filterModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });


      /*******************************
       * Initial Setup
       */
    console.log('Standing up the View Finances Controller!');
    Finances.all(handleDataResponse);
    console.log('Post finances');
  });
