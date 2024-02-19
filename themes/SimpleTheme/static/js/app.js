document.querySelectorAll(".highlight").forEach( dom => {
    const button = document.createElement("button");
    button.innerHTML = "toggle";
    dom.appendChild( button );

    button.addEventListener("click", () => {
        dom.classList.toggle("fullwidth");
    });
});