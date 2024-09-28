
function previewImage(event) {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = function() {
        const dataURL = reader.result;
        const output = document.getElementById('profileImage');
        output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
}