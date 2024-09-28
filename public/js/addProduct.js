function loadPage(page) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', page, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('content').innerHTML = xhr.responseText;
        }
    }
    xhr.send();
}
document.addEventListener('DOMContentLoaded', function() {
let isMainImageSet = false;

window.triggerFileInput = function(id) {
    document.getElementById(id).click();
};

window.displayImage = function(input, iconId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.style.width = '50px';
            imgElement.style.height = '50px';
            imgElement.style.borderRadius = '5px';
            imgElement.style.cursor = 'pointer';
            imgElement.onclick = function() {
                document.getElementById('mainImage').src = e.target.result;
            };

            if (!isMainImageSet) {
                document.getElementById('mainImage').src = e.target.result;
                isMainImageSet = true;
            }

            var iconElement = document.getElementById(iconId);
            iconElement.parentNode.replaceChild(imgElement, iconElement);
        };
        reader.readAsDataURL(input.files[0]);
    }
};
});