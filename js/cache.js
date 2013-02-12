"use strict";
var cache = new function() {
	this.models = {};
	this.modelMaterials = {};
	var self = this;
	var loader = new THREE.JSONLoader(true);
	loader.statusDomElement = document.createElement("div");
	loader.statusDomElement.id = "loading";
	loader.statusDomElement.innerHTML = "Loading...";
	document.body.appendChild(loader.statusDomElement);
	var modelsPending = 0;

	this.loadModel = function(path, callback, texturePath) {
		var m = this.models[path];
		if (!m) { // First time request for this model
			this.models[path] = [ callback ];
			loader.statusDomElement.style.display = "block";
			modelsPending++;
			loader.load(path, function(geometry, materials) {
				var mm = self.models[path];
				for (var i = 0; i < mm.length; ++i)
					mm[i](geometry, materials);
				self.models[path] = geometry;
				self.modelMaterials[path] = materials;
				modelsPending--;
				if (modelsPending === 0)
					loader.statusDomElement.style.display = "none";
			}, texturePath);
		} else if (m instanceof Array) { // Pending
			m.push(callback);
		} else // Already loaded
			callback(m, this.modelMaterials[path]);
	};
};
