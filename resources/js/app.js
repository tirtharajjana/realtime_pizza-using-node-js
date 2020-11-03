import axios from 'axios'
import Noty from 'noty'
// const initAdmin =require('./admin')
import {initAdmin}  from './admin'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector("#cartCounter")
function updateCart(pizza) {
    axios.post('/update-cart', pizza).then(res => {
        // console.log(res);
        cartCounter.innerHTML = res.data.totalQty;
        new Noty({
            type: 'warning',
            timeout: 1500,
            text: 'Item added to cart',
            progressBar: false,
            // layout:'topLeft'

        }).show();

    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1500,
            text: 'Item don`t added, Something went wrong',
            progressBar: false,
            // layout:'topLeft'

        }).show();
    })
}


Object.keys(addToCart).forEach((btn) => {
    addToCart[btn].onclick = function (e) {
        // console.log(e);
        let pizza = JSON.parse(addToCart[btn].dataset.pizza);
        // console.log(pizza);
        updateCart(pizza)

    }

})



// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}

initAdmin()
