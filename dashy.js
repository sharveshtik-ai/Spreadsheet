let button = document.getElementById("Create");

button.addEventListener("click", function () {

    let name = document.getElementById("excelName").value;
    let rows = Number(document.getElementById("rows").value);
    let cols = Number(document.getElementById("cols").value);

    // Get all existing Excel files
    let files = JSON.parse(localStorage.getItem("excelFiles")) || [];

    // Create a unique ID for this Excel
    let id = Date.now().toString();

    // Create the new Excel file
    let newFile = {
        id: id,
        name: name,
        rows: rows,
        cols: cols,
        data: {}
    };

    // Add the new file to the list
    files.push(newFile);

    // Save the complete list
    localStorage.setItem("excelFiles", JSON.stringify(files));

    // Create the file card
    createFileCard(newFile);

    // Clear inputs
    document.getElementById("excelName").value = "";
    document.getElementById("rows").value = "";
    document.getElementById("cols").value = "";
});


// Function to create a file card
function createFileCard(fileData) {

    let fileContainer = document.getElementById("fileContainer");

    let file = document.createElement("div");

    file.classList.add("file");

    file.innerHTML = `
        <h2>${fileData.name}</h2>
        <p>${fileData.rows} rows x ${fileData.cols} cols</p>

        <button class="openButton">Open</button>

        <button class="deleteButton">Delete</button>
    `;

    fileContainer.appendChild(file);


    // OPEN BUTTON
    let openButton = file.querySelector(".openButton");

    openButton.addEventListener("click", function () {

        // Remember which Excel we opened
        localStorage.setItem("activeExcelId", fileData.id);

        window.open("new.html", "_blank");
    });


    // DELETE BUTTON
    let deleteButton = file.querySelector(".deleteButton");

    deleteButton.addEventListener("click", function () {

        // Get all files
        let files = JSON.parse(localStorage.getItem("excelFiles")) || [];

        // Remove this file
        files = files.filter(function (item) {
            return item.id !== fileData.id;
        });

        // Save the new list
        localStorage.setItem("excelFiles", JSON.stringify(files));

        // Remove the card from dashboard
        file.remove();
    });
}


// LOAD ALL SAVED FILES WHEN DASHBOARD OPENS
let savedFiles = JSON.parse(localStorage.getItem("excelFiles")) || [];

savedFiles.forEach(function (fileData) {
    createFileCard(fileData);
});