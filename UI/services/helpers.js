import d from '../screens/data'

var setLeastWalk = [];
var setLeastMoney = [];
// input is an array, contains user shopping list
export async function getData(input, location) {
  var lessMoney = [];
  let listStoreHaveItem = [];
  let data;
  try {
    // const res = await axios(`http://localhost:3000/${location}`);
    data = d.turku[0].stores;
    console.log("data", data);

    for (let i = 0; i < input.length; i++) {
      input[i] = input[i].toLowerCase();
    }
    var listItem = [];
    for (let i = 0; i < input.length; i++) {
      
      Object.keys(data).forEach(function(storeName) {
        data[storeName].items.map(item => {
          if (item.in_store) {
            if (item.id.includes(input[i].toLowerCase())) {
              var infor = {
                name: data[storeName].store_name,
                id: data[storeName].store_id,
                location: data[storeName].location,
                itemInfor: [
                  {
                    itemName: item.name,
                    itemPrice: item.price,
                    itemId: item.id,
                    itemBrand: item.keywords.brand
                  }
                ],
                keyword: item.keywords
              };
              listItem.push(infor);
              listStoreHaveItem.push(infor);
            }
          }
        });
      });
      console.log(listItem)
      var defaultPrice = listItem[0].itemInfor[0].itemPrice;
      for (let j = 1; j < listItem.length; j++) {
        if (listItem[j].itemInfor[0].itemPrice <= defaultPrice) {
          defaultPrice = listItem[j].itemInfor[0].itemPrice;
        }
      }
      for (let i = 1; i < listItem.length; i++) {
        if (listItem[i].itemInfor[0].itemPrice <= defaultPrice) {
          lessMoney.push(listItem[i]);
        }
      }
    }

    return { lessMoney, listStoreHaveItem };
  } catch (error) {
    // console.log(error);
    console.log(error);
  }
}

function groupByStore(listStoreHaveItem) {
  const newListStore = listStoreHaveItem.map(el => ({ ...el }));
  var result = [];

  //listStoreHaveItem has 30 stores
  // for each store with the same name, combine and get a new itemInfor
  newListStore.forEach(store => {
    const i = result.findIndex(el => el.name === store.name);
    if (i === -1) {
      result = [...result, store];
    } else {
      result[i].itemInfor = result[i].itemInfor.concat([store.itemInfor[0]]);
      // result[i].itemInfor.concat([store.itemInfor[0]]);
    }
  });

  return result;
}

