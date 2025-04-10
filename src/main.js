import * as THREE from "three";
import gsap from "gsap";
import {
  initScene,
  initCamera,
  initRenderer,
  initLights,
  createPlanets,
  randomAsteroids,
  addStars,
  postProccesing,
} from "./modules/init";
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createDialog, initInstructions } from "./modules/dialog";
import {
  handleResize,
  handleScroll,
  handleClick,
  handleKeyDown,
} from "./modules/eventHandlers";
import {
  dialogData,
  planetData,
  sectionCoordinates,
} from "./modules/constValues";
import { isInBetween } from "./modules/utils";
import { setAstronautVelocity, updateAstronaut } from "./modules/astronaut";

import {
  initTechStackSection,
  updateTechPosition,
  updateTechRotation,
} from "./modules/techStack";
import { createBeacon, moveBeacon } from "./modules/contactme";
import { loadAstronaut } from "./modules/astronaut";
import {
  animatePlanets,
  animateStars,
  animateAsteroids,
} from "./modules/animations";


/**
 * keep hold of the current focus
 * -1 means on astronaut
 * -2 means on dialog
 * n means on planet n
 * **/
const state = {
  canMove: true,
  currentFocus: -1, // -1 means on astronaut, -2 means on dialog, n means on planet n,
  contactShown: false,
  goToSection: -1, // -1 mean no section, n mean go to section n
  goToPlanet: -1, // -1 mean no planet, n mean go to planet n
};

function setupEventListeners(camera, renderer, renderer3D, outlinePass, bloomEffect, ssaaPass, composer, astronaut, state, planets, techStack, beacon, bokehPass) {
  window.addEventListener("resize", () =>
    handleResize(camera, renderer, renderer3D, outlinePass, bloomEffect, ssaaPass, composer)
  );

  window.addEventListener("wheel", (event) =>
    handleScroll(event, astronaut, camera, state, bokehPass)
  );

  window.addEventListener("click", (event) =>
    handleClick(event, camera, planets, state, techStack, bokehPass, beacon)
  );

  document.addEventListener("keydown", (event) =>
    handleKeyDown(event, astronaut, camera, state)
  );
}

function setupNavigation(nav, navItems, state) {
  nav.addEventListener("mousemove", (event) => {
    const rect = nav.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;

    nav.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
  });

  nav.addEventListener("mouseleave", () => {
    gsap.to(nav.style, {
      duration: 0.5,
      ease: "power2.out",
      transform: "rotateX(0deg) rotateY(0deg)",
    });
  });

  navItems.forEach((navItem, index) => {
    if (navItem.id === "nav-projects-dropdown-container") return;

    navItem.addEventListener("click", () => {
      if (
        state.canMove === false ||
        state.contactShown ||
        state.currentFocus !== -1
      )
        return;
      navItems.forEach((item) => item.classList.remove("active"));
      navItem.classList.add("active");
      state.goToSection = index;
    });
  });
}

function setupPlanetNavigation(navigationPlanets, planetData, state) {
  planetData.reverse().forEach((planet, index) => {
    const planetElement = document.createElement("li");
    planetElement.id = index;
    const planetLink = document.createElement("a");
    planetLink.className = "nav-item";
    planetLink.innerText = planet.name;

    planetLink.addEventListener("click", () => {
      if (state.canMove === false || state.contactShown) return;
      state.goToPlanet = index;
    });

    planetElement.appendChild(planetLink);
    navigationPlanets.appendChild(planetElement);
  });
}


// Automatically play music on page load
function autoPlayMusic(audioLoader, listener) {
  const backgroundMusic = new THREE.Audio(listener);
  audioLoader.load("./music/space.mp3", (buffer) => {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.5);
    backgroundMusic.play();
  });
  return backgroundMusic;
}

// Added a function to handle music toggle
function setupMusicToggle(audioLoader, listener) {
  const musicToggle = document.getElementById("music-toggle");
  const backgroundMusic = autoPlayMusic(audioLoader, listener);

  musicToggle.addEventListener("click", () => {
    if (backgroundMusic.isPlaying) {
      backgroundMusic.stop();
      musicToggle.innerText = "Play Music";
    } else {
      audioLoader.load("./music/space.mp3", (buffer) => {
        backgroundMusic.setBuffer(buffer);
        backgroundMusic.setLoop(true);
        backgroundMusic.setVolume(0.5);
        backgroundMusic.play();
        musicToggle.innerText = "Stop Music";
      });
    }
  });

  return backgroundMusic;
}



