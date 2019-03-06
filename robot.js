//FYI - Project worked through top to bottom and noted if you need to jump back to a previous point. Indented comments are not vital but things I found informative. 

//START: All of the roads in the village denoted as pointA'-'pointB  

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

//Given an array of edges, buildGraph creates a map object that, for each node, stores an array of connected nodes. as shown below  
const roadGraph = buildGraph(roads);

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

/*Condense the village’s state down to the minimal set of values that define it. There’s the robot’s current location and the collection of undelivered parcels, each of which has a current location and a destination address.  */

class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }
    move(destination) {
        //Check whether there is a road going from the current place to the destionation 
        if (!roadGraph[this.place].includes(destination)) {
            return this;  //no road found! return the old state, this is not a valid move 
        } else {  //there is a road that goes to the destination create a new state and update the robot's location with the destination and update the parcels. 
            let parcels = this.parcels.map(p => { 
                if (p.place != this.place) return p;  //do nothing, this is not the parcel in question
                return {  //update the parcel that is being delivered 
                    place: destination,
                    address: p.address
                };
            }).filter(p => p.place != p.address); //filter out the delivered parcel 
            return new VillageState(destination, parcels);
        }
    }
}

        /*Parcel objects aren’t changed when they are moved but re-created. The move method gives us a new village state but leaves the old one entirely intact. */

// *? Should this stay? 
let first = new VillageState("Post Office", [{
    place: "Post Office",
    address: "Alice's House"
}]);

let next = first.move("Alice's House");
// *?

//The robot needs to know the direction it wants to move and a memory that is given back the next time it is called. 


function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0) {
            console.log(`Done in ${turn} turns`);
            break;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Moved to ${action.direction}`);
    }
}


//APPLYING MAIL TRUCK ROUTE - better than random, not great 
/*Find a route that passes all places and by running the route twice, the robot can pick up and deliver all parcels. */
const mailRoute = ["Alice's House", "Cabin", "Alice's House", "Bob's House", "Town Hall", "Daria's House", "Ernie's House", "Grete's House", "Shop", "Grete's House", "Farm", "Marketplace", "Post Office"];

/*To implement the route-following robot, we’ll need to make use of robot memory. The robot keeps the rest of its route in its memory and drops the first element every turn. */

// ! How do i actually run this?  
function routeRobot(state, memory) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return {
        direction: memory[0],
        memory: memory.slice(1)  //keep everything but the first element in the array 
    };
}

//PATHFINDING  
//when searching for a route from A to B, we are interested only in the ones that start at A.
// we do not care about routes that visit the same place twice.
// A good apporach is to 'grow' routes from the starting point exploring each place that has not been visited yet.

function findRoute(graph, from, to) {
    let work = [{
        at: from,
        route: []
    }];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place);
            if (!work.some(w => w.at == place)) {
                work.push({
                    at: place,
                    route: route.concat(place)
                });
            }
        }
    }
}
/*
The exploring has to be done in the right order
 the function keeps a work list - an array of places that should be explored next along with a route that got us there.  
The search then operates by taking the next item in the list and exploring that, which means all roads going from that place are looked at. If one of them is the goal, a finished route can be returned. Otherwise, if we haven’t looked at this place before, a new item is added to the list. If we have looked at it before, since we are looking at short routes first, we’ve found either a longer route to that place or one precisely as long as the existing one, and we don’t need to explore it.
*/

function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {
        direction: route[0],
        memory: route.slice(1)
    };
}

/*
This robot uses its memory value as a list of directions to move in, just like the route-following robot. Whenever that list is empty, it has to figure out what to do next. It takes the first undelivered parcel in the set and, if that parcel hasn’t been picked up yet, plots a route toward it. If the parcel has been picked up, it still needs to be delivered, so the robot creates a route toward the delivery address instead. */