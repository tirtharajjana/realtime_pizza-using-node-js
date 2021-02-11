import axios from 'axios'
import Noty from 'noty'
// const initAdmin =require('./admin')
import { initAdmin } from './admin'
import moment from 'moment'

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


//change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if (stepCompleted) {
            status.classList.add('step-completed')
        }
        if (dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
        }
    })

}


updateStatus(order);

//socket 
let socket = io()

//join
if (order) {
    socket.emit('join', `order_${order._id}`)

}

let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
    initAdmin(socket)
    socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1500,
        text: 'Order updated',
        progressBar: false,
        // layout:'topLeft'

    }).show();

})