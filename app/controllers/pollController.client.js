'use strict';

(function () {
    
    var pollList = document.querySelector('#poll-list') || null;
    var pollData = document.querySelector('#poll-data') || null;
    var apiUrl = appUrl + '/api/poll';
    
    if (pollData) {
        var str = window.location.pathname;
        var qStr;
        for (var i = str.length; i >= 0; i--) {
            if (str.charAt(i) === '/') {
                qStr = str.slice(i+1);
                break;
            }
        } 
        if (qStr) {
            apiUrl += '?id=' + qStr;
        }
    }
    
    // By setting apiUrl, data will be either the list of polls or a single poll
    // document, as appropriate for the html page.
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
        
        if (pollList) {
            data = JSON.parse(data);
            var newHtml = "";
            for (var i = 0; i < data.length; i++) {
                newHtml += '<a href="/poll/'+data[i]._id+'"><div class="row"><div class="col-xs-12"><p>'+data[i].question+'</p></div></div></a>';
            }
            pollList.innerHTML = newHtml;
        }
        
        if (pollData) {
            var dataJson = JSON.parse(data);
            if (dataJson.hasOwnProperty('question'))  {
                pollData.innerHTML = data;
            } else {
                pollData.innerHTML = 'Poll not found.';
            }
        }
    }));
})();