
function openModal(titulo, info, imagem) {
    let div = document.querySelector("#imgGif")
    div.textContent ='';
    if(imagem){
        let img = document.createElement("img")
        img.src = "/img/"+imagem;
        img.width = "150";
        div.appendChild(img)
    }

    document.querySelector("#exampleModalLabel").textContent = titulo;
    document.querySelector("#infoModal").textContent = info;
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("exampleModal").style.display = "block"
    document.getElementById("exampleModal").className += "show"
}
function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("exampleModal").style.display = "none"
    document.getElementById("exampleModal").className += document.getElementById("exampleModal").className.replace("show", "")
}
// Get the modal
var modal = document.getElementById('exampleModal');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal()
    }
}