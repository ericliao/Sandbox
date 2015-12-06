(function() {
    var scene,
        camera,
        renderer,
        mesh,
        controller,
        sphere,
        THREE = window.THREE;

    var renderScene = function() {

        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;
        var mouseXOnMouseDown, mouseX;


        // scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

        // camera
        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.y = -100;
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

        var ballGeo = new THREE.SphereGeometry( 20, 20, 20 );
        var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );

        sphere = new THREE.Mesh( ballGeo, ballMaterial );
        sphere.position.z = 50;
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.material.visible = false;
        scene.add( sphere );

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( scene.fog.color );

        document.getElementById("scene").appendChild( renderer.domElement );

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        renderer.shadowMap.enabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;

        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );
        document.addEventListener( 'touchend', onDocumentTouchEnd, false );

        function onDocumentTouchStart( event ) {
            sphere.interacting = true;
            sphere.position.z = 10;
        }

        function onDocumentTouchMove( event ) {
            if ( event.touches.length === 1 ) {
                event.preventDefault();
                mouseX = event.touches[ 0 ].pageX - windowHalfX;
                mouseY = event.touches[ 0 ].pageY - windowHalfY;
                sphere.position.x = mouseX;
                sphere.position.y = -mouseY;
            }
        }

        function onDocumentTouchEnd( event ) {
            sphere.position.z = 1000;
            sphere.interacting = false;
        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

        }

        animate();
    };

    function animate(time) {
        requestAnimationFrame( animate );

        simulate(time, sphere);
        render();
    }

    function render() {
        var p = cloth.particles, plength = p.length, ii;

        for (ii = 0, il = plength; ii < il; ii ++ ) {

            clothGeometry.vertices[ ii ].copy( p[ ii ].position );

        }

        clothGeometry.computeFaceNormals();
        clothGeometry.computeVertexNormals();

        clothGeometry.normalsNeedUpdate = true;
        clothGeometry.verticesNeedUpdate = true;

        camera.lookAt( scene.position );

        renderer.render( scene, camera );
    }

    renderScene();

}).call(this);
