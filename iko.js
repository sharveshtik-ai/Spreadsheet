window.onerror = function (message, source, lineno, colno, error) {
    alert("Script error on line " + lineno + ": " + message);
};

let activeExcelId = localStorage.getItem("activeExcelId");
let files = JSON.parse(localStorage.getItem("excelFiles")) || [];

let currentFile = files.find(function (file) {
    return file.id === activeExcelId;
});

if (!currentFile) {

    alert("Excel file not found! Go back to the dashboard and open a file from there.");

} else {

    // ============================================
    // DASHBOARD + DOWNLOAD WIRED FIRST, NO MATTER WHAT
    // ============================================

    document.getElementById("dashboardButton").onclick = function () {
        saveCurrentFile();
        window.location.href = "dashboard.html";
    };

    document.getElementById("homeButton").onclick = function () {
        saveCurrentFile();
        window.location.href = "dashboard.html";
    };

    document.getElementById("downloadButton").onclick = function () {

        saveCurrentFile();

        let csv = "";

        for (let i = 0; i < currentFile.rows; i++) {

            let row = [];

            for (let j = 0; j < currentFile.cols; j++) {

                let cellId = i + "-" + j;
                let value = currentFile.data[cellId];

                if (value === undefined) value = "";

                value = String(value).replace(/"/g, '""');

                row.push('"' + value + '"');
            }

            csv += row.join(",") + "\r\n";
        }

        let dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);

        let link = document.createElement("a");
        link.setAttribute("href", dataUri);
        link.setAttribute("download", currentFile.name + ".csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

   
    if (!currentFile.data) currentFile.data = {};

    let rows = currentFile.rows;
    let cols = currentFile.cols;

    let spreadsheet = document.getElementById("spreadsheet");
    spreadsheet.style.gridTemplateColumns = "40px repeat(" + cols + ", 100px)";

    function saveCurrentFile() {

        let files = JSON.parse(localStorage.getItem("excelFiles")) || [];

        files = files.map(function (file) {
            return file.id === currentFile.id ? currentFile : file;
        });

        localStorage.setItem("excelFiles", JSON.stringify(files));
    }

    function createGrid() {

        spreadsheet.innerHTML = "";

        let blankSpace = document.createElement("div");
        blankSpace.classList.add("bnkspc");
        blankSpace.style.width = "40px";
        blankSpace.style.height = "30px";
        blankSpace.style.border = "1px solid black";
        spreadsheet.appendChild(blankSpace);

        for (let j = 0; j < cols; j++) {
            let cellheader = document.createElement("div");
            cellheader.className = "cell";
            cellheader.textContent = String.fromCharCode(65 + j);
            spreadsheet.appendChild(cellheader);
        }

        for (let i = 0; i < rows; i++) {

            let rowHeader = document.createElement("div");
            rowHeader.className = "cell header row-header";
            rowHeader.textContent = i + 1;
            spreadsheet.appendChild(rowHeader);

            for (let j = 0; j < cols; j++) {

                let cell = document.createElement("div");
                cell.className = "cell";
                cell.contentEditable = true;

                let cellId = i + "-" + j;

                if (currentFile.data[cellId] !== undefined) {
                    cell.textContent = currentFile.data[cellId];
                }

                cell.addEventListener("click", function () {

                    if (i == rows - 1 && j == cols - 1) {
                        rows++;
                        currentFile.rows = rows;
                        saveCurrentFile();
                        createGrid();
                    }

                    document.querySelectorAll(".cell").forEach(function (c) {
                        c.classList.remove("selected");
                    });

                    cell.classList.add("selected");
                });

                cell.addEventListener("input", function () {
                    currentFile.data[cellId] = cell.textContent;
                    saveCurrentFile();
                });

                cell.addEventListener("keydown", function (event) {
                    if (event.key == "Enter") {
                        event.preventDefault();
                        if (i == rows - 1 && j == cols - 1) {
                            rows++;
                            currentFile.rows = rows;
                            saveCurrentFile();
                            createGrid();
                        }
                    }
                });

                spreadsheet.appendChild(cell);
            }
        }
    }

    let nameField = document.getElementById("excelNameDisplay");
    nameField.value = currentFile.name;
    nameField.addEventListener("input", function () {
        let trimmed = nameField.value.trim();
        if (trimmed) {
            currentFile.name = trimmed;
            saveCurrentFile();
        }
    });

    let fileButton = document.getElementById("file-button");
    let fileMenu = document.getElementById("fileMenu");

    fileButton.addEventListener("click", function (event) {
        event.stopPropagation();
        fileMenu.style.display = (fileMenu.style.display == "block") ? "none" : "block";
    });

    document.addEventListener("click", function () {
        fileMenu.style.display = "none";
    });

    document.getElementById("saveOption").onclick = function () {
        saveCurrentFile();
        fileMenu.style.display = "none";
    };

    document.getElementById("closeOption").onclick = function () {
        saveCurrentFile();
        window.location.href = "dashboard.html";
    };

    document.getElementById("printButton").onclick = function () {
        window.print();
    };

    createGrid();
}