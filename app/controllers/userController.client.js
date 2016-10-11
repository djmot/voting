'use strict';

(function () {
   
   var hideOnLoginElems = document.querySelectorAll('.hide-on-login');
   var showOnLoginElems = document.querySelectorAll('.show-on-login');
   var choiceCreate = document.querySelector('#choice-create') || null;
   var apiUrl = appUrl + '/api/user';
   
   function showElems (elems) {
      for (var i = 0; i < elems.length; i++) {
         elems[i].classList.remove('hidden');
      }
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
      var userObject = JSON.parse(data);
      
      // Note: setting display to an empty string reverts display to default 
      // for that DOM element.
      if (userObject.hasOwnProperty('twitter')) {
         showElems(showOnLoginElems);
      } else {
         showElems(hideOnLoginElems);
      }
   }));
})();
