console.log("service workers lancé..");
 
 var filesToCache = [
 	'/offline.html',
 	'/images/offline.png',
  '/images/header.jpg',
  '/videos/code.mp4'
 ];


/*Lorsque l'user fait une demande (request)*/
self.addEventListener('fetch', 
function(event) {
  event.respondWith(
    caches.match(event.request).then(function (response){
    	return response || fetch(event.request).then(function(responseF){
        return caches.open('dynamic-cache').then(function(cache){
          cache.put(event.request, responseF.clone());
          return responseF;
        })
      });
    }).catch(function(){
    	return caches.match('/offline.html');
    })
  );
});


//a l'installation :
self.addEventListener('install', function(event){
  console.log("Service workers installé");
	self.skipWaiting();
	event.waitUntil(
		caches.open('offline-caches').then(function(cache){
			cache.addAll(filesToCache);
		})
	);
});
