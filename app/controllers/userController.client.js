'use strict';

(function () {
   
   var hideOnLoginElems = document.querySelectorAll('.hide-on-login');
   var showOnLoginElems = document.querySelectorAll('.show-on-login');
   var createForm = document.querySelector('#create-form') || null;
   var voteForm = document.querySelector('#vote-form') || null;
   var apiUrl = appUrl + '/api/user';
   
   function showElems (elems) {
      for (var i = 0; i < elems.length; i++) {
         elems[i].classList.remove('hidden');
      }
   }
   
   ajaxFunctions.ready(function() {
      
      if (createForm) {
         createForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var formData = new FormData(createForm);
            ajaxFunctions.ajaxRequestWithData('POST', appUrl + '/api/poll', formData, function (res) {
               res = JSON.parse(res);
               
               if (res.error) {
                  alert(res.error);
               } else if (res.path) {
                  alert('Poll created');
                  window.location = appUrl + res.path;
               } else {
                  alert('Something weird happened');
               }
            });
         });
      }
      
      if (voteForm) {
         voteForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var formData = new FormData(voteForm);
            ajaxFunctions.ajaxRequestWithData('POST', appUrl + '/api/vote', formData, function (res) {
               res = JSON.parse(res);
               
               if (res.error) {
                  alert(res.error);
               } else if (res.path) {
                  alert('Vote succeeded');
                  window.location = appUrl + res.path;
               } else {
                  alert('Something weird happened');
               }
            });
         });
      }
      
      ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
         var userObject = JSON.parse(data);
         
         // Note: setting display to an empty string reverts display to default 
         // for that DOM element.
         if (userObject.hasOwnProperty('twitter')) {
            showElems(showOnLoginElems);
         } else {
            showElems(hideOnLoginElems);
         }
      });
   });
})();
