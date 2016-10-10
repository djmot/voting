'use strict';

(function () {
    
    var pollList = document.querySelector('#poll-list') || null;
    var pollQuestion = document.querySelector('#poll-question') || null;
    var apiUrl = appUrl + '/api/poll';
    
    var pollId = '';
    if (pollQuestion) {
        var str = window.location.pathname;
        for (var i = str.length; i >= 0; i--) {
            if (str.charAt(i) === '/') {
                pollId = str.slice(i+1);
                break;
            }
        } 
        if (pollId.length > 0) {
            apiUrl += '?id=' + pollId;
        }
    }
    
    function getColors (n) {
        var colors = [];
        for (var i = 0; i < n; i++) {
            colors.push(
            "rgba("+Math.floor(256*Math.random()).toString()+","+Math.floor(256*Math.random()).toString()+","+Math.floor(256*Math.random()).toString()+",0.5)"
            );
        }
        return colors;
    }
    
    // By setting apiUrl, data will be either the list of polls or a single poll
    // document, as appropriate for the html page.
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
        
        if (pollList) {
            data = JSON.parse(data);
            var newHtml = '';
            for (var i = 0; i < data.length; i++) {
                newHtml += '<a href="/poll/'+data[i]._id+'"><div class="row"><div class="col-xs-12"><p>'+data[i].question+'</p></div></div></a>';
            }
            pollList.innerHTML = newHtml;
        }
        
        if (pollQuestion) {
            data = JSON.parse(data);
            
            // If poll wasn't found, redirect to home page.
            if (!data.hasOwnProperty('question'))  {
                console.log('Poll not found, redirecting...');
                return window.location = appUrl;
            } else {
                
                // Extract poll data and populate standard html objects.
                var choiceSelect = document.querySelector('#choice-select');
                
                pollQuestion.innerHTML = data.question;
                for (var i = 0; i < data.choiceList.length; i++) {
                    choiceSelect.innerHTML += '<option>'+data.choiceList[i].choice+'</option>';
                }
                
                document.querySelector('#poll-id').value = pollId;
                
                // Build the chart using charts.js.
                var labels = [];
                var chartData = [];
                for (var i = 0; i < data.choiceList.length; i++) {
                    labels.push(data.choiceList[i].choice);
                    chartData.push(data.choiceList[i].votes);
                }
                
                var ctx = document.querySelector('#chart');
                var chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '# of Votes',
                            data: chartData,
                            backgroundColor: getColors(data.choiceList.length)
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });
                
                /*
                // Add custom 'click' listener to 'Vote' button.
                document
                    .querySelector('#vote-button')
                    .addEventListener('click', function () {
                        // Request 'POST' to '/api/vote' with a 'vote'
                        // object containing info to update poll doc.
                        var voteObject = {
                            id: pollId,
                            form: {
                                choiceSelect: document.querySelector('#choice-select').value,
                                choiceCreate: document.querySelector('#choice-create').value,
                            }
                        };
                        
                        ajaxFunctions.ajaxRequest('POST', appUrl + '/api/vote', function (res) {
                            console.log('I just voted, I\'m so cool :)');
                        });
                    });
                    */
            }
        }
    }));
})();