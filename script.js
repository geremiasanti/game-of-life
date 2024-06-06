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

        // init grid
        this.grid = new Array(this.rows).fill().map(
            (_) => new Array(this.cols).fill().map(
                (_) => new Cell()
            )
        );

        // grid style (to fit cols and rows
        this.htmlElement = htmlElement; 
        this.htmlElement.style.gridTemplateRows = `repeat(${this.rows}, ${cellSizePx}px)`;
        this.htmlElement.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSizePx}px)`;

        this.generation = 0;

        this.drawGrid();
    }


    drawGrid() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.htmlElement.appendChild(this.grid[row][col].htmlElement);  
            } 
        } 
    }

    drawGeneration() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                if(this.grid[row][col].state == true) {
                    console.log(this.generation, row, col, this.grid[row][col]);
                    this.grid[row][col].htmlElement.style.backgroundColor = "black"; 
                } else {
                    console.log(this.generation, row, col, this.grid[row][col]);
                    this.grid[row][col].htmlElement.style.backgroundColor = "white"; 
                }
            }
        }
    }

    calculateNextGeneration() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.grid[row][col].nextState = !this.grid[row][col].state;
            } 
        } 
    } 

    incrementGeneration() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.grid[row][col].state = this.grid[row][col].nextState;
                this.grid[row][col].nextState = null;
            } 
        } 
        this.generation++
    } 
}

function main() {
    let generationTimespanMs = 750;
    let grid = new Grid(document.getElementById('grid'));

    grid.grid[5][5].state = true;
    grid.grid[6][5].state = true;
    grid.grid[7][5].state = true;
    grid.drawGeneration();

    setInterval(() => {
        grid.calculateNextGeneration();  
        grid.incrementGeneration();  
        grid.drawGeneration();
    }, generationTimespanMs);
}

document.addEventListener("DOMContentLoaded", function() {
    main();
});

