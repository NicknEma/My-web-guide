package hello_from_odin_freestanding

@export
addTwo :: proc "c" (a, b: i32) -> i32 {
	return a + b
}

// import "core:sys/wasm"

// main :: proc() {
// 
// }

/*
Getting functions from the wasm runtime environment is similar.

Again, the import path inside the quotes doesn't matter. It can be anything
so long as it doesn't end in ".o".

It does need to match the field on the env object used when initalizing the wasm
module in the runtime environment. Other than that, the sky's the limit. I've tried
colons, spaces, brackets, anything goes. Might depend on what your wasm runtime
supports though?
*/

foreign import js "js"

foreign js {
	js_receive :: proc "c" (i32) -> i32 ---
}
