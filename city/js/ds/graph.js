function Graph () {

    this.adjacencyList = new Map();

    this.addVertex = (vertex, edges=[]) => {
        if (this.adjacencyList.has(vertex)) return;
        if (!Array.isArray(edges)) edges = [edges];
        this.adjacencyList.set(vertex, new Set(edges));
    }

    this.addEdge = (vertex, edges=[]) => {
        if (!this.adjacencyList.has(vertex)) return;
        if (!Array.isArray(edges)) edges = [edges];
        var edgeSet = this.adjacencyList.get(vertex);
        for (var i=0, j=edges.length; i<j; i++) edgeSet.add(edges[i]);
    }

    this.removeVertex = (vertex) => {
        if (!this.adjacencyList.has(vertex)) return;
        for (var edgeSet of this.adjacencyList.values()) edgeSet.delete(vertex);
        this.adjacencyList.delete(vertex);
    }

    this.removeNodeConnection = (vertex, edges=[]) => {
        if (!this.adjacencyList.has(vertex)) return;
        if (!Array.isArray(edges)) connections = [edges];
        var edgeSet = this.adjacencyList.get(vertex);
        for (var i=0, j=edges.length; i<j; i++) edgeSet.delete(edges[i]);
    }

    this.print = (label="undefined") => {
        console.log(`Graph print (${label}):`);
        var printMap = new Map();
        for (var vertex of this.adjacencyList.keys()) {
            if (!printMap.has(vertex)) printMap.set(vertex, new Set([]));
            for (var edge of this.adjacencyList.get(vertex).values()) {
                if (printMap.get(vertex).has(edge)) continue;
                printMap.get(vertex).add(edge);
                var printString = String(vertex);
                if (this.adjacencyList.has(edge) && this.adjacencyList.get(edge).has(vertex)) {
                    if (!printMap.has(edge)) printMap.set(edge, new Set([vertex]));
                    printString += " <-> ";
                } else printString += "  -> ";
                printString += String(edge);
                console.log(printString);
            }
        }
    }
}


var vertexIds = {
    banana : {id:1, name:'banana'},
    apple : {id:2, name:'apple'},
    grape : {id:3, name:'grape'},
    pineapple : {id:4, name:'pineapple'},
    kiwi : {id:5, name:'kiwi'},
    melon : {id:6, name:'melon'}

}

var testGraph = new Graph();
testGraph.addVertex(vertexIds.apple.name, [vertexIds.banana.name, vertexIds.melon.name]);
testGraph.addVertex(vertexIds.banana.name, [vertexIds.apple.name, vertexIds.melon.name]);
testGraph.addVertex(vertexIds.melon.name, [vertexIds.banana.name]);

testGraph.print();

function printList () {
    for (var i=0, j=arguments.length; i<j; i++) {
        console.log(arguments[i]);
    }
}

printList("test", "one", 2, "three");

printList(["test", "one", 2, "three"]);