const form = document.querySelector("#modify-inventory-form")
form.addEventListener("change", function () {
    const updateSubmit = document.querySelector("#submit-modified-inventory")
    updateSubmit.removeAttribute("disabled")
})