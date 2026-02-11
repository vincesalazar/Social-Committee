const section = document.getElementById('list');

let intro = gsap.timeline({ defaults: { ease: "power1.out" } });


intro.fromTo("#form", {y: "25%", opacity:0}, { y: "0%", opacity:1, duration: .75});
intro.fromTo("#summary", {y: "25%", opacity:0}, { y: "0%", opacity:1, duration: .75 }, "-=0.5");
intro.fromTo("#data", {y: "25%", opacity:0}, { y: "0%", opacity:1, duration: .75, stagger: 0.25}, "-=1");