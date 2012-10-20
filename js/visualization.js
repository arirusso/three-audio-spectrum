function Visualizer(model, selector) {
  this.model = model;
	// set the scene size
	this.WIDTH = 1024;
	this.HEIGHT = 512;

  this.$container = $(selector);

	// create a WebGL renderer, camera
	// and a scene
	this.renderer = new THREE.WebGLRenderer();
	this.scene = new THREE.Scene();

	// start the renderer
	this.renderer.setSize(this.WIDTH, this.HEIGHT);

	// attach the render-supplied DOM element
	this.$container.append(this.renderer.domElement);

  this._y = d3.scale.linear()
    .domain([0, this.height])
    .rangeRound([0, this.height]);
  this.color = d3.scale.linear()
    .domain([0, 500])
    .range(["white", "red"]);
  this.amplitude = d3.scale.linear()
    .domain([0,10])
    .range([1, 1.5]);

  this.texture = THREE.ImageUtils.loadTexture("assets/images/wood.jpeg");

  this.initializeObjects();
  this.initializeCamera();
  this.initializeControls();
  this.initializeLight();	

  this.counter = 0;
  this.zvec = 1;
  this.yvec = -1;
  this.dir = 500;
}

Visualizer.prototype._x = function(n) {
  return d3.scale.linear()
    .domain([0, 1])
    .range([0, this.barWidth()])(n);
}

Visualizer.prototype.barWidth = function() {
  var dataLength = Math.min(this.model.length(), (this.model.data.length || this.model.getInitialData().length));
  return this.elementWidth / dataLength;
}

Visualizer.prototype.initializeControls = function() {
  this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement);
}

Visualizer.prototype.initializeCamera = function() {
	// set some camera attributes
	var ASPECT = this.WIDTH / this.HEIGHT;
  this.camera = new THREE.PerspectiveCamera( 25, ASPECT, 50, 1e7 );
  this.camera.position.z = this.objects.length * (this.objWidth * 2);
	// and the camera
	this.scene.add(this.camera);
  this.camspeed = 10;
}

Visualizer.prototype.initializeLight = function() {
  // create a point light
	var ambLight = new THREE.AmbientLight( 0x333333 );
	this.scene.add(ambLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(10, 100, 200).normalize();
  this.scene.add(directionalLight);
}

Visualizer.prototype.initializeMaterial = function() {

  var material = new THREE.MeshLambertMaterial( { map: this.texture } );

  return material;
}

Visualizer.prototype.initializeObject = function(index, length, spacer) {
  var material = this.initializeMaterial();
  var geometry = new THREE.CubeGeometry( this.objWidth, this.objWidth, this.objWidth, 1, 1, 1, material);

	var shape = new THREE.Mesh(geometry, material);

  shape.geometry.dynamic = true;

  // changes to the vertices
  shape.geometry.__dirtyVertices = true;

  // changes to the normals
  shape.geometry.__dirtyNormals = true;
  shape.geometry.__dirtyColors = true;

  var xposition = (index * (this.objWidth + spacer)) - (((this.objWidth + spacer) * length) / 2);
  shape.position.x = xposition;

  return shape;
}

Visualizer.prototype.initializeObjects = function() {
  this.objects = [];
  var length = this.model.length() / 24;
  this.objWidth = 1024 / length;
  var space = (this.objWidth / 8);

  for (var i = 0; i <= length; i++) {
    var shape = this.initializeObject(i, length, space);
    this.objects.push(shape);
  }

	for (i in this.objects) {
    this.scene.add(this.objects[i]);
  }
}

Visualizer.prototype.reset = function() {
  this.removeObjects();
  this.initializeObjects();
}

Visualizer.prototype.removeObjects = function() {
  for (var i in this.objects) {
    this.scene.remove(this.objects[i]);
  }
}

Visualizer.prototype.render = function() {
  this.controls.update(1);
  var vis = this;
  requestAnimationFrame(function() { vis.render() });
  var len = this.model.data.length;
  if (len > 0) {
    var modlen = len / this.objects.length;
    for (i in this.model.data) {
      var val = this.model.data[i] / 25;
      var objectIndex = Math.floor(i / modlen);
      var obj = this.objects[objectIndex];
      var delta = this.model.delta[i] || 0;
      delta = Math.abs(Math.floor(delta));
      var rawColor = this.color(delta);
      var num = rawColor.split("#")[1];
      var hex = parseInt(num, 16);
      obj.material.color.setHex(hex);
      obj.colorsNeedUpdate = true;
      obj.scale.y = this.amplitude(val);
      obj.scale.z = this.amplitude(val);

    }
  }
	// draw!
	this.renderer.render(this.scene, this.camera);
}
