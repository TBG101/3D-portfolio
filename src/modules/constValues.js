import { createEarth, createMars } from "./planets";

/**
 * @type {Array<{id: number,text: string, dialogPosition: {x: number, y: number,z: number}}>}
 * **/
const dialogData = [
  {
    id: 0,
    text: "Welcome to my portfolio! \nI'm Zied Harzallah, a 23-year-old software engineering student at Polytechnique Sousse, Tunisia.",
    dialogPosition: { x: -7.5, y: 0, z: 0 },
  },
  {
    id: 1,
    text: "Passionate about web development, mobile development, and game design, I’m always eager to learn and create.",
    dialogPosition: { x: 7.5, y: 8, z: 0 },
  },
  {
    id: 2,
    text: "I'm currently looking for an internship to improve my skills and gain experience in the field.",
    dialogPosition: { x: -7.5, y: 16, z: 0 },
  },
  {
    id: 3,
    text: "Feel free to explore my projects and contact me if you want to work together!",
    dialogPosition: { x: 7.5, y: 24, z: 0 },
  },
  {
    id: 4,
    text: "These the technologies I've worked with. Click on them to learn more!",
    dialogPosition: { x: -7.5, y: 32, z: 0 },
  },
  {
    id: 5,
    text: "Now for the projects,\n Each planet represents a project I've worked on. Click on them to learn more!",
    dialogPosition: { x: 7.5, y: 60, z: 0 },
  },
];

const techStack = [
  {
    name: "CSS",
    icon: "/models/techstack/css.glb",
  },
  {
    name: "HTML",
    icon: "/models/techstack/html.glb",
  },
  {
    name: "JavaScript",
    icon: "/models/techstack/js.glb",
  },
  {
    name: "Flutter",
    icon: "/models/techstack/flutter.glb",
  },
  {
    name: "React.js",
    icon: "/models/techstack/reactjs.glb",
  },
  {
    name: "Node.js",
    icon: "/models/techstack/nodejs.glb",
  },
  {
    name: "Express.js",
    icon: "/models/techstack/express.glb",
  },
  {
    name: "MongoDB",
    icon: "/models/techstack/mongodb.glb",
  },
  {
    name: "Firebase",
    icon: "/models/techstack/firebase.glb",
  },
  {
    name: "C#",
    icon: "/models/techstack/csharp.glb",
  },
  {
    name: "C++",
    icon: "/models/techstack/cpp.glb",
  },
  {
    name: "Python",
    icon: "/models/techstack/python.glb",
  },
  {
    name: "Java",
    icon: "/models/techstack/java.glb",
  },
  {
    name: "Git",
    icon: "/models/techstack/git.glb",
  },
  {
    name: "Docker",
    icon: "/models/techstack/docker.glb",
  },
  {
    name: "Figma",
    icon: "/models/techstack/figma.glb",
  },
  {
    name: "Blender",
    icon: "/models/techstack/blender.glb",
  },
  {
    name: "Rust",
    icon: "/models/techstack/rust.glb",
  },
  {
    name: "Tailwind",
    icon: "/models/techstack/tailwind.glb",
  },
  {
    name: "Tauri",
    icon: "/models/techstack/tauri.glb",
  },
  {
    name: "PostgresSQL",
    icon: "/models/techstack/PostgresSQL.glb",
  },
  {
    name: "MySQL",
    icon: "/models/techstack/MySQL.glb",
  },
  {
    name: "graphql",
    icon: "/models/techstack/graphql.glb",
  },
];
const techStackDirection = techStack.reduce((acc, tech, index) => {
  acc[index] = {};
  acc[index].direction = Math.random() > 0.5 ? 1 : -1;
  acc[index].randomFactor = Math.random() * 2;
  return acc;
}, []);


const offsetZ = -10;
const planetData = [
  {
    size: 15,
    position: { x: 35, y: 90, z: offsetZ * 3 },
    name: "Project A",
    documentSectionEl: document.getElementById("project-A"),
    createFunction: createEarth,
    tech: ["React.js", "Node.js", "MongoDB"],
  },
  {
    size: 30,
    position: {
      x: -55,
      y: 135,
      z: offsetZ * 5,
    },
    name: "Project B",
    documentSectionEl: document.getElementById("project-B"),
    createFunction: createMars,
    tech: ["Flutter", "Firebase"],
  },
  {
    size: 25,
    position: { x: 50, y: 175, z: offsetZ * 4 },
    name: "Project C",
    documentSectionEl: document.getElementById("project-C"),
    createFunction: createEarth,
    tech: ["React.js", "Node.js", "MongoDB"],
  },
];

const contactData = {
  title: "Contact Me",
  description:
    "Feel free to reach out if you want to collaborate or have any questions!",
  email: "ziedhrz@gmail.com",
  linkedIn: "https://www.linkedin.com/in/zied-harzallah",
  github: "https://github.com/TBG101",
};

const astronautPath = "./astrov2.glb";
const minY = -5;
const maxY = 250;
export {
  dialogData,
  astronautPath,
  planetData,
  techStack,
  techStackDirection,
  contactData,
  minY,
  maxY,
};
