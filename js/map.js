let imageInfoArray = []
let routeHidden;

function strToLatLng(value) {
    return value.split(',').map( Number );
}

function createMap(json) {
    $.each(json.photos, function(key, val) {
        imageInfoArray.push(val);
    });

    let map = L.map('map');
    map.doubleClickZoom.disable();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let control = L.Routing.control({
        waypoints: [],
        addWaypoints: false,
        draggableWaypoints: false,
        routeWhileDragging: false,
        lineOptions: {
            styles: [{opacity: 0}]
        },
        createMarker: function(i, wp) {
            return L.marker(wp.latLng).on('click', function() {
                localStorage.clear();
                localStorage.setItem("location", wp.latLng.lat + "," + wp.latLng.lng);
                window.location.href = "../index.html";
            });
        }
    }).addTo(map);

    let waypoints = [];
    let found;
    for (let i = 0; i < imageInfoArray.length; i++) {
        found = false;

        for (let j = i + 1; j < imageInfoArray.length; j++)
            if (imageInfoArray[i].location == imageInfoArray[j].location) {
                found = true;
                break;
            }

        if (found)
            continue;

        const latLng = strToLatLng(imageInfoArray[i].location);
        waypoints.push(L.latLng(latLng[0], latLng[1]));
    }

    control.setWaypoints(waypoints);
    control.hide();
    routeHidden = true;

    document.getElementById("map-route-button").addEventListener("click", function() {
        if (routeHidden) {
            control.show();
            control.getRouter().options.lineOptions.styles = [{color: "blue", opacity: 1}];
            routeHidden = false;
        }
        else {
            control.hide();
            control.getRouter().options.lineOptions.styles = [{color: "blue", opacity: 0}];
            routeHidden = true;
        }

        control.route();
    });
}


$(window).on('load', function () {
    $.ajax({
        url: '../photos/photos.json',
        dataType: 'json',
        success: function (json) {
            createMap(json);
        },
        error: function () {
            console.log('Failed to load json data.');
        }
    });
});