'use strict';

(function () {
   
   var hideOnLoginElems = document.querySelectorAll('.hide-on-login');
   var showOnLoginElems = document.querySelectorAll('.show-on-login');
   var apiUrl = appUrl + '/api/:id';
   
   function changeDisplayElems (elems, newDisplay) {
      for (var i = 0; i < elems.length; i++) {
         elems[i].style.display = newDisplay;
      }
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
      var userObject = JSON.parse(data);
      
      // Note: setting display to an empty string reverts display to default 
      // for that DOM element.
      if (userObject.hasOwnProperty('twitter')) {
         changeDisplayElems(showOnLoginElems, '');
         changeDisplayElems(hideOnLoginElems, 'none');
      } else {
         changeDisplayElems(hideOnLoginElems, '');
         changeDisplayElems(showOnLoginElems, 'none');
      }
   }));
})();
