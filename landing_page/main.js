(function(){
	if ('serviceWorker' in navigator) {
	  	navigator.serviceWorker.register('service-worker.js').then(function(registration){
	  		//ok
			console.log('Enregistrement du sw OK:', registration.scope);  		
	  	}, function(err){
		  		//échoué
				console.log('Impossible de charger le sw:', err);  		
	  	});	  
	}
})();