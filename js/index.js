let imageArray = [];

function addModalControl(modalBody, imgId) {
    let leftBttn = document.createElement("i");
    leftBttn.setAttribute("class", "fa-solid fa-circle-arrow-left fa-3x arrow-left");
    leftBttn.addEventListener("click", function() {
        let newImgId = parseInt(imgId) - 1;
        if (newImgId < 0)
            newImgId = imageArray.length - 1;

        editModal(imageArray[newImgId][0], imageArray[newImgId][1]);
    });

    let rightBttn = document.createElement("i");
    rightBttn.setAttribute("class", "fa-solid fa-circle-arrow-right fa-3x arrow-right");
    rightBttn.addEventListener("click", function() {
        let newImgId = parseInt(imgId) + 1;
        if (newImgId == imageArray.length)
            newImgId = 0;
            
        editModal(imageArray[newImgId][0], imageArray[newImgId][1]);
    }); 

    let startBttn = document.createElement("i");
    startBttn.setAttribute("class", "fa-solid fa-circle-play fa-3x start-button");

    modalBody.append(leftBttn).append(rightBttn).append(startBttn);
}

function resizeImgToMax(img) {
    let dispWidth = $(window).width();
    let dispHeight = $(window).height();

    if (img.naturalWidth > img.naturalHeight) {
        if (img.naturalWidth <= dispWidth * 0.9)
            img.style.width = img.naturalWidth + 'px';
        else
            img.style.width = dispWidth * 0.9 + 'px';
    }
    else {
        if (img.naturalHeight <= dispHeight * 0.9)
            img.style.height = img.naturalHeight + 'px';
        else
            img.style.height = dispHeight * 0.9 + 'px';
    }

    return img;
}

function editModal(img, imgInfo) {
    let resizedImg = resizeImgToMax(img.cloneNode());
    let $modalBody = $("#gallery-modal-body");

    $("#gallery-modal-title").text(imgInfo.title);
    $modalBody.empty().append(resizedImg);
    addModalControl($modalBody, imgInfo.id);
    $("#gallery-modal-footer").text(imgInfo.description);
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