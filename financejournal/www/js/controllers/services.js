/**
 * Created by patri on 7/19/2016.
 */
angular.module('financeJournal.services', [])

  .factory('Finances', function() {
    //this is a pretty temp hack, eventually we'll need to call out to some services
    var currentFinances = [{
      "id" : 0,
      "source" : "Starting Balance",
      "amount" : 10000,
      "estimate" : false,
      "notes" : "Gotta Start Somewhere",
      "date" : "2016-04-01T00:00:00.000Z"
    },{
      "id" : 1,
      "source" : "GEEFCU Xfer",
      "amount" : -2000,
      "estimate" : false,
      "notes" : "awesome!",
      "date" : "2016-04-02T00:00:00.000Z"
    },{
      "id" : 2,
      "source" : "Rent",
      "amount" : -1500,
      "estimate" : false,
      "notes" : "awesome!",
      "date" : "2016-04-05T00:00:00.000Z"
    }, {
      "id" : 3,
      "source": "Pay Chase",
      "amount": -1775,
      "estimate": true,
      "notes": "total guess",
      "date": "2016-04-15T00:00:00.000Z"
    },{
        "id" : 4,
        "source": "Paycheck",
        "amount": 1500,
        "estimate": true,
        "planned" : true,
        "notes": "money money money",
        "date": "2016-04-16T00:00:00.000Z"
    }];

    return {
      all : function() {
        console.log('All is running1');
        return currentFinances;
      },
      remove : function(entryToRemove) {
        currentFinances.splice(currentFinances.indexOf(entryToRemove), 1);
      },
      get : function (entryId) {
        var idToFind = parseInt(entryId);
        console.log('Getting entry for id: ' + idToFind);
        for (var i = 0; i < currentFinances.length; i++) {
          if(currentFinances[i].id === idToFind) {
            return currentFinances[i];
          }
        }

        return null;
      },
      put : function(entryToAdd) {
        console.log('Putting: ' + JSON.stringify(entryToAdd));
        //assign an id
        //TODO: This will eventually be removed as we'll allow the backend to assign the id
        var maxId = currentFinances[currentFinances.length - 1].id;
        console.log('Determined the max id to be: ' + maxId);
        //TODO: End TODO
        entryToAdd.id = maxId + 1;
        //deep copy into array
        currentFinances.push(JSON.parse(JSON.stringify(entryToAdd)));
      },
      post : function(updatedEntry) {
        console.log('Posting: ' + JSON.stringify(updatedEntry));

        //find the current entry
        var currentIndex = -1;

        //for some reason, everything in my list becomes a string
        for (var i = 0; i < currentFinances.length; i++) {
          if (currentIndex[i].id === updatedEntry.id) {
            currentIndex = i;
            break;
          }
        }

        console.log('Determined the cuurent position to be: ' + currentIndex);

        if (currentIndex > 0) {
          currentFinances[currentIndex] = JSON.parse(JSON.stringify(updatedEntry));
        }
        else {
          console.log('WARNING: Did not find a current index for posted entry!');
          this.put(updatedEntry);
        }
      }
    };
  })

  .service('MassageService', function() {
    /**
     * Function used to massage the entry array
     *
     * @param entries - the entries to be massaged - assumed to be sorted
       */
    this.massageEntryArray = function(entries) {
      //create a javascript date object for today
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var pastToday = false;
      var balance = 0;

      for (var i = 0; i < entries.length; i++) {
        balance = balance + entries[i].amount;

        console.log('Created the balance: ' + balance);

        entries[i].balance = balance;
        entries[i].date = new Date(entries[i].date);

        if (!pastToday) {
          //check if we have passed today
          if (entries[i].date < today) {
            entries[i].past = true;
            if ((!entries[i].estimate) && (!entries[i].planned)) {
              entries[i].done = true;
            }
            else {
              entries[i].done = false;
            }
          }
          else {
            pastToday = true;
            entries[i].past = false;
            entries[i].done = false;
          }
        }
        else {
          entries[i].past = false;
          entries[i].done = false;
        }
      }

      return entries;

    }
  });
