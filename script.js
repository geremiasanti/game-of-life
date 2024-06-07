class Cell {
    constructor() {
        this.htmlElement = document.createElement("div");;
        this.state = false;
        this.nextState = null;
    }
}

class Grid {
    constructor(htmlElement) {
        let windowHeight = window.innerHeight;
        let windowWidth = window.innerWidth;
        let cellSizePx = 30;

        this.rows = Math.floor(windowHeight / cellSizePx);
        this.cols = Math.floor(windowWidth / cellSizePx);
        this.rows = 10;
        this.cols = 10;

        // init grid
        this.grid = new Array(this.rows).fill().map(
            (_) => new Array(this.cols).fill().map(
                (_) => new Cell()
            )
        );

        // grid style (to fit cols and rows)
        this.htmlElement = htmlElement; 
        this.htmlElement.style.gridTemplateRows = `repeat(${this.rows}, ${cellSizePx}px)`;
        this.htmlElement.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSizePx}px)`;

        this.generation = 1; 

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
}

function main() {
    let generationTimespanMs = 750;
    let grid = new Grid(document.getElementById('grid'));

    grid.grid[1][1].state = true;
    grid.grid[2][1].state = true;
    grid.grid[3][1].state = true;
    console.log('generation: 0')
    grid.drawGeneration();

    let mainLoop = setInterval(() => {
        console.log(`generation: ${grid.generation}`)
        grid.calculateNextGeneration();  
        grid.incrementGeneration();  
        grid.drawGeneration();
    }, generationTimespanMs);
}

document.addEventListener("DOMContentLoaded", function() {
    main();
});

