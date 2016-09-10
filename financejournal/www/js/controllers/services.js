/**
 * Created by patri on 7/19/2016.
 */
angular.module('financeJournal.services', [])

  .factory('Finances', function($http, $log, MassageService) {

    return {
      all : function(callback) {
        console.log('All is running!');

        //TODO: there has to be a better place to put this url, config file, or something
        $http.get('http://172.20.3.80:3000/api/entries').then(function(resp){
          //console.log('Success', resp.data); // JSON object
          $log.debug('Got the data: ' + JSON.stringify(resp));
          callback(null, resp.data);
        }, function(err){
          $log.error('Got an error trying to call the service: ' + err);
          callback(err);
        });
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
      range : function(callback, dateRangeObj) {
        $log.debug('Querying for date range: ' + JSON.stringify(dateRangeObj));

        //TODO: Same as above, should realy store the address for the backend as a property
        $http.post('http://172.20.3.80:3000/api/entries/dateRange', dateRangeObj).then(
          function(data) {
            $log.debug('Got the data: ' + JSON.stringify(data));
            callback(null, data);
          },
          function(err) {
            $log.error('Got an error trying to query for a range: ' + err);
            callback(err, null);
          }
        );
      },
      put : function(entryToAdd) {
        console.log('Putting: ' + JSON.stringify(entryToAdd));
        
        //call the backend to add the entry 
        $http.post('http://localhost:3000/api/entries', entryToAdd).then(function(resp) {
          $log.debug('Got the data: ' + JSON.stringify(resp));

          //put it into our current array
          callback(null, resp.data, false);
        });
        
      },
      post : function(updatedEntry, callback) {
        console.log('Posting: ' + JSON.stringify(updatedEntry));

        var urlToPost = 'http://localhost:3000/api/entries/' + updatedEntry._id;
        console.log('Posting to: ' + urlToPost);
        $http.post(urlToPost, updatedEntry).then(function(resp) {
          $log.debug('Response from the server: ' + JSON.stringify(resp));

          if (resp.status === 200) {
            $log.debug('Got the positive response');

            //put the updated entry into our array
            callback(null, updatedEntry, true);
          }
          else {
            callback('Error code: ' + resp.status, null, null);
          }
          
        })
      }
    };
  })

  .service('MassageService', function($log) {
    /**
     * Function used to massage the entry array
     *
     * @param entries - the entries to be massaged - assumed to be sorted
       */
    this.massageEntryArray = function(entries, startingBalance) {
      //create a javascript date object for today
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var pastToday = false;
      var balance = 0;

      if (startingBalance) {
        balance = startingBalance;
      }
      else if (entries.length > 0 && entries[0].balance) {
        //TODO: subtracting the amount is a stupid hack - but it'll work for now!
        balance = entries[0].balance - entries[0].amount;
      }
      
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
