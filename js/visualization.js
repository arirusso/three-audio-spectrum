function Visualizer(model, selector) {
  this.model = model;
	// set the scene size
	this.WIDTH = 1024;
	this.HEIGHT = 600;

	// get the DOM element to attach to
	// - assume we've got jQuery to hand
	var $container = $(selector);

	// create a WebGL renderer, camera
	// and a scene
	this.renderer = new THREE.WebGLRenderer();
	this.scene = new THREE.Scene();

	// start the renderer
	this.renderer.setSize(this.WIDTH, this.HEIGHT);

	// attach the render-supplied DOM element
	$container.append(this.renderer.domElement);

  this.initializeObjects();
  this.initializeCamera();
  this.initializeLight();	
}

Visualizer.prototype.initializeCamera = function() {
	// set some camera attributes
	var VIEW_ANGLE = 90,
	    ASPECT = this.WIDTH / this.HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;

	this.camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
	                                ASPECT,
	                                NEAR,
	                                FAR  );

	// the camera starts at 0,0,0 so pull it back
	this.camera.position.z = 300;
	// and the camera
	this.scene.add(this.camera);
}

Visualizer.prototype.initializeLight = function() {
  // create a point light
	var pointLight = new THREE.PointLight( 0xFFFFFF );

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 200;

	// add to the scene
	this.scene.add(pointLight);
}

Visualizer.prototype.initializeObjects = function() {
  this.objects = [];
  	// create the sphere's material
	var material = new THREE.MeshLambertMaterial({ color: 0x000099});

  for (var i = 0; i <= 10; i++) {

    var geometry = new THREE.CubeGeometry( 60, 60, 60, 1, 1, 1, material);

	  var shape = new THREE.Mesh(geometry, material);

    // set the geometry to dynamic
    // so that it allow updates
    shape.geometry.dynamic = true;

    // changes to the vertices
    shape.geometry.__dirtyVertices = true;

    // changes to the normals
    shape.geometry.__dirtyNormals = true;

    shape.position.x = (i * 70) - 300;

    this.objects.push(shape);
  }

	for (i in this.objects) {
    this.scene.add(this.objects[i]);
  }
}

Visualizer.prototype.render = function() {
  var vis = this;
  requestAnimationFrame(function() { vis.render() });
  var len = this.model.data.length
  if (len > 0) {
    var modlen = len / this.objects.length
    for (i in this.objects) {
      var d = this.model.data[Math.floor(i * modlen)];
      var dd = d / 1000;
      //console.log(dd);
      if (dd > 0) {
        this.objects[i].rotation.x += dd;
      }
    }
  }
	// draw!
	this.renderer.render(this.scene, this.camera);

}
