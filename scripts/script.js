"use strict"

//~ Tutorial

console.log("Hello from script.js");

//~ Internal JavaScript

const alert_click_buttons = document.getElementsByClassName("alert_click");
for (const button of alert_click_buttons) {
	button.addEventListener("click", alert_click);
}

function alert_click() {
	alert("You clicked a button!");
}

//~ JavaScript events

const RGB_WHITE = `rgb(${255} ${255} ${255})`;

// Returns a random number between min (inclusive) and max (exclusive)
function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Returns a random color where each of the 3 components is between min (inclusive) and max (exclusive)
function random_color(min, max) {
	return `rgb(${random(min, max)},${random(min, max)},${random(min, max)})`;
}

Array.from(document.getElementsByClassName("background_randomizer")).forEach((e) => e.addEventListener("click", randomize_background));
Array.from(document.getElementsByClassName("background_resetter")).forEach((e) => e.addEventListener("click", reset_background));

function randomize_background() {
	const color = `rgb(${random(192, 255)} ${random(192, 255)} ${random(192, 255)})`;
	document.body.style.backgroundColor = color;
}

function reset_background() { document.body.style.backgroundColor = RGB_WHITE; }

//- Optional event parameter

const self_randomizers = Array.from(document.getElementsByClassName("self_randomizer"));
self_randomizers.forEach((e) => e.addEventListener("click", randomize_element));
self_randomizers.forEach((e) => e.addEventListener("dblclick", reset_element));

function randomize_element(event) {
	const color = `rgb(${random(192, 255)} ${random(192, 255)} ${random(192, 255)})`;
	event.target.style.backgroundColor = color;
}

function reset_element(event) { event.target.style = ""; }

//~ Image gallery

const image_names = ["1.png", "2.png", "3.png", "4.png", "5.png"];
const image_alt_texts = ["1", "2", "3", "4", "5"];

const thumb_bar_div = document.getElementsByClassName("thumb-bar")[0];
for (const i in image_names) {
	const image = document.createElement("img");
	image.src = `../images/gallery/${image_names[i]}`;
	image.alt = image_alt_texts[i];
	image.addEventListener("click", (event) => {
							   const displayed_image = document.getElementsByClassName("displayed-img")[0];
							   displayed_image.src = event.target.src;
							   displayed_image.alt = event.target.alt;
							   displayed_image.width = event.target.width;
							   displayed_image.height = event.target.height;
						   });
	
	thumb_bar_div.append(image);
}

const darken_button = document.getElementsByClassName("dark")[0];
darken_button.addEventListener("click", toggle_dark_overlay);

function toggle_dark_overlay() {
	const image_dark_overlay = document.getElementsByClassName("overlay")[0];
	if (image_dark_overlay.style.backgroundColor == "") {
		image_dark_overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	} else {
		image_dark_overlay.style.backgroundColor = "";
	}
}

//~ Bouncing balls demo

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const canvas_width  = canvas.width;
const canvas_height = canvas.height;

function make_ball(x, y, velX, velY, color, size) {
	let ball = {};
	ball.x = x;
	ball.y = y;
	ball.velX = velX;
	ball.velY = velY;
	ball.color = color;
	ball.size = size;
	return ball;
}

function draw_ball(ball) {
	ctx.beginPath();
	ctx.fillStyle = ball.color;
	ctx.arc(ball.x, ball.y, ball.size, 0, 2 * Math.PI);
	ctx.fill();
}

const test_ball = make_ball(50, 100, 4, 4, "blue", 10);
draw_ball(test_ball);
