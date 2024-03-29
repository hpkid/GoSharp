// Find list of 3 routes: cheapest, fastest or average price + time
(function IFFE() {
  initMap();
})();

function initMap() {
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var turku = new google.maps.LatLng(60.446760000000005, 22.357020000000002);
  var mapOptions = {
    zoom: 14,
    center: turku
  };
  var map = new google.maps.Map(document.getElementById("map"), mapOptions);
  directionsDisplay.setMap(map);

  var routeFn = Route(directionsService, directionsDisplay, map);
  var combinationFn = RouteCombination();
  setupRoute(routeFn, combinationFn);
}

function setupRoute(fn, comFn) {
  // yokyla { lat: 60.4638544, lng: 22.295729299999948 }
  // kaupatori {lat: 60.4521556, lng: 22.295729299999948}
  // raisio {lat: 60.4859094, lng: 22.173445899999933}
  var search = document.getElementById("search");

  search.addEventListener("click", async () => {
    var routeCombination = comFn.getRouteSteps([
      { lat: 60.4638544, lng: 22.295729299999948 },
      { lat: 60.4521556, lng: 22.295729299999948 },
      { lat: 60.4859094, lng: 22.173445899999933 }
    ]);

    var routes = [];
    for (const r of routeCombination) {
      try {
        let result = await fn.findRoute(r, 15);
        let path = fn.getRouteLatLng(result);
        let totalTime = fn.getDuration(result);
        routes.push({ r, path, totalTime });
      } catch (err) {
        continue;
      }
    }

    routes.sort((a, b) => a.totalTime - b.totalTime);
    console.log(routes);
  });
}
//   FUNCTIONS ===============================================
function Route(directionsService, directionsDisplay, map) {
  var publicApi = {
    getRouteLatLng,
    drawRoute,
    findRoute,
    route,
    getDuration
  };
  return publicApi;
  function getDuration(result) {
    return (
      Date.parse(result[result.length - 1].arrival_time) -
      Date.parse(result[0].departure_time)
    );
  }
  function getRouteLatLng(result) {
    return getSteps(result).reduce((x, y) => Array.prototype.concat(x, y));

    function getSteps(result) {
      return result.map(res => {
        return res.steps.map(data => {
          var path = data.path.map(x => ({ lat: x.lat(), lng: x.lng() }));
          var startLocation = {
            lat: data.start_location.lat(),
            lng: data.start_location.lng()
          };
          var endLocation = {
            lat: data.end_location.lat(),
            lng: data.start_location.lng()
          };
          return {
            travelMode: data.travel_mode,
            instructions: data.instructions,
            duration: data.duration,
            distance: data.distance,
            endLocation,
            startLocation,
            path
          };
        });
      });
    }
  }
  function drawRoute({
    path,
    geodesic = true,
    strokeColor = "#FF0000",
    strokeOpacity = 1.0,
    strokeWeight = 1
  } = {}) {
    let flightPath = new google.maps.Polyline({
      path,
      geodesic,
      strokeColor,
      strokeOpacity,
      strokeWeight
    });
    flightPath.setMap(map);
  }

  function findRoute(waypoints, { time = 15, selectedMode = "TRANSIT" } = {}) {
    var results = [];
    return waypoints
      .map(curry(partial(route), 3))
      .reduce(
        (promise, func) =>
          promise.then(res =>
            res == undefined
              ? func()
              : (results.push(res),
                func(
                  new Date(Date.parse(res.arrival_time) + time * 60000),
                  selectedMode
                ))
          ),
        Promise.resolve()
      )
      .then(res => (results.push(res), results));
  }

  function route(
    origin,
    destination,
    departureTime = new Date(Date.now()),
    selectedMode = "TRANSIT"
  ) {
    var request = {
      origin,
      destination,
      travelMode: google.maps.TravelMode[selectedMode],
      optimizeWaypoints: true,
      transitOptions: {
        departureTime
      }
    };
    return new Promise((resolve, reject) => {
      directionsService.route(request, (response, status) => {
        if (status == "OK") {
          var {
            start_address,
            end_address,
            end_location,
            start_location,
            arrival_time,
            departure_time,
            duration,
            distance,
            steps
          } = response.routes[0].legs[0];

          if (departure_time == undefined || arrival_time == undefined) {
            var departure_time = {};
            var arrival_time = {};
            departure_time.value = new Date(Date.now());
            arrival_time.value = new Date(Date.now() + duration.value * 1000);
          }

          return resolve({
            steps,
            start_address,
            end_address,
            end_location,
            start_location,
            arrival_time: arrival_time.value,
            departure_time: departure_time.value,
            duration,
            path: response.routes[0].overview_path,
            distance
          });
        } else {
          reject(status);
        }
      });
    });
  }
}

function partial(fn, ...args1) {
  return (...arg2) => fn(...args1, ...arg2);
}
function curry(fn, p = fn.length) {
  return (curried = (prevArg = []) => nextArg => {
    let args = prevArg.concat(nextArg);
    return args.length >= p ? fn(...args) : curried(args);
  })();
}
function binary(fn) {
  return (arg1, arg2) => fn(arg1, arg2);
}
function pipe(...fns) {
  return fns.reduce((fn1, fn2) => (...args) => fn2(fn1(...args)));
}
// ==================================================
//    Khoi script
function RouteCombination() {
  var publicApi = {
    getRoutes,
    getPairs,
    getRouteSteps
  };
  return publicApi;

  function getRoutes(points) {
    var results = [];
    if (points.length === 1) {
      results.push(points);
      return results;
    }
    for (var i = 0; i < points.length; i++) {
      let currentPoint = [points[i]];
      let remainingPoints = points.slice(0, i).concat(points.slice(i + 1));
      var remainingRoutes = getRoutes(remainingPoints);
      for (var j = 0; j < remainingRoutes.length; j++) {
        results.push(currentPoint.concat(remainingRoutes[j]));
      }
    }
    return results;
  }

  /* gets each step of one route */
  function getPairs(route) {
    pairs = [];
    if (route.length < 2) {
      pairs = route;
    } else {
      for (var i = 0; i < route.length - 1; i++) {
        pairs.push([route[i], route[i + 1]]);
      }
    }
    return pairs;
  }

  /* gets routeStep for each possible Route*/
  function getRouteSteps(points) {
    let routeSteps = [];
    let routes = getRoutes(points);
    routes.map(route => {
      routeSteps.push(getPairs(route));
    });
    return routeSteps;
  }
}
