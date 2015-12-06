function renderScene(javascriptNode, analyser) {
    var scene,
        camera,
        renderer,
        mesh,
        windStrength;

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

    // camera
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.y = -50;
    camera.position.z = 1000;
    camera.fov = 100;
    scene.add( camera );

    // lights

    var light, materials;

    scene.add( new THREE.AmbientLight( 0x666666 ) );

    light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );

    light.castShadow = true;

    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;

    var d = 300;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 1000;

    scene.add( light );

    var clothTexture = THREE.ImageUtils.loadTexture( 'textures/scarf.jpg' );
    clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
    clothTexture.anisotropy = 8;

    var clothMaterial = new THREE.MeshPhongMaterial( {
        specular: 0x030303,
        emissive: 0x111111,
        map: clothTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    } );

    // cloth geometry
    clothGeometry = new THREE.ParametricGeometry( clothFunction, cloth.w, cloth.h );
    clothGeometry.dynamic = true;

    // cloth mesh

    object = new THREE.Mesh( clothGeometry, clothMaterial );
    object.position.set( 0, 0, 0 );
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add( object );

    var groundTexture = THREE.ImageUtils.loadTexture( "textures/grasslight-big.jpg" );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 25, 25 );

    var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: groundTexture } );

    mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );
    mesh.position.y = -250;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    // poles

    var poleGeo = new THREE.BoxGeometry( 5, 375, 5 );
    var poleMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 100 } );

    mesh = new THREE.Mesh( poleGeo, poleMat );
    mesh.position.x = -125;
    mesh.position.y = -62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add( mesh );

    mesh = new THREE.Mesh( poleGeo, poleMat );
    mesh.position.x = 125;
    mesh.position.y = -62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add( mesh );

    mesh = new THREE.Mesh( new THREE.BoxGeometry( 255, 5, 5 ), poleMat );
    mesh.position.y = -250 + 750/2;
    mesh.position.x = 0;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add( mesh );

    var gg = new THREE.BoxGeometry( 10, 10, 10 );
    mesh = new THREE.Mesh( gg, poleMat );
    mesh.position.y = -250;
    mesh.position.x = 125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add( mesh );

    mesh = new THREE.Mesh( gg, poleMat );
    mesh.position.y = -250;
    mesh.position.x = -125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( scene.fog.color );

    $("#scene").append( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    animate();

    function animate(time) {
        requestAnimationFrame( animate );

        // when the javascript node is called
        // we use information from the analyzer node
        // to draw the volume
        javascriptNode.onaudioprocess = function() {
            // get the average for the first channel
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);

            windStrength = Math.cos( time / 7000 ) * Math.max.apply(Math, array);
            windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) ).normalize().multiplyScalar( windStrength );
        };

        simulate(time);
        render();
    }

    function render() {
        var timer = Date.now() * 0.0002;

        var p = cloth.particles;

        for ( var i = 0, il = p.length; i < il; i ++ ) {

            clothGeometry.vertices[ i ].copy( p[ i ].position );

        }

        clothGeometry.computeFaceNormals();
        clothGeometry.computeVertexNormals();

        clothGeometry.normalsNeedUpdate = true;
        clothGeometry.verticesNeedUpdate = true;

        camera.position.x = Math.cos( timer ) * 1000;
        camera.position.z = Math.sin( timer ) * 1000;

        camera.lookAt( scene.position );

        renderer.render( scene, camera );
    }
}