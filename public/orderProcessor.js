const socket = io();

const processOrderBtn = document.getElementById("btn-process");
const processOrderDeliveryBtn = document.getElementById("btn-process-delivery");
const isDriver = document.cookie.split("=")[1];

async function getUserLocation (driver) {
  
  if (navigator.geolocation) {
    if (!driver) {
      await navigator.geolocation.watchPosition(setUserCoord);
    } else {
      await navigator.geolocation.watchPosition(setDriverCoord);
    }
  } else {
    window.alert("Geolocation is not supported by this browser.");
  }
};

function setUserCoord(position) {
    localStorage.setItem("user_lat", position.coords.latitude);
    localStorage.setItem("user_long", position.coords.longitude);
}

function setDriverCoord(position) {
  localStorage.setItem("driver_lat", position.coords.latitude);
  localStorage.setItem("driver_long", position.coords.longitude);
}

getUserLocation(isDriver);


if (processOrderBtn) {
  processOrderBtn.addEventListener("click", async (e) => {
    
    // first extract the order_id from the url
    const order_id = location.search.split("=")[1];
    // also get the users location payload
    const longitude = localStorage.getItem("user_lat");
    const latitude = localStorage.getItem("user_lat");

    socket.emit("order.process", { order_id , longitude, latitude });
  })
}


if (processOrderDeliveryBtn) {
  processOrderDeliveryBtn.addEventListener("click", (e) => {
    const longitude = localStorage.getItem("driver_lat");
    const latitude = localStorage.getItem("driver_lat");

    const order_id = location.search.split("=")[1];
    socket.emit("order.process.delivery", { order_id, longitude, latitude });
  })
}

socket.on("order.delivery.in_progress", (order) => {
  if (!isDriver) {
    localStorage.setItem("driver_lat", order.driver_lat);
    localStorage.setItem("driver_long", order.driver_long);
    window.location.href=`localhost:3000/orders/${order.order_id}/deliveryInfo`;
  } else {
    getUserLocation(false);
    window.location.href=`localhost:3000/orders/${order.order_id}/deliveryInfo`;
  }
})

// let navigationUpdate = setInterval(() => {
//   getUserLocation(isDriver);
//   const longitude = localStorage.getItem("user_lat");
//   const latitude = localStorage.getItem("user_lat");
//   const driver_longitude = localStorage.getItem("driver_lat");
//   const driver_latitude = localStorage.getItem("driver_lat");
//   // console.log(longitude, latitude, driver_latitude, driver_longitude);
// }, 1000);

// clearInterval(navigationUpdate)