async function main() {

  // Scene Setup
  const scene = initScene();
  const renderer = initRenderer();
  const camera = initCamera();
  scene.add(camera);


  const renderer3D = new CSS3DRenderer();
  renderer3D.setSize(window.innerWidth, window.innerHeight);
  renderer3D.domElement.id = "renderer3D";

  // Append to DOM
  document.body.appendChild(renderer3D.domElement);
  document.body.appendChild(renderer.domElement);

  // // Helpers
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  // Lights
  initLights(scene);

  // Background - HDR Space Texture
  const loader = new THREE.TextureLoader();
  loader.load("./textures/space_blue.png", (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.setScalar(1);
    texture.encoding = THREE.sRGBEncoding;
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = texture;
    scene.background = texture;

    const aspectRatio = texture.image.width / texture.image.height;
    const geometry = new THREE.PlaneGeometry(1000 * aspectRatio, 1000);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const backgroundPlane = new THREE.Mesh(geometry, material);
    backgroundPlane.position.set(40, 250, -400); // Adjust as needed
    scene.add(backgroundPlane);
  });

  // Stars
  const stars = addStars(scene, 2000);
  const currentDownloaderElement = document.getElementById("current-download");

  // Load Astronaut Model
  currentDownloaderElement.innerText = "Downloading Astronaut Model";
  const { astronaut, animations } = await loadAstronaut(scene);

  // Planets
  currentDownloaderElement.innerText = "Downloading Planets";
  const planets = await createPlanets(scene, camera);

  // Contact Section
  currentDownloaderElement.innerText = "Downloading Beacon";
  const beacon = await createBeacon(scene, new THREE.Vector3(-10, 460, -15));
  document.getElementById("close-sos").addEventListener("click", () => {
    state.contactShown = false;
    const element = document.getElementById("sos-interface");
    element.classList.remove("visible");
    element.classList.add("hidden");
  });

  // astroids
  let animateAstrroProgress = 0;
  const { curve, instancedMesh } = randomAsteroids(scene, 200);

  // techStack
  currentDownloaderElement.innerText = "Downloading TechStacks";
  const techStack = await initTechStackSection(scene, camera);
  let selection = [];

  techStack.children.forEach((stack) => {
    selection.push(stack.children[0]);
  });
  selection.push(beacon);

  // Post Processing
  const { composer, bokehPass, outlinePass, bloomEffect, ssaaPass } = postProccesing(
    scene,
    camera,
    renderer,
    selection
  );

  // Stats
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  // Load background music
  const audioLoader = new THREE.AudioLoader();
  const listener = new THREE.AudioListener();
  camera.add(listener);


  // Setup music toggle & auto play
  const backgroundMusic = setupMusicToggle(audioLoader, listener, camera);

  // Setup Event Listeners
  setupEventListeners(camera, renderer, renderer3D, outlinePass, bloomEffect, ssaaPass, composer, astronaut, state, planets, techStack, beacon, bokehPass);

  // Setup Navigation
  const nav = document.getElementById("navigation");
  const navItems = document.querySelectorAll(".nav-item");
  setupNavigation(nav, navItems, state);

  const navigationPlanets = document.getElementById("nav-projects-dropdown");
  setupPlanetNavigation(navigationPlanets, planetData, state);

  // function for navigation
  let isMovingToSection = false;
  const handleGoto = (minY, maxY) => {
    const isInside = isInBetween(astronaut.position.y, minY, maxY);
    if (isInside && isMovingToSection === false) {
      state.goToSection = -1;
      return;
    }

    isMovingToSection = true;
    const targetPosition = new THREE.Vector3().copy(astronaut.position);
    targetPosition.y = minY + 1;
    setAstronautVelocity(0);
    astronaut.position.y = astronaut.position.lerp(targetPosition, 0.05).y;
    camera.position.y = astronaut.position.y + 2;

    if (
      isInBetween(
        astronaut.position.y,
        targetPosition.y - 0.1,
        targetPosition.y + 0.1
      )
    ) {
      isMovingToSection = false;
    }
  };

  // astronaut animations
  const animation = animations[0];
  const mixer = new THREE.AnimationMixer(astronaut);
  const action = mixer.clipAction(animation);
  action.play();

  // pointer events for all children are none
  renderer3D.domElement.childNodes.forEach((child) => {
    child.style.pointerEvents = "none";
  });

  {
    const tempElement = document.getElementById("loading");
    tempElement.style.opacity = 0;
    tempElement.style.transform = "TranslateY(100%)";

    setTimeout(() => {
      tempElement.style.display = "none";
    }, 1500);
  }


  scene.add(initInstructions());
  /** @type {CSS3DObject[]} **/
  let allDialogsShown = [];

  let astroHeight = 0;
  let lastDialogId = -1;
  let idsToshow = {};
  dialogData.forEach((dialog) => {
    idsToshow[dialog.id] = false;
  });
  const startTime = Date.now();
  let currentTime = 0;

  const boundingBox = new THREE.Box3().setFromObject(astronaut);
  astroHeight = boundingBox.max.y - boundingBox.min.y;
  const clock = new THREE.Clock();

  // Camera Animation to astronaut
  gsap.to(camera.position, {
    ease: "power4.out",
    duration: 1,
    x: 0,
    y: astronaut.position.y + 2,
    z: astronaut.position.z + 15,
  });


  // Animation Loop
  function animate() {
    stats.begin();
    mixer.update(0.01);
    currentTime = (currentTime + Date.now() - startTime) / 1000;
    const deltaTime = clock.getDelta();

    if (state.goToSection > -1) {
      state.goToPlanet = -1;
      const position = sectionCoordinates[state.goToSection];
      handleGoto(position.minY, position.maxY);
    } else {
      sectionCoordinates.forEach((position, index) => {
        if (isInBetween(astronaut.position.y, position.minY, position.maxY)) {
          if (!navItems[index].classList.contains("active"))
            navItems[index].classList.add("active");
        } else navItems[index].classList.remove("active");
      });
    }

    if (state.goToPlanet > -1) {
      const planet = planetData[state.goToPlanet];
      const targetPosition = new THREE.Vector3().copy(astronaut.position);
      targetPosition.y = planet.position.y - 1;
      setAstronautVelocity(0);
      astronaut.position.y = astronaut.position.lerp(targetPosition, 0.05).y;
      camera.position.y = astronaut.position.y + 2;

      if (
        isInBetween(
          astronaut.position.y,
          targetPosition.y - 0.1,
          targetPosition.y + 0.1
        )
      ) {
        state.goToPlanet = -1;
      }
    }

    // planets
    animatePlanets(planets, currentTime, camera);

    // stars
    animateStars(stars, currentTime);

    // asteroids
    animateAsteroids(curve, instancedMesh, deltaTime, animateAstrroProgress);

    // beacon
    moveBeacon(beacon, currentTime);

    // techStack
    techStack.children.forEach((stack, index) => {
      updateTechPosition(stack, currentTime, index);
      updateTechRotation(stack.children[0], currentTime, index);
    });

    if (state.goToSection === -1 && state.goToPlanet === -1) {
      if (state.canMove) {
        // astronaut
        updateAstronaut(astronaut, camera, state, deltaTime);
      }

      // Dialogs
      dialogData.forEach((dialog) => {
        const dialogVisible = isInBetween(
          dialog.dialogPosition.y,
          astronaut.position.y - 2,
          astronaut.position.y + 2
        );

        if (dialogVisible) {
          // first time dialog is shown
          if (!allDialogsShown[dialog.id]) {
            allDialogsShown[dialog.id] = createDialog(scene, dialog.text, {
              x: dialog.dialogPosition.x,
              y: dialog.dialogPosition.y + astroHeight / 2,
              z: astronaut.position.z,
            });

            setTimeout(() => {
              idsToshow[dialog.id] = true;
              allDialogsShown[dialog.id].element.className =
                "user-dialog visible";
            }, 50);
          }

          // animate dialog
          allDialogsShown[dialog.id].position.y +=
            0.001 * Math.sin(currentTime * 1.5);
          allDialogsShown[dialog.id].position.x +=
            0.00025 * Math.cos(currentTime);
          allDialogsShown[dialog.id].position.z += 0.0005 * Math.sin(currentTime);

          // set the last dialog id
          if (lastDialogId !== dialog.id) {
            lastDialogId = dialog.id;
            state.canMove = false;
          }
          // move astronaut to dialog
          if (state.canMove === false) {
            const targetPosition = new THREE.Vector3().copy(astronaut.position);
            targetPosition.y = dialog.dialogPosition.y - 1;
            setAstronautVelocity(0);
            astronaut.position.y = astronaut.position.lerp(
              targetPosition,
              0.05
            ).y;
            camera.position.y = astronaut.position.y + 2;
          }

          if (allDialogsShown[dialog.id] && idsToshow[dialog.id]) {
            allDialogsShown[dialog.id].element.className = "user-dialog visible";
          }
        } else {
          if (allDialogsShown[dialog.id]) {
            allDialogsShown[dialog.id].element.className = "user-dialog hidden";
          }
        }

        if (lastDialogId === dialog.id && !dialogVisible) {
          lastDialogId = -1;
          state.canMove = true;
        }
      });
    }

    // render
    renderer.render(scene, camera);
    renderer3D.render(scene, camera);
    // labelRenderer.render(scene, camera);
    // controls.update();
    composer.render();
    stats.end();

    requestAnimationFrame(animate);
  }

  animate();
}

main();