/**
 * Created by patri on 7/19/2016.
 */
angular.module('financeJournal.services', [])

  .factory('Finances', function($http, $log, MassageService) {
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
      all : function(callback) {
        console.log('All is running1');
/*
        $http.get('http://localhost:3000/api/entries').then(function(resp){
          //console.log('Success', resp.data); // JSON object
          $log.debug('Got the data: ' + JSON.stringify(resp));
          callback(null, resp.data);
        }, function(err){
          $log.error('Got an error trying to call the service: ' + err);
          callback(err);
        });
*/
        //TODO: Use this for deploying to my phone until after vacation
        callback(null, currentFinances);
        //TODO - End

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
        //console.log('Determined the max id to be: ' + maxId);
        //TODO: End TODO
        //entryToAdd.id = maxId + 1;
        //deep copy into array
        //currentFinances.push(JSON.parse(JSON.stringify(entryToAdd)));


        //call the backend to add it

        //put it into our current array
        MassageService.placeElementIntoPosition(currentFinances, entryToAdd, false);
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

        console.log('Determined the current position to be: ' + currentIndex);

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

  .service('MassageService', function($log) {
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

    };

    this.placeElementIntoPosition = function(entryArray, entryToPlace, needToRemove) {
      if (entryArray.length > 0) {
        //TODO: This is the same todo as the web frontend - we could probably combine these two for loops
        var oldLoc = -1;
        if (needToRemove) {
          //try to find the original position
          for (var index = 0; index < entryArray.length; index++) {
            if (entryArray[index].id === entryToPlace.id) {
              oldLoc = index;
              break;
            }
          }
        }

        //find the location to insert the entry
        var insertLoc = 0;
        entryToPlace.date=  new Date(entryToPlace.date);
        $log.debug('Comparing: ' + entryToPlace.date + ' to ' + entryArray[insertLoc].date);
        while (entryToPlace.date >= entryArray[insertLoc].date) {
          insertLoc++;

          if (insertLoc === entryArray.length) {
            $log.debug('Breaking at: ' + insertLoc);
            break;
          }
          else {
            $log.debug('Comparing: ' + entryToPlace.date + ' to ' + entryArray[insertLoc].date);
          }
        }

        $log.debug('Old Loc: ' + oldLoc);
        $log.debug('New Loc: ' + insertLoc);

        if (oldLoc >= 0) {
          if (insertLoc === oldLoc) {
            $log.debug('Old location matched the new one --- overwriting');
//            entryArray[insertLoc] = JSON.parse(JSON.stringify(entryToPlace));
              entryArray[insertLoc] = entryToPlace;
          }
          else {
            //first, we need to remove it from it's old location
            if (oldLoc < insertLoc) {
              //add the new one in, then remove the old one
              entryArray.splice(insertLoc, 0, entryToPlace);
              entryArray.splice(oldLoc, 1);
            }
            else {
              entryArray.splice(oldLoc,1);
              entryArray.splice(insertLoc, 0, entryToPlace);
            }
          }
        }
        else {
          //don't need to worry about removing anything
          entryArray.splice(insertLoc, 0, entryToPlace);
        }
      }
    }
  });
