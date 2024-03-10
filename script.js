function fetchSuggustions(){
    fetch('./data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            myQueries = data;
            suggestions = Object.keys(myQueries);
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
        });
    }


// getting all required elements
const searchInput = document.querySelector(".searchInput");
const input = searchInput.querySelector("input");
const resultBox = searchInput.querySelector(".resultBox");
const icon = searchInput.querySelector(".icon");
let linkTag = searchInput.querySelector("a");
var table = document.getElementById("myTable");
var panel = document.getElementById("code-panel");
let webLink;

// if user press any key and release
input.onkeyup = (e)=>{
    let userData = e.target.value; //user enetered data
    let emptyArray = [];
    if(userData){
        emptyArray = suggestions.filter((data)=>{
            //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()); 
        });
        emptyArray = emptyArray.map((data)=>{
            // passing return data inside li tag
            return data = '<li>'+ data +'</li>';
        });
        searchInput.classList.add("active"); //show autocomplete box
        showSuggestions(emptyArray);
        let allList = resultBox.querySelectorAll("li");
        for (let i = 0; i < allList.length; i++) {
            //adding onclick attribute in all li tag
            allList[i].setAttribute("onclick", "selectSuggestion(this)");
        }
    }else{
        searchInput.classList.remove("active"); //hide autocomplete box
    }
}

function showSuggestions(list){
    let listData;
    if(!list.length){
        userValue = input.value;
        listData = '<li>'+ userValue +'</li>';
    }else{
        listData = list.join('');
    }
    resultBox.innerHTML = listData;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/'/g, '&apos;')
              .replace(/"/g, '&quot;');
}

function selectSuggestion(element){
    input.value = element.innerHTML;
    panel.innerHTML = escapeHtml(' @prefix dbr:<http://dbpedia.org/resource/>\n@prefix dbo:<http://dbpedia.org/ontology/>\n@prefix dbp:<http://dbpedia.org/property/>\n@prefix rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\n' + myQueries[element.innerHTML]);
    highlightLines();
    searchInput.classList.remove("active");
    executeSPARQLQuery(myQueries[element.innerHTML]);
}












function deleteRow(r) {

    var parent = r.parentNode;
    var i = Array.from(parent.children).indexOf(r);
    console.log(i);
    console.log(parent);
    parent.deleteRow(i);
    
  }
  
  function editText(tableCell) {
    var txt = tableCell.innerText || tableCell.textContent;
    tableCell.innerText = tableCell.textContent = "";
    var input = document.createElement("input");
    input.type = "text";
    tableCell.appendChild(input);
    input.value = txt;
    input.focus();
    input.onblur = function() {
      tableCell.innerText = input.value;
      tableCell.textContent = input.value;
    }
  }
  
  function leaveCell(tableCell) {
    tableCell.innerText = input.value;
    tableCell.textContent = input.value;
  }



function executeSPARQLQuery(sparqlQuery) {
    var sparqlEndpoint = 'https://dbpedia.org/sparql';
    $.ajax({
        type: 'GET',
        url: sparqlEndpoint + '?query=' + encodeURIComponent(sparqlQuery),
        dataType: 'json',
        success: function (data) {
            // Process SPARQL query results and generate table headers and rows
            var results = data.results.bindings;
            var tableHeaders = $('#tableHeaders');
            var tableBody = $('#myTable tbody');
            tableHeaders.empty();
            tableBody.empty();

            // Add table headers dynamically based on the first result
            for (var key in results[0]) {
                if (results[0].hasOwnProperty(key)) {
                    tableHeaders.append('<th>' + key + '</th>');
                }
            }
            tableHeaders.append('<th>Delete Row</th>');
            // Iterate through the results and create table rows
            for (var i = 0; i < results.length; i++) {
                var row = '<tr>';
                for (var key in results[i]) {
                    if (results[i].hasOwnProperty(key)) {
                        row += '<td>' + results[i][key].value + '</td>';
                    }
                }
                row += '<td class="delete_row">x</td>'
                row += '</tr>';
                tableBody.append(row);
            }

            document.querySelectorAll('.delete_row').forEach(function(element){
                element.addEventListener('click', function() {
                    deleteRow(element.parentElement);
                  }, false)
            })

            document.querySelectorAll('td').forEach(function(element){
                element.addEventListener('click', function() {
                    editText(element);
                  }, false)
            })
        },
        error: function (error) {
            console.error('Error fetching SPARQL data:', error);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const query = 'SELECT  ?country ?population\
    WHERE {\
      ?city a dbo:City.\
      ?city dbo:country ?country.\
      ?city dbo:populationTotal ?population.\
    }\
    LIMIT 10';
    await executeSPARQLQuery(query);
    fetchSuggustions();
});