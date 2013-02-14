
JET.ParticleMaterials = {
	trail: new THREE.ParticleBasicMaterial({
		color: 0xffffff,
		size: 5,
		map: THREE.ImageUtils.loadTexture("assets/smoke.png"),
		sizeAttenuation: true,
		vertexColors: true,
		depthWrite: true,
		transparent: true,
		opacity: 0.75
	})
};

JET.GradientLib = {
	trail: new JET.ColorGradient(0xcccccc, 0xffaa88)
};
JET.GradientLib.trail.add(0.80, 0xbbbbbb);


JET.Particle = function(index) {
	this.index = index || 0;
	this.velocity = new THREE.Vector3();
	this.lifeTime = 0;
};

JET.Emitter = function(params) {
	this.maxParticles = params.maxParticles;
	this.spawner = params.spawner;
	this.onBorn = params.onBorn;
	this.onUpdate = params.onUpdate;
	this.geometry = new THREE.Geometry();
	this.particles = new Array(this.maxParticles);
	this.geometry.vertices = new Array(this.maxParticles);
	this.geometry.colors = new Array(this.maxParticles);
	for (var i = 0; i < this.maxParticles; ++i) {
		this.geometry.vertices[i] = new THREE.Vector3();
		this.geometry.colors[i] = new THREE.Color();
		this.particles[i] = new JET.Particle(i);
	}
	this.particleSystem = new THREE.ParticleSystem(this.geometry, params.material);
	this.particleSystem.sortParticles = params.sortParticles || true;
	if (params.parent) params.parent.add(this.particleSystem);
};

JET.Emitter.prototype.update = function(dt) {
	var spawnAmount = this.spawner(dt);
	for (var i = 0; i < this.maxParticles; ++i) {
		var particle = this.particles[i];
		var position = this.geometry.vertices[i];
		var color = this.geometry.colors[i];
		particle.lifeTime -= dt;
		if (particle.lifeTime <= 0 && spawnAmount > 0) {
			this.onBorn(particle, position, color);
			--spawnAmount;
		} else if (particle.lifeTime > 0)
			this.onUpdate(particle, position, color, dt);
	}
	this.geometry.verticesNeedUpdate = true;
	this.geometry.colorsNeedUpdate = true;
}

// Create a simple fire emitter
JET.createTrail = function(parent) {
	var v = new THREE.Vector3();
	var toCreate = 0;
	var maxLife = 2;
	var emitter = new JET.Emitter({
		parent: scene,
		maxParticles: 400,
		material: JET.ParticleMaterials.trail,
		spawner: function(dt) {
			toCreate += 200 * dt;
			var amount = toCreate|0;
			toCreate -= amount;
			return amount;
		},
		onBorn: function(particle, position, color) {
			particle.lifeTime = maxLife;
			var speed = -40 + Math.random();// * 20 + parent.speed;
			particle.velocity.x = Math.cos(parent.angle) * speed + Math.random()*2;
			particle.velocity.y = Math.sin(parent.angle) * speed + Math.random()*2;
			position.copy(parent.position);
			position.z -= 2;
			JET.GradientLib.trail.getTo(1.0, color);
		},
		onUpdate: function(particle, position, color, dt) {
			v.copy(particle.velocity).multiplyScalar(dt);
			position.add(v);
			particle.velocity.multiplyScalar(1.0 - 0.5 * dt); // Some drag
			JET.GradientLib.trail.getTo(particle.lifeTime / maxLife, color);
		}
	});
	return emitter;
};



// Particle system initializer for simple particle flames
// TODO: Remove
JET.createParticleSystem = function(nParticles, material) {
	var i, geometry = new THREE.Geometry();
	// Init vertices & colors
	geometry.vertices = new Array(nParticles);
	geometry.colors = new Array(nParticles);
	for (i = 0; i < nParticles; ++i) {
		geometry.vertices[i] = new THREE.Vector3();
		geometry.colors[i] = new THREE.Color();
	}
	// Init particle system
	var particleSystem = new THREE.ParticleSystem(geometry, material);
	particleSystem.sortParticles = true;
	return particleSystem;
};
