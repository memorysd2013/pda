if ('serviceWorker' in navigator) {
  //- Register custom-sw.js
  navigator.serviceWorker.register('/custom-sw.js')
    .then(reg => {
      console.log('SW registered!', reg)
    })
    .catch(err => console.log('SW Failed!', err));
}