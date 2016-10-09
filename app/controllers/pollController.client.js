'use strict';

(function () {
    
    var pollList = document.querySelector('#poll-list') || null;
    var apiUrl = appUrl + '/api/poll';
    
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
        
        if (pollList) {
            data = JSON.parse(data);
            var newHtml = "";
            for (var i = 0; i < data.length; i++) {
                newHtml += '<a href="/poll/'+data[i]._id+'"><div class="row"><div class="col-xs-12"><p>'+data[i].question+'</p></div></div></a>';
            }
            pollList.innerHTML = newHtml;
        }
    }));
})();