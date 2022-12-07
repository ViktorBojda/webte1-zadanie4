let imageArray = [];
let currImgId;
let intervalID;

function moveImagesLeft() {
    let newImgId = parseInt(currImgId) - 1;

    if (newImgId < 0)
        newImgId = imageArray.length - 1;

    editModal(imageArray[newImgId][0], imageArray[newImgId][1]);
}

function moveImagesRight() {
    let newImgId = parseInt(currImgId) + 1;

    if (newImgId == imageArray.length)
        newImgId = 0;
        
    editModal(imageArray[newImgId][0], imageArray[newImgId][1]);
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

// function resizeImgToMax(img) {
//     let dispWidth = $(window).width();
//     let dispHeight = $(window).height();

//     if (img.naturalWidth > img.naturalHeight) {
//         if (img.naturalWidth <= dispWidth * 0.8)
//             img.style.width = img.naturalWidth + 'px';
//         else
//             img.style.width = dispWidth * 0.8 + 'px';
//     }
//     else {
//         if (img.naturalHeight <= dispHeight * 0.8)
//             img.style.height = img.naturalHeight + 'px';
//         else
//             img.style.height = dispHeight * 0.8 + 'px';
//     }

//     return img;
// }

function editModal(img, imgInfo) {
    // let resizedImg = resizeImgToMax(img.cloneNode());
    let $modalBody = $("#gallery-modal-body");
    let $modalFooter = $("#gallery-modal-footer");

    $("#gallery-modal-title").text(imgInfo.title);
    $modalBody.find("img").remove();
    // $modalBody.append(resizedImg);
    $modalBody.append(img.cloneNode());

    $modalFooter.empty();

    let imgDate = document.createElement("div");
    imgDate.textContent = imgInfo.date;
    $modalFooter.append(imgDate);

    let imgDesc = document.createElement("div");
    imgDesc.textContent = imgInfo.description;
    $modalFooter.append(imgDesc);

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
        imageArray.push(loadImage(photoGallery, val));
    });

    $("#gallery-modal").on("hidden.bs.modal", function () {
        stopSlideshow();
    });
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

let searchInput = document.getElementById("photo-search-input");
searchInput.addEventListener("input", function() {
    let searchText = searchInput.value;

    if (searchText === "") {
        for (let i = 0; i < imageArray.length; i++)
            imageArray[i][0].parentNode.classList.remove("d-none");
        return;
    }        

    for (let i = 0; i < imageArray.length; i++) {
        let imgInfo = imageArray[i][1];

        if (
            imgInfo.title.toLowerCase().includes(searchText.toLowerCase()) || 
            imgInfo.description.toLowerCase().includes(searchText.toLowerCase())
        )
            imageArray[i][0].parentNode.classList.remove("d-none");
        else
            imageArray[i][0].parentNode.classList.add("d-none");
    }
});