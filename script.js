class Cell {
    constructor() {
        this.htmlElement = document.createElement("div");;
        this.state = false;
        this.nextState = null;

        this.htmlElement.onclick = () => {
            this.updateStateNow(!this.state);
        };
    }

    updateStateNow(newState) {
        this.state = newState;

        if(this.state) {
            this.htmlElement.style.backgroundColor = "black"; 
        } else {
            this.htmlElement.style.backgroundColor = "white"; 
        }
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
                let currentCell = this.grid[row][col]
                let liveNeighbors = this.getLiveNeighbors(row, col)

                // underpopulation
                if(currentCell.state && liveNeighbors < 2) {
                    currentCell.nextState = false;
                    continue;
                }
                // overpopulation
                if(currentCell.state && liveNeighbors > 3) {
                    currentCell.nextState = false;
                    continue;
                }
                // birth
                if(!currentCell.state && liveNeighbors == 3) {
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
                this.grid[row][col].state = this.grid[row][col].nextState;
                this.grid[row][col].nextState = null;
            } 
        } 

        this.generation++
    } 

    drawGeneration() {
        console.log(`generation: ${this.generation}`)
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                if(this.grid[row][col].state) {
                    this.grid[row][col].htmlElement.style.backgroundColor = "black"; 
                } else {
                    this.grid[row][col].htmlElement.style.backgroundColor = "white"; 
                }
            }
        }
    }

    getLiveNeighbors(cellRow, cellCol) {
        let liveNeighbors = 0;
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

                if(this.grid[cleanRow][cleanCol].state)
                    liveNeighbors++;
            }
        }
        return liveNeighbors;
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
                //this.grid[row][col] 
            }
        }
    }
}

function loadSavedGridsList() {
    let gridsStorage = JSON.parse(localStorage.getItem("grids")) || new Array();
    let listHTML = "";
    gridsStorage.forEach((savedGrid) => {
        // todo change from attribute to handler
        let loadBtn = `<button onclick="loadSavedGrid(${savedGrid.index})">load</button>`;
        let deleteBtn = `<button onclick="deleteSavedGrid(${savedGrid.index})">delete</button>`;
        listHTML = `<li>grid ${savedGrid.index} ${loadBtn} ${deleteBtn}</li>`.concat(listHTML); 
    })
    let savedGridsList = document.getElementById("saved-grids-list");
    savedGridsList.innerHTML = listHTML
};

function saveGrid(grid) {
    function getNextIndex(gridsStorage) {
        let maxIndex = gridsStorage.reduce((maxIndex, savedGrid) => 
            Math.max(maxIndex, savedGrid.index),
            -1
        );
        return maxIndex + 1;
    }

    let gridsStorage = JSON.parse(localStorage.getItem("grids")) || new Array();
    gridsStorage.push({
        index: getNextIndex(gridsStorage),
        grid: grid
    });
    localStorage.setItem("grids", JSON.stringify(gridsStorage));
    loadSavedGridsList();
}

function loadSavedGrid(savedGridIndex) {
    let gridsStorage = JSON.parse(localStorage.getItem("grids"));
    let selectedGrid = gridsStorage.find(
        (savedGrid) => savedGrid.index == savedGridIndex
    );
    console.log('loading', selectedGrid);
}

function deleteSavedGrid(savedGridIndex) {
    let gridsStorage = JSON.parse(localStorage.getItem("grids"));
    let gridsStorageFiltered = gridsStorage.filter(
        (savedGrid) => savedGrid.index != savedGridIndex
    );
    localStorage.setItem("grids", JSON.stringify(gridsStorageFiltered));
    loadSavedGridsList();
}

function main() {
    let generationTimespanMs = 750;
    let grid = new Grid(document.getElementById("grid"));

    let mainLoop;
    document.getElementById("start-btn").onclick = () => {
        mainLoop = setInterval(() => {
            grid.calculateNextGeneration();  
            grid.incrementGeneration();  
            grid.drawGeneration();
        }, generationTimespanMs);
    }
    document.getElementById("stop-btn").onclick = () => {
        clearInterval(mainLoop);
    }
    document.getElementById("save-btn").onclick = () => {
        saveGrid(grid.getValues());
    }

    loadSavedGridsList();
}

document.addEventListener("DOMContentLoaded", function() {
    main();
});
