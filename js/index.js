let imgArray = [];
let currImgId;
let intervalID;
let map;
let marker;

function initializeMap(location) {
    map = L.map('map-mini').setView(location, 16);;
    map.doubleClickZoom.disable();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    marker = L.marker(location);
    marker.addTo(map);
}

function moveImagesLeft() {
    let newImgId = parseInt(currImgId) - 1;

    if (newImgId < 0)
        newImgId = imgArray.length - 1;

    if (imgArray[newImgId][0].parentNode.classList.contains("d-none")) {
        currImgId = newImgId;
        moveImagesLeft();
        return;
    }

    editModal(imgArray[newImgId][0], imgArray[newImgId][1]);
}

function moveImagesRight() {
    let newImgId = parseInt(currImgId) + 1;

    if (newImgId == imgArray.length)
        newImgId = 0;

    if (imgArray[newImgId][0].parentNode.classList.contains("d-none")) {
        currImgId = newImgId;
        moveImagesRight();
        return;
    }

    editModal(imgArray[newImgId][0], imgArray[newImgId][1]);
}


function stopSlideshow() {
    clearInterval(intervalID);

    let $modalBody = $("#gallery-modal-body");
    $modalBody.find(".slideshow-button").remove();

    let startBttn = document.createElement("i");
    startBttn.setAttribute("class", "fa-solid fa-circle-play fa-3x slideshow-button")
    startBttn.addEventListener("click", function() {
        startSlideshow()
    });

    $modalBody.append(startBttn);
}


function startSlideshow() {
    intervalID = window.setInterval(function() {
        moveImagesRight();
    }, 3000);

    let $modalBody = $("#gallery-modal-body");
    $modalBody.find(".slideshow-button").remove();

    let stopBttn = document.createElement("i");
    stopBttn.setAttribute("class", "fa-solid fa-circle-pause fa-3x slideshow-button")
    stopBttn.addEventListener("click", function() {
        stopSlideshow()
    });

    $modalBody.append(stopBttn);
}

function strToLatLng(value) {
    return value.split(',').map( Number );
}

function editModal(img, imgInfo) {
    let $modalBody = $("#gallery-modal-body");
    let $modalFooter = $("#gallery-modal-footer");

    $("#gallery-modal-title").text(imgInfo.title);
    $modalBody.find("img").remove();
    $modalBody.append(img.cloneNode());

    $modalFooter.empty();

    let imgDate = document.createElement("div");
    imgDate.textContent = imgInfo.date;
    $modalFooter.append(imgDate);

    let imgDesc = document.createElement("div");
    imgDesc.textContent = imgInfo.description;
    $modalFooter.append(imgDesc);

    if (map != undefined) {
        map.off();
        map.remove();
    }
    initializeMap(strToLatLng(imgInfo.location));

    currImgId = imgInfo.id;
}


function showModal(img, imgInfo) {
    editModal(img, imgInfo);

    $('#gallery-modal').modal('show');
}


function loadImage(dest, imgInfo) {
    let imgElm = document.createElement("img");
    imgElm.setAttribute("src", "./" + imgInfo.path + imgInfo.filename);
    imgElm.setAttribute("alt", imgInfo.title);
    imgElm.addEventListener("click", function() {
        currImgId = imgInfo.id;
        showModal(imgElm, imgInfo);
    });

    let wrapper = document.createElement("div");
    wrapper.setAttribute("class", "col-6 col-md-3 col-lg-2 my-4 d-flex justify-content-center");
    wrapper.appendChild(imgElm);
    dest.appendChild(wrapper);

    return [imgElm, imgInfo];
}


function createPhotoGallery(json) {
    let photoGallery = document.getElementById("photo-gallery");

    $.each(json.photos, function(key, val) {
        imgArray.push(loadImage(photoGallery, val));
    });

    $("#gallery-modal").on("hidden.bs.modal", function () {
        stopSlideshow();
    });

    let localStorageLocation = localStorage.getItem("location");
    if (localStorageLocation) {
        filterImages("?location:" + localStorageLocation);
        localStorage.clear();
    }
}


$(window).on('load', function () {
    $.ajax({
        url: './photos/photos.json',
        dataType: 'json',
        success: function (json) {
            createPhotoGallery(json);
        },
        error: function () {
            console.log('Failed to load json data.');
        }
    });
});


function filterImages(searchText) {
    if (searchText.slice(0, 10) == "?location:") {
        let location = searchText.slice(10);
        document.getElementById("photo-search-input").value = "?location:" + location;
        
        let imgCount = 0;
        let viableImg;
        for (let i = 0; i < imgArray.length; i++) {
            let imgInfo = imgArray[i][1];
            
            if (imgInfo.location == location) {
                imgArray[i][0].parentNode.classList.remove("d-none");
                ++imgCount;
                viableImg = imgArray[i];
            }
            else
                imgArray[i][0].parentNode.classList.add("d-none");
        }

        if (imgCount == 1) {
            currImgId = viableImg[1].id;
            showModal(viableImg[0], viableImg[1]);
        }

        return;
    }

    if (searchText === "") {
        for (let i = 0; i < imgArray.length; i++)
            imgArray[i][0].parentNode.classList.remove("d-none");
        return;
    }        

    for (let i = 0; i < imgArray.length; i++) {
        let imgInfo = imgArray[i][1];

        if (
            imgInfo.title.toLowerCase().includes(searchText.toLowerCase()) || 
            imgInfo.description.toLowerCase().includes(searchText.toLowerCase())
        )
            imgArray[i][0].parentNode.classList.remove("d-none");
        else
            imgArray[i][0].parentNode.classList.add("d-none");
    }
}


let searchInput = document.getElementById("photo-search-input");
searchInput.addEventListener("input", function() {
    filterImages(searchInput.value);
});
