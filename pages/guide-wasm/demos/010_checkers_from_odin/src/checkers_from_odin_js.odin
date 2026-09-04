package checkers_from_odin_js

CHECKERBOARD_SIZE :: 20
graphicsBuffer: [CHECKERBOARD_SIZE * CHECKERBOARD_SIZE * 4]u8;

// Returns a pointer to the buffer
@export
getGraphicsBufferPointer :: proc "c" () -> [^]u8 {
	return raw_data(graphicsBuffer[:])
}

// Returns the size of the buffer
@export
getGraphicsBufferSize :: proc "c" () -> int {
	return len(graphicsBuffer);
}

// NOTE(ema): #no_bounds_check is necessary to avoid imports in WASM
@export
generateCheckerBoard :: proc "c" (darkValueRed: u8, darkValueGreen: u8, darkValueBlue: u8, lightValueRed: u8, lightValueGreen: u8, lightValueBlue: u8) #no_bounds_check {
	for y := 0; y < CHECKERBOARD_SIZE; y += 1 {
		for x := 0; x < CHECKERBOARD_SIZE; x += 1 {
			// Set our default case to be dark squares
			isDarkSquare := true;

			// We should change our default case if
			// We are on an odd y
			if y % 2 == 0 {
				isDarkSquare = false;
			}

			// Lastly, alternate on our x value
			if x % 2 == 0 {
				isDarkSquare = !isDarkSquare;
			}

			// Now that we determined if we are dark or light,
			// Let's set our square value
			squareValueRed := darkValueRed;
			squareValueGreen := darkValueGreen;
			squareValueBlue := darkValueBlue;
			if !isDarkSquare {
				squareValueRed = lightValueRed;
				squareValueGreen = lightValueGreen;
				squareValueBlue = lightValueBlue;
			}

			// Let's calculate our index, using our 2d -> 1d mapping.
			// And then multiple by 4, for each pixel property (r,g,b,a).
			squareNumber := (y * CHECKERBOARD_SIZE) + x;
			squareRgbaIndex := squareNumber * 4;

			graphicsBuffer[squareRgbaIndex + 0] = squareValueRed; // Red
			graphicsBuffer[squareRgbaIndex + 1] = squareValueGreen; // Green
			graphicsBuffer[squareRgbaIndex + 2] = squareValueBlue; // Blue
			graphicsBuffer[squareRgbaIndex + 3] = 255; // Alpha (Always Opaque)
		}
	}
}
