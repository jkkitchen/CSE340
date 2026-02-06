'use strict' //tells JS parser to follow all rules strictly
 
 // Get a list of items in inventory based on the classification_id 
 let classificationList = document.querySelector("#classificationList")
 
//Add eventListener for any change made
classificationList.addEventListener("change", function () { 
    //Stores new value from classification select element (dropdown)
    let classification_id = classificationList.value 
    //Test
    console.log(`classification_id is: ${classification_id}`) 
    
    //URL to request inventory data from inventory controller
    let classIdURL = "/inv/getInventory/" + classification_id 
    
    //Asynchronous JS request (fetch), .then waits for data to be returned from the fetch
    fetch(classIdURL) 
        .then(function (response) { 
            if (response.ok) { 
                //JSON object returned is converted to a JS object and sent to next .then statement
                return response.json(); 
            } 
            throw Error("Network response was not OK"); 
        }) 
        .then(function (data) { 
            //Test
            console.log(data);
            //Call function to build table
            buildInventoryList(data); 
        }) 
        .catch(function (error) { 
            console.log('There was a problem: ', error.message) 
        }) 
})

//Function to parse the data into HTML table elements and inject them into the inventory management view
function buildInventoryList(data) {
    let inventoryDisplay = document.getElementById("inventoryDisplay"); 
    // Set up the table labels 
    let dataTable = '<thead>'; 
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
    dataTable += '</thead>'; 
    // Set up the table body 
    dataTable += '<tbody>'; 
    // Iterate over all vehicles in the array and put each in a row 
    data.forEach(function (element) { 
        console.log(element.inv_id + ", " + element.inv_model); 
        dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
        dataTable += `<td><a href='/inv/edit/${element.inv_id}' class="table-link" title='Click to update'>Modify</a></td>`; 
        dataTable += `<td><a href='/inv/delete/${element.inv_id}' class="table-link" title='Click to delete'>Delete</a></td></tr>`; 
    }) 
    dataTable += '</tbody>'; 
    // Display the contents in the Inventory Management view 
    inventoryDisplay.innerHTML = dataTable;  
}