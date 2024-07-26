function init() {
    let textureLoader = new THREE.TextureLoader();
    let texture = textureLoader.load('obj/textures/mug-031-col-specular-4k.png');
    const renderer = initRenderer();
    const scene = initScene();
    const camera = initCamera();
    const stats = initStats();

    // Removendo o chão
    /*
    let planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
    let plane = new THREE.Mesh(
        planeGeometry,
        new THREE.MeshLambertMaterial({ color: 0xffffff })
    );

    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0, 0, 0);
    scene.add(plane);
    */

    camera.lookAt(scene.position);
    let spotLight = initSpotLight();
    scene.add(spotLight);

    let spotLight2 = initSpotLight2();
    scene.add(spotLight2);

    let ambientLight = new THREE.AmbientLight(0x3c3c3c);
    scene.add(ambientLight);

    document.getElementById("webgloutput").appendChild(renderer.domElement);

    const trackballControls = initTrackballControls(camera, renderer);
    const clock = new THREE.Clock();


    let loader = new THREE.OBJLoader();
    loader.load('obj/mug-031.obj', function (mesh) {
        var material = new THREE.MeshLambertMaterial({
            map: texture
        });
        mesh.children.forEach(function (child) {
            child.material = material;
            child.geometry.computeVertexNormals();
            child.geometry.computeFaceNormals();
        });
        mesh.position.y = 10;
        mesh.scale.set(100, 100, 100);
        mesh.castShadow = true;
        mesh.rotation.x = 5.1;
        scene.add(mesh);
    });

    // Adicionar o cilindro
    function addCylinder() {
        var cylinderGeometry = new THREE.CylinderGeometry(4, 4, 5, 32);
        var cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x964b00 });
        var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(0, 10, -4); // Ajuste a posição conforme necessário
        cylinder.rotation.x = 5.1;
        cylinder.castShadow = true;
        scene.add(cylinder);
    }

    // Adicionar o cilindro na inicialização
    addCylinder();

    // Adiciona um circulo
    function addCircle(size, x,y,z) {
        var circleGeometry = new THREE.CircleGeometry(size, 32);
        var circleMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        var circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.position.set(x,y,z); // Ajuste a posição conforme necessário
        circle.rotation.x = 5.1;
        circle.castShadow = true;
        scene.add(circle);
    }

    // Adicionar o círculo na inicialização
    addCircle(1, 0.05, 30, -1.5);
    addCircle(0.5, -0.8, 30, -2.3);
    addCircle(0.5, 0.9, 30, -2.3);

    let controls = {
        rotationSpeed: 0,
        numberOfObjects: scene.children.length,
        removeCube: function () {
            var allChildren = scene.children;
            var lastObject = allChildren[allChildren.length - 1];
            if (lastObject instanceof THREE.Mesh) {
                scene.remove(lastObject);
                this.numberOfObjects = scene.children.length;
            }
        },

        addSugarCube: function () {
            var cubeSize = 3;
            var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            var cubeMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff
            });
            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.castShadow = true;
            cube.name = "cube-" + scene.children.length;

            // Ajuste as posições dos cubos para não depender do chão removido
            cube.position.x = 0
            cube.position.y = 10
            cube.position.z = -20
            cube.rotation.x = 5.1;
            scene.add(cube);
            this.numberOfObjects = scene.children.length;
            console.log('Created cube with name: ' + cube.name);
        }
    }

    var gui = new dat.GUI();
    gui.add(controls, 'addSugarCube');
    gui.add(controls, 'numberOfObjects').listen();

    let step = 0;
    function renderScene() {
        stats.update();
        trackballControls.update(clock.getDelta());

        scene.traverse(function (e) {
            // se for um cubo, faça ele girar
            if (e.name.includes('cube')) {
                e.position.z += 0.1;
                // se o cubo sair da tela, remova ele
                if (e.position.z > -2) {
                    scene.remove(e);
                    controls.numberOfObjects = scene.children.length;

                    console.log('Removed cube with name: ' + e.name);
                }
            }
        });

        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    }

    renderScene();

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize, false);
}

function initRenderer() {
    let renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    return renderer;
}

function initScene() {
    let scene = new THREE.Scene();
    // let axes = new THREE.AxesHelper(20);
    // scene.add(axes);
    return scene;
}

function initCamera() {
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 80, 0);
    return camera;
}

function initSpotLight() {
    let spotLight = new THREE.SpotLight(0xffffff, 1.2, 150, 120);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    return spotLight;
}

function initSpotLight2() {
    let spotLight = new THREE.SpotLight(0xffffff, 1.2, 150, 120);
    spotLight.position.set(40, 60, 10);
    spotLight.castShadow = true;
    return spotLight;
}

function initStats(type) {
    //DOCS https://github.com/mrdoob/stats.js/
    var panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
    var stats = new Stats();
    stats.showPanel(panelType); // 0: fps, 1: ms
    document.body.appendChild(stats.dom);
    return stats;
}

function initTrackballControls(camera, renderer) {
    //DOCS https://threejs.org/docs/#examples/en/controls/TrackballControls
    var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.2;
    trackballControls.panSpeed = 0.8;
    trackballControls.staticMoving = true;
    return trackballControls;
}

init(); // Chama a função init para executar o código
