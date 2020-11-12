/**
 * Graph implementation source: https://www.medium.com/better-progamming/basic-interview-data-structures-in-javascript-graphs-3f9118aeb078
 * 
**/



//######################//
//   Adjacency matrix   //
//######################//

//  An adjacency matrix is a matrix where both dimensions
//  equal the number of nodes in our graph and each cell
//  can either have the value 0 or 1.
//
//  If the cell at row i and column j has the value 1,
//  it means that node i is adjacent to node j. Here is
//  the adjacency matrix for our example graph:
//
//  ¤---¤--------------¤
//  |   |  1  2  3  4  |
//  |---|--------------|
//  | 1 |  0  1  1  0  |
//  | 2 |  0  0  1  1  |
//  | 3 |  0  0  0  0  |
//  | 4 |  0  0  1  0  |
//  ¤---¤--------------¤
//
//  An adjacency matrix in JavaScript is simply a 
//  two-dimensional array with boolean values:

const adjacencyMatrix = [
    [false, false, true, false],
    [false, false, true, true],
    [false, false, false, false],
    [false, false, true, false]
];

//---------------------------//
//   Performance breakdown   //
//---------------------------//
//  This representation has several impacts on 
//  the performance. Let n be the number of nodes 
//  and e be the number of edges of the graph.
//
//  - It consumes O(n^2) space.
//
//  - You can check if node i is adjacent to node j
//    in O(1) steps.
//
//  - Gettin all adjacent nodes to node i takes I(n) steps.



//####################//
//   Adjacency list   //
//####################//

//  An adjacency list represents the graph in a different way.
//  Every node has a list of adjacent nodes. An adjacency list
//  for our example graph looks like this:
//
//  1 -> [2, 3]
//  2 -> [3, 4]
//  3 -> []
//  4 -> [3]
//
//  Such an adjacency list is best implemented using a
//  hash map of hash-sets:

const adjacencyList = new Map();
adjacencyList.set(1, new Set([2,3]));
adjacencyList.set(2, new Set([3,4]));
adjacencyList.set(3, new Set());
adjacencyList.set(4, new Set([3]));

//---------------------------//
//   Performance breakdown   //
//---------------------------//
//  Let n be the number of nodes and e be the number
//  of edges of the graph. The performance of this
//  representation can be described as follows:
//
//  - It consumes O(n+e) space.
//
//  - You can check if node i is adjacent to node j
//    in O(n) (but it is also possible in O(1)
//    depending on the implementation).
//
//  - Gettin all nodes adjacent to node i
//    takes O(1) steps.
//
//  By using a hash-set instead of a list, we can check
//  for existence of an entry in O(1) instead of O(n).



//----------------------------------------------------//
//             BFS          vs          DFS           //
//----------------------------------------------------//
//   breadth-first search   ||   depth-first search   //
//----------------------------------------------------//

const visit = console.log;

//#################################//
//   Depth-first search algorith   //
//#################################//

const visited = new Set();
const dfs = node => {
    visit(node);
    visited.add(node);
    for (let neighbour of adjacencyList.get(node)) {
        if (!visited.has(neighbour)) {
            dfs(neighbour);
        }
    }
};

//###################################//
//   Breadth-first search algorith   //
//###################################//

const bfs = (startNode) => {
    const visited = new Set();
    const queue = [];
    queue.push(startNode);
    visited.add(startNode);

    while (queue.length > 0) {
        const currentNode = queue.shift();
        visit(currentNode);

        for (let neighbour of adjacencyList.get(currentNode)) {
            if (!visited.has(neighbour)) {
                queue.push(neighbour);
                visited.add(neighbour);
            }
        }
    }
};

//#####################################//
//   Disconnected BFS & DFS algorith   //
//#####################################//

const xfsDisconnected = startNode => {
    const visited = new Set();

    const xfs = startNode => {
        
    };

    xfs(startNode);
    for (let node of adjacencyList.keys()) {
        if (!visited.has(node)) {
            xfs(node);
        }
    };
};