// function initMap() {
//     var directionsService = new google.maps.DirectionsService();
//     var directionsDisplay = new google.maps.DirectionsRenderer();
//     var turku = new google.maps.LatLng(
//       60.446760000000005,
//       22.357020000000002
//     );
//     var mapOptions = {
//       zoom: 14,
//       center: turku
//     };
//     var map = new google.maps.Map(document.getElementById("map"), mapOptions);
//     directionsDisplay.setMap(map);
//     var routeFn = Route(directionsService, directionsDisplay, map);
//     var combinationFn = RouteCombination();
//     setupRoute(routeFn, combinationFn);
//   }
  async function setupRoute(fn, comFn, input) {
    // yokyla { lat: 60.4638544, lng: 22.295729299999948 }
    // kaupatori {lat: 60.4521556, lng: 22.295729299999948}
    // raisio {lat: 60.4859094, lng: 22.173445899999933}
      // var routeCombination = comFn.getRouteSteps([
      //   { lat: 60.4638544, lng: 22.295729299999948 },
      //   { lat: 60.4521556, lng: 22.295729299999948 },
      //   { lat: 60.4859094, lng: 22.173445899999933 }
      // ]);
      // console.log("combination", routeCombination);
      var leastWalkRoutes = [];
      var leastMoneyRoutes = [];
      var validSetLeastWalk = [];
      var validSetLeastMoney = [];
      var routeCombination = await getData(input, "turku").then(value => {
        leastWalkRoutes = groupByStore(value.listStoreHaveItem).map(
          store => store
        );
        leastMoneyRoutes = value.lessMoney;
        // get all 4-store max possible routes from the list of stores
        for (var i = 0; i < 4; i++) {
          comFn.getAllCombination(leastWalkRoutes, i, 0, [], setLeastWalk);
          comFn.getAllCombination(leastMoneyRoutes, i, 0, [], setLeastMoney);
        }
        // console.log(setLeastWalk);
        var shoppingList = ["red_milk", "sugar", "minced_meat", "sweet_chilli_sauce"];
        validSetLeastWalk = setLeastWalk.filter(s => comFn.validStoreList(shoppingList, s));
        validSetLeastMoney = setLeastMoney.filter(s => comFn.validStoreList(shoppingList, s));
        // console.log("leastWalkRoutes: ", leastWalkRoutes);
        // return comFn.getRouteSteps(set[86]);
        // console.log("combination", routeCombination);
      });
      console.log("least walk:", validSetLeastWalk);
      console.log("least money:", validSetLeastMoney);
      // console.log(comFn.getRouteSteps(set[86]));
      // var leastMoneyRoutes = [];
      
      // least money
      for (let set of validSetLeastMoney) {
        let locationSet = set.map(s => {
          // console.log("Store", s);
          return s.location;
          });
        let steps = comFn.getRouteSteps(locationSet);
        // console.log("step", steps);
        locationSet.unshift({ lat: 60.4638544, lng: 22.295729299999948 });
        locationSet.push({ lat: 60.4859094, lng: 22.173445899999933 });
        for (const r of steps) {
          try {
            let result = await fn.findRoute(r, 15);
            // console.log("result", result);
            let path = await fn.getRouteLatLng(result);
            let totalTime = await fn.getDuration(result);
            leastMoneyRoutes.push({ r, path, totalTime });
            console.log("LM object ne", { r, path, totalTime });
          } catch (err) {
            continue;
          }
        }
      }
      leastMoneyRoutes.sort((a, b) => a.totalTime - b.totalTime);
      console.log("Least money routes:", leastMoneyRoutes);
      
      // var leastWalkRoutes = [];
      // least walk
      for (let setLW of validSetLeastWalk) {
        let locationSetLW = setLW.map(s => s.location);
        // console.log(locationSet);
        
        let stepsLW = comFn.getRouteSteps(locationSetLW);
        // console.log("step", steps);
        locationSetLW.unshift({ lat: 60.4638544, lng: 22.295729299999948 });
        locationSetLW.push({ lat: 60.4859094, lng: 22.173445899999933 });
        for (const r of stepsLW) {
          try {
            console.log(r);
            
            let result = await fn.findRoute(r, 15);
            console.log("result", result);
            
            let path = await fn.getRouteLatLng(result);
            let totalTime = await fn.getDuration(result);
            leastWalkRoutes.push({ r, path, totalTime });
            console.log("LW object ne", { r, path, totalTime });
          } catch (err) {
            console.log(err);
            // return;
            continue;
          }
        }
      }
      leastWalkRoutes.sort((a, b) => a.totalTime - b.totalTime);
      console.log("Least walk routes:", leastWalkRoutes);
      
      // var routeCombination = comFn.getRouteSteps(["kaupatori turku", "variso turku", "raisio turku"]);
      // var routes = [];
      // for (const r of routeCombination) {
      //   try {
      //     let result = await fn.findRoute(r, 15);
      //     let path = fn.getRouteLatLng(result);
      //     let totalTime = fn.getDuration(result);
      //     routes.push({ r, path, totalTime });
      //   } catch (err) {
      //     continue;
      //   }
      // }
      // routes.sort((a, b) => a.totalTime - b.totalTime);
      // console.log("routes:", routes);

  }
  // //   FUNCTIONS ===============================================
  // function Route(directionsService, directionsDisplay, map) {
  //   var publicApi = {
  //     getRouteLatLng,
  //     drawRoute,
  //     findRoute,
  //     route,
  //     getDuration
  //   };
  //   return publicApi;
  //   function getDuration(result) {
  //     return (
  //       Date.parse(result[result.length - 1].arrival_time) -
  //       Date.parse(result[0].departure_time)
  //     );
  //   }
  //   function getRouteLatLng(result) {
  //     return getSteps(result).reduce((x, y) => Array.prototype.concat(x, y));
  //     function getSteps(result) {
  //       return result.map(res => {
  //         return res.steps.map(data => {
  //           var path = data.path.map(x => ({ lat: x.lat(), lng: x.lng() }));
  //           var startLocation = {
  //             lat: data.start_location.lat(),
  //             lng: data.start_location.lng()
  //           };
  //           var endLocation = {
  //             lat: data.end_location.lat(),
  //             lng: data.start_location.lng()
  //           };
  //           return {
  //             travelMode: data.travel_mode,
  //             instructions: data.instructions,
  //             duration: data.duration,
  //             distance: data.distance,
  //             endLocation,
  //             startLocation,
  //             path
  //           };
  //         });
  //       });
  //     }
  //   }
  //   function drawRoute({
  //     path,
  //     geodesic = true,
  //     strokeColor = "#FF0000",
  //     strokeOpacity = 1.0,
  //     strokeWeight = 1
  //   } = {}) {
  //     let flightPath = new google.maps.Polyline({
  //       path,
  //       geodesic,
  //       strokeColor,
  //       strokeOpacity,
  //       strokeWeight
  //     });
  //     flightPath.setMap(map);
  //   }
  //   function findRoute(
  //     waypoints,
  //     { time = 15, selectedMode = "TRANSIT" } = {}
  //   ) {
  //     var results = [];
  //     return waypoints
  //       .map(curry(partial(route), 3))
  //       .reduce(
  //         (promise, func) =>
  //           promise.then(res =>
  //             res == undefined
  //               ? func()
  //               : (results.push(res),
  //                 func(
  //                   new Date(Date.parse(res.arrival_time) + time * 60000),
  //                   selectedMode
  //                 ))
  //           ),
  //         Promise.resolve()
  //       )
  //       .then(res => (results.push(res), results));
  //   }
  //   function route(
  //     origin,
  //     destination,
  //     departureTime = new Date(Date.now()),
  //     selectedMode = "TRANSIT"
  //   ) {
  //     var request = {
  //       origin,
  //       destination,
  //       travelMode: google.maps.TravelMode[selectedMode],
  //       optimizeWaypoints: true,
  //       transitOptions: {
  //         departureTime
  //       }
  //     };
  //     return new Promise((resolve, reject) => {
  //       directionsService.route(request, (response, status) => {
  //         if (status == "OK") {
  //           var {
  //             start_address,
  //             end_address,
  //             end_location,
  //             start_location,
  //             arrival_time,
  //             departure_time,
  //             duration,
  //             distance,
  //             steps
  //           } = response.routes[0].legs[0];
  //           if (departure_time == undefined || arrival_time == undefined) {
  //             departure_time = {};
  //             arrival_time = {};
  //             departure_time.value = new Date(Date.now());
  //             arrival_time.value = new Date(
  //               Date.now() + duration.value * 1000
  //             );
  //           }
  //           return resolve({
  //             steps,
  //             start_address,
  //             end_address,
  //             end_location,
  //             start_location,
  //             arrival_time: arrival_time.value,
  //             departure_time: departure_time.value,
  //             duration,
  //             path: response.routes[0].overview_path,
  //             distance
  //           });
  //         } else {
  //           reject(status);
  //         }
  //       });
  //     });
  //   }
  // }
  // function partial(fn, ...args1) {
  //   return (...arg2) => fn(...args1, ...arg2);
  // }
  // function curry(fn, p = fn.length) {
  //   return (curried = (prevArg = []) => nextArg => {
  //     let args = prevArg.concat(nextArg);
  //     return args.length >= p ? fn(...args) : curried(args);
  //   })();
  // }
  // function binary(fn) {
  //   return (arg1, arg2) => fn(arg1, arg2);
  // }
  // function pipe(...fns) {
  //   return fns.reduce((fn1, fn2) => (...args) => fn2(fn1(...args)));
  // }
  // // ==================================================
  // //    Khoi script
  // function RouteCombination() {
  //   var publicApi = {
  //     getRoutes,
  //     getPairs,
  //     getRouteSteps,
  //     getAllCombination,
  //     validStoreList
  //   };
  //   return publicApi;
  //   function validStoreList(shoppingList, storeList) {
  //     if (shoppingList.length < storeList.length) return false;
  //     var listSet = new Set();
  //     console.log("=======================");
  //     console.log(storeList);
  //     var isValid = storeList.every(store => {
  //       let key = false;
  //       store.itemInfor.forEach(item =>
  //         shoppingList.includes(item.itemId) && (listSet.add(item.itemId), key = true)
  //       )
  //       return key;
  //     }
  //     )
  //     return isValid && listSet.size == shoppingList.length
  //   }
  //   function getRoutes(points) {
  //     var results = [];
  //     if (points.length === 1) {
  //       results.push(points);
  //       return results;
  //     }
  //     for (var i = 0; i < points.length; i++) {
  //       let currentPoint = [points[i]];
  //       let remainingPoints = points.slice(0, i).concat(points.slice(i + 1));
  //       var remainingRoutes = getRoutes(remainingPoints);
  //       for (var j = 0; j < remainingRoutes.length; j++) {
  //         results.push(currentPoint.concat(remainingRoutes[j]));
  //       }
  //     }
  //     return results;
  //   }
  //   /* gets each step of one route */
  //   function getPairs(route) {
  //     let pairs = [];
  //     if (route.length < 2) {
  //       pairs = route;
  //     } else {
  //       for (var i = 0; i < route.length - 1; i++) {
  //         pairs.push([route[i], route[i + 1]]);
  //       }
  //     }
  //     return pairs;
  //   }
  //   /* gets routeStep for each possible Route*/
  //   function getRouteSteps(points) {
  //     let routeSteps = [];
  //     let routes = getRoutes(points);
  //     routes.map(route => {
  //       routeSteps.push(getPairs(route));
  //     });
  //     return routeSteps;
  //   }
  //   /*  */
  //   function getAllCombination(stores, cross, startPosition, result, set) {
  //     for (var i = startPosition; i < stores.length; i++) {
  //       if (!cross) {
  //         var b = result.slice(0);
  //         b.push(stores[i]);
  //         set.push(b);
  //       }
  //       else {
  //         result.push(stores[i]);
  //         getAllCombination(stores, cross - 1, i + 1, result, set);
  //         result.splice(-1, 1);
  //       }
  //     }
  //   }
  // }