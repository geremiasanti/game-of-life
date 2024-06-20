class Cell {
    constructor() {
        this.htmlElement = document.createElement("div");;
        this.state = false;
        this.nextState = null;

        this.neighbors = new Array();
        this.liveNeighbors = 0;

        this.lastConfiguration = null;

        this.htmlElement.onclick = () => {
            this.updateCell(!this.state);
        };
    }

    updateCell(newState) {
        if(newState == this.state) 
            return;

        this.state = newState;
        this.updateCellStyle();

        let neighborsIncrement = newState ? 1 : -1;
        this.neighbors.forEach((neighbor) => {
            neighbor.incrementLiveNeighbors(neighborsIncrement);
        });
    }

    updateCellStyle() {
        if(this.state) {
            this.htmlElement.style.backgroundColor = "black"; 
        } else {
            this.htmlElement.style.backgroundColor = "white"; 
        }
    }

    incrementLiveNeighbors(increment) {
        this.liveNeighbors += increment;
    }

    nextGeneration() {
        this.updateCell(this.nextState)
        this.nextState = null;
    }
}

class Grid {
    constructor(htmlElement) {
        this.htmlElement = htmlElement; 

        let windowHeight = this.htmlElement.offsetHeight;
        let windowWidth = this.htmlElement.offsetWidth;
        let cellSizePx = 25;

        this.rows = Math.floor(windowHeight / cellSizePx);
        this.cols = Math.floor(windowWidth / cellSizePx);

        // init grid
        this.grid = new Array(this.rows).fill().map(
            (_) => new Array(this.cols).fill().map(
                (_) => new Cell()
            )
        );

        // reference neighbors
        for(let cellRow = 0; cellRow < this.rows; cellRow ++) {
            for(let cellCol = 0; cellCol < this.cols; cellCol++) {
                this.grid[cellRow][cellCol].neighbors = new Array();

                for(let row = cellRow - 1; row <= cellRow + 1; row++) {
                    for(let col = cellCol - 1; col <= cellCol + 1; col++) {
                        if(row == cellRow && col == cellCol) 
                            continue

                        // "connect" opposite sides of the grid
                        let cleanRow = row;
                        let cleanCol = col;
                        if(row < 0) cleanRow = this.rows + row;
                        if(row > this.rows - 1) cleanRow = row % this.rows
                        if(col < 0) cleanCol = this.cols + col;
                        if(col > this.cols - 1) cleanCol = col % this.cols

                        this.grid[cellRow][cellCol].neighbors.push(
                            this.grid[cleanRow][cleanCol]
                        );
                    }
                }
            } 
        }

        // grid style (to fit cols and rows)
        this.htmlElement.style.gridTemplateRows = `repeat(${this.rows}, ${cellSizePx}px)`;
        this.htmlElement.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSizePx}px)`;

        this.generation = 0; 

        this.drawGrid();
    }

    // fills the grid element with divs (cells)
    drawGrid() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.htmlElement.appendChild(this.grid[row][col].htmlElement);  
            } 
        } 
    }

    // assign next state to cell based on current neighbors state
    calculateNextGeneration() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                let currentCell = this.grid[row][col];

                if(currentCell.state && currentCell.liveNeighbors < 2) {
                    // underpopulation
                    currentCell.nextState = false;
                    continue;
                }

                if(currentCell.state && currentCell.liveNeighbors > 3) {
                    // overpopulation
                    currentCell.nextState = false;
                    continue;
                }

                if(!currentCell.state && currentCell.liveNeighbors == 3) {
                    // birth
                    currentCell.nextState = true;
                    continue;
                }

                //base case (nothing happens)
                currentCell.nextState = currentCell.state;
            } 
        } 
    } 

    // replace each cell current state with next state
    incrementGeneration() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.grid[row][col].nextGeneration();
            } 
        } 

        this.generation++
    } 

    getValues() {
        let gridStates = new Array();
        for(let row = 0; row < this.rows; row++) {
            let rowStates = new Array();
            for(let col = 0; col < this.cols; col++) {
                rowStates.push(this.grid[row][col].state);  
            } 
            gridStates.push(rowStates);
        } 
        return gridStates;
    }

    setValues(gridValues) {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.grid[row][col].updateCell(
                    gridValues[row][col] || false
                );
            }
        }
    }

    clear() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.grid[row][col].updateCell(false);
            }
        }
    }

    randomize() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                // fill with random bool
                this.grid[row][col].updateCell(
                    Math.random() >= 0.5
                );
            }
        }
    }
}

function loadSavedGridsList(grid) {
    function loadSavedGrid(grid, savedGridIndex) {
        let gridsStorage = JSON.parse(localStorage.getItem("grids"));
        let selectedGrid = gridsStorage.find(
            (savedGrid) => savedGrid.index == savedGridIndex
        );
        grid.setValues(selectedGrid.grid);
    }

    function deleteSavedGrid(grid, savedGridIndex) {
        let gridsStorage = JSON.parse(localStorage.getItem("grids"));
        let gridsStorageFiltered = gridsStorage.filter(
            (savedGrid) => savedGrid.index != savedGridIndex
        );
        localStorage.setItem("grids", JSON.stringify(gridsStorageFiltered));
        loadSavedGridsList(grid);
    }

    let gridsStorage = JSON.parse(localStorage.getItem("grids")) || new Array();
    let listHTML = "";
    gridsStorage.forEach((savedGrid) => {
        let loadBtn = `<button class="load-saved-grid-btn" data-grid-index="${savedGrid.index}">load</button>`;
        let deleteBtn = `<button class="delete-saved-grid-btn" data-grid-index="${savedGrid.index}">delete</button>`;
        listHTML = `<li>grid ${savedGrid.index} ${loadBtn} ${deleteBtn}</li>`.concat(listHTML); 
    })
    let savedGridsList = document.getElementById("saved-grids-list");
    savedGridsList.innerHTML = listHTML

    document.querySelectorAll(".load-saved-grid-btn").forEach(
        (loadBtn) => loadBtn.onclick = () => {
            let index = loadBtn.dataset.gridIndex;
            loadSavedGrid(grid, index);
        }
    );
    document.querySelectorAll(".delete-saved-grid-btn").forEach(
        (deleteBtn) => deleteBtn.onclick = () => {
            let index = deleteBtn.dataset.gridIndex;
            deleteSavedGrid(grid, index);
        }
    );
};


function saveGrid(grid, gridValues) {
    function getNextIndex(gridsStorage) {
        let maxIndex = gridsStorage.reduce(
            (maxIndex, savedGrid) => Math.max(maxIndex, savedGrid.index),
            -1
        );
        return maxIndex + 1;
    }

    let gridsStorage = JSON.parse(localStorage.getItem("grids")) || new Array();
    gridsStorage.push({
        index: getNextIndex(gridsStorage),
        grid: gridValues
    });
    localStorage.setItem("grids", JSON.stringify(gridsStorage));
    loadSavedGridsList(grid);
}

class VisualSelection {
    constructor(canvas) {
        this.canvas = canvas;
        this.setupCanvas();

        this.context2d = this.canvas.getContext("2d");
        this.selecting = false;


        this.start = {
            x: null,
            y: null
        }
        this.end = {
            x: null,
            y: null
        }

        this.canvas.onmousedown = (event) => {
            this.clear();

            this.selecting = true;
            this.start.x = event.layerX;
            this.start.y = event.layerY;
        };
        this.canvas.onmousemove = (event) => {
            this.clear();

            if(this.selecting) {
                this.end.x = event.layerX;
                this.end.y = event.layerY;
                this.drawRect()
            }
        };
        this.canvas.onmouseup = (event) => {
            this.clear();

            this.selecting = false;
        };
    }

    setupCanvas() {
        // css properties just stretch the canvas,
        // need to set attributes for coorrect pixels coordinates
        this.canvas.setAttribute(
            'width', 
            window.getComputedStyle(this.canvas, null).getPropertyValue("width")
        );
        this.canvas.setAttribute(
            'height', 
            window.getComputedStyle(this.canvas, null).getPropertyValue("height")
        );
    }

    clear() {
        this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRect() {
        // perimeter
        this.context2d.globalAlpha = 1;
        this.context2d.beginPath(); 
        this.context2d.moveTo(this.start.x , this.start.y);
        this.context2d.lineTo(this.end.x , this.start.y);
        this.context2d.lineTo(this.end.x, this.end.y);
        this.context2d.lineTo(this.start.x, this.end.y);
        this.context2d.lineTo(this.start.x, this.start.y);
        this.context2d.stroke();

        // fill
        this.context2d.globalAlpha = 0.2;
        this.context2d.beginPath(); 
        this.context2d.rect(
            this.start.x,
            this.start.y, 
            this.end.x - this.start.x,
            this.end.y - this.start.y,
        )
        this.context2d.fill();
    }
}

function main() {
    let grid = new Grid(document.getElementById("grid"));
    let visualSelection = new VisualSelection(
        document.getElementById("visual-selection-canvas")
    );

    let generationTimespanMs = 250;
    let mainLoop;
    let startBtn = document.getElementById("start-btn");
    let stopBtn = document.getElementById("stop-btn");
    startBtn.onclick = () => {
        grid.lastConfiguration = JSON.stringify(grid.getValues()); 

        mainLoop = setInterval(() => {
            grid.calculateNextGeneration();  
            grid.incrementGeneration();  
        }, generationTimespanMs);
        startBtn.classList.add("display-none")
        stopBtn.classList.remove("display-none");
    }
    stopBtn.onclick = () => {
        clearInterval(mainLoop);
        stopBtn.classList.add("display-none")
        startBtn.classList.remove("display-none");
    }
    document.getElementById("save-btn").onclick = () => {
        saveGrid(grid, grid.getValues());
    }
    document.getElementById("restart-btn").onclick = () => {
        if(grid.lastConfiguration == null)
            return;
        grid.setValues(JSON.parse(grid.lastConfiguration));
    }
    document.getElementById("random-btn").onclick = () => {
        grid.randomize();
    }
    document.getElementById("clear-btn").onclick = () => {
        grid.clear();
    }

    loadSavedGridsList(grid);
}

document.addEventListener("DOMContentLoaded", function() {
    main();
});
