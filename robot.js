//All of the roads in the village denoted as pointA'-'pointB  

const roads = ["Alice's House-Bob's House", "Alice's House-Cabin", "Alice's House-Post Office", "Bob's House-Town Hall", "Daria's House-Ernie's House", "Daria's House-Town Hall", "Ernie's House-Grete's House", "Grete's House-Farm", "Grete's House-Shop", "Marketplace-Farm", "Marketplace-Post Office", "Marketplace-Shop", "Marketplace-Town Hall", "Shop-Town Hall"];

//Take the roads array and make it into a more useable graph 
function buildGraph(edges) {
    //create a basic object
    let graph = Object.create(null);

    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}

// invoke function passing in roads as argument and returns each location with the places it leads to.  
const roadGraph = buildGraph(roads);
//Given an array of edges, buildGraph creates a map object that, for each node, stores an array of connected nodes. as shown below 
/* => 

Alice's House: (3) ["Bob's House", "Cabin", "Post Office"]
Bob's House: (2) ["Alice's House", "Town Hall"]
Cabin: ["Alice's House"]
Daria's House: (2) ["Ernie's House", "Town Hall"]
Ernie's House: (2) ["Daria's House", "Grete's House"]
Farm: (2) ["Grete's House", "Marketplace"]
Grete's House: (3) ["Ernie's House", "Farm", "Shop"]
Marketplace: (4) ["Farm", "Post Office", "Shop", "Town Hall"]
Post Office: (2) ["Alice's House", "Marketplace"]
Shop: (3) ["Grete's House", "Marketplace", "Town Hall"]
Town Hall: (4) ["Bob's House", "Daria's House", "Marketplace", "Shop"]
*/

