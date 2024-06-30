"use strict"

console.log("Hello from syntax-highlight.js");

//~ Highlighting

const html_elements = document.getElementsByClassName("lang_html");
for (let i = 0; i < html_elements.length; i += 1) {
	do_syntax_highlighting(html_elements[i]);
}

const css_elements = document.getElementsByClassName("lang_css");
for (let i = 0; i < css_elements.length; i += 1) {
	do_syntax_highlighting(css_elements[i], "css");
}

const js_elements = document.getElementsByClassName("lang_js");
for (let i = 0; i < js_elements.length; i += 1) {
	do_syntax_highlighting(js_elements[i], "js");
}

if (!String.prototype.substr) {
	String.prototype.substr = (start, length) => {
		let str = this;
		if (!start) { start = 0; }
		if (start.isNaN()) { start = 0; }
		if (start >= str.length) { return ""; }
		if (start < 0) { start = max(start + str.length, 0); }
		
		if (length.isNaN()) { length = 0; }
		if (!length || start + length >= str.length) { length = str.length - start; }
		if (length < 0) { return ""; }
		
		return this.substring(start, start + length);
	};
}

// Copied from: https://www.w3schools.com/howto/howto_syntax_highlight.asp

function do_syntax_highlighting(element, lang = "html") {
	const tagcolor              = "mediumblue";
	const tagnamecolor          = "brown";
	const attributecolor        = "red";
	const attributevaluecolor   = "mediumblue";
	const commentcolor          = "green";
	const cssselectorcolor      = "brown";
	const csspropertycolor      = "red";
	const csspropertyvaluecolor = "mediumblue";
	const cssdelimitercolor     = "black";
	const cssimportantcolor     = "red";  
	const jscolor               = "black";
	const jskeywordcolor        = "mediumblue";
	const jsstringcolor         = "brown";
	const jsnumbercolor         = "red";
	const jspropertycolor       = "black";
	
	let elementObj = (document.getElementById(element) || element);
	let elementTxt = elementObj.innerHTML;
	// elementObj.style.fontFamily = "monospace";
	
	if (lang == "html") { elementTxt = html_mode(elementTxt); }
	if (lang == "css")  { elementTxt = css_mode(elementTxt); }
	if (lang == "js")   { elementTxt = js_mode(elementTxt); }
	
	elementObj.innerHTML = elementTxt;
	
	// This is used for comments.
	function extract(str, start, end, func, repl) {
		var s, e, d = "", a = [];
		while (str.search(start) > -1) {
			s = str.search(start);
			e = str.indexOf(end, s);
			if (e == -1) {e = str.length;}
			if (repl) {
				a.push(func(str.substring(s, e + (end.length))));      
				str = str.substring(0, s) + repl + str.substr(e + (end.length));
			} else {
				d += str.substring(0, s);
				d += func(str.substring(s, e + (end.length)));
				str = str.substr(e + (end.length));
			}
		}
		this.rest = d + str;
		this.arr = a;
	}
	
	//- HTML
	
	function html_mode(text) {
		var rest = text, done = "", php, angular;
		let comment = new extract(rest, "&lt;!--", "--&gt;", comment_mode, "W3HTMLCOMMENTPOS");
		rest = comment.rest;
		
		// @Todo: What are all these semicolons in strings doing here?
		const TAG_OPENER = "&lt;";
		const TAG_CLOSER = "&gt;";
		
		const TAG_OPENER_LENGTH = TAG_OPENER.length;
		const TAG_CLOSER_LENGTH = TAG_CLOSER.length;
		
		while (rest.indexOf(TAG_OPENER) > -1) { // While there are still tags
			let note = "";
			
			let tag_opener_pos = rest.indexOf("&lt;");
			{
				// Check if we're opening a <style> or a <script> element.
				if (rest.substr(tag_opener_pos,  9).toUpperCase() == "&LT;STYLE")  { note = "css"; }
				if (rest.substr(tag_opener_pos, 10).toUpperCase() == "&LT;SCRIPT") { note = "javascript"; }
			}
			
			let tag_closer_pos = rest.indexOf("&gt;", tag_opener_pos);
			if (tag_closer_pos == -1) { tag_closer_pos = rest.length; }
			
			// Ignore everything before the start of the tag
			done += rest.substring(0, tag_opener_pos);
			
			// Parse and style the tag
			let tag_text        = rest.substring(tag_opener_pos, tag_closer_pos + TAG_CLOSER_LENGTH);
			let tag_text_styled = tag_mode(tag_text);
			done += tag_text_styled;
			
			// Skip to after the tag
			rest = rest.substr(tag_closer_pos + TAG_CLOSER_LENGTH);
			
			// If we opened a <style> tag:
			if (note == "css") {
				// Parse CSS until the corresponding </style> tag.
				
				tag_closer_pos = rest.indexOf("&lt;/style&gt;");
				let found = (tag_closer_pos > -1);
				if (found) {
					done += css_mode(rest.substring(0, tag_closer_pos));
					rest  = rest.substr(tag_closer_pos);
				}
			}
			
			// If we opened a <script> tag:
			if (note == "javascript") {
				// Parse JavaScript until the corresponding </script> tag.
				
				tag_closer_pos = rest.indexOf("&lt;/script&gt;");
				let found = (tag_closer_pos > -1);
				if (found) {
					done += js_mode(rest.substring(0, tag_closer_pos));
					rest  = rest.substr(tag_closer_pos);
				}
			}
		}
		
		rest = done + rest;
		for (let comment_index = 0; comment_index < comment.arr.length; comment_index += 1) {
			rest = rest.replace("W3HTMLCOMMENTPOS", comment.arr[comment_index]);
		}
		
		return rest;
	}
	
	function tag_mode(text) {
		let rest = text, done = "";
		let pattern = /(\s|<br>)/;
		let result;
		
		// @Note: \s matches whitespace and line terminators.
		
		while (rest.search(pattern) > -1) {
			let startpos = rest.search(pattern);
			let endpos = rest.indexOf("&gt;");
			if (endpos == -1) { endpos = rest.length; }
			
			done += rest.substring(0, startpos);
			done += attribute_mode(rest.substring(startpos, endpos));
			rest  = rest.substr(endpos);
		}
		
		result = done + rest;
		result = "<span style=color:" + tagcolor + ">&lt;</span>" + result.substring(4);
		
		if (result.substr(result.length - 4, 4) == "&gt;") {
			result = result.substring(0, result.length - 4) + "<span style=color:" + tagcolor + ">&gt;</span>";
		}
		
		result = "<span style=color:" + tagnamecolor + ">" + result + "</span>";
		return result;
	}
	
	// Add style to attributes.
	function attribute_mode(txt) {
		let rest = txt, done = "";
		let startpos, endpos, singlefnuttpos, doublefnuttpos, spacepos;
		
		while (rest.indexOf("=") > -1) { // While we're on the left of the = sign
			endpos = -1;
			startpos = rest.indexOf("=");
			singlefnuttpos = rest.indexOf("'", startpos);
										  doublefnuttpos = rest.indexOf('"', startpos);
																		spacepos = rest.indexOf(" ", startpos + 2);
																		
																		if (spacepos > -1 && (spacepos < singlefnuttpos || singlefnuttpos == -1) && (spacepos < doublefnuttpos || doublefnuttpos == -1)) {
																			endpos = rest.indexOf(" ", startpos);      
																		} else if (doublefnuttpos > -1 && (doublefnuttpos < singlefnuttpos || singlefnuttpos == -1) && (doublefnuttpos < spacepos || spacepos == -1)) {
																			endpos = rest.indexOf('"', rest.indexOf('"', startpos) + 1);
																		} else if (singlefnuttpos > -1 && (singlefnuttpos < doublefnuttpos || doublefnuttpos == -1) && (singlefnuttpos < spacepos || spacepos == -1)) {
																			endpos = rest.indexOf("'", rest.indexOf("'", startpos) + 1);
																		}
																		
																		if (!endpos || endpos == -1 || endpos < startpos) { endpos = rest.length; }
																		
																		done += rest.substring(0, startpos);
																		done += attribute_value_mode(rest.substring(startpos, endpos + 1));
																		rest = rest.substr(endpos + 1);
		}
		
		let result = "<span style=color:" + attributecolor + ">" + done + rest + "</span>";
		return result;
	}
	
	// Add style to attribute values.
	function attribute_value_mode(text) {
		let result = "<span style=color:" + attributevaluecolor + ">" + text + "</span>";
		return result;
	}
	
	// Add style to comments.
	function comment_mode(text) {
		let result = "<span style=color:" + commentcolor + ">" + text + "</span>";
		return result;
	}
	
	//- CSS
	
	function css_mode(text) {
		let rest = text, done = "";
		let comment = new extract(rest, /\/\*/, "*/", comment_mode, "W3CSSCOMMENTPOS");
		rest = comment.rest;
		
		while (rest.search("{") > -1) { // While there are still rules
			let startpos = rest.search("{");
			let midz = rest.substr(startpos + 1);
			let cc = 1;
			let c = 0;
			
			for (let i = 0; i < midz.length; i += 1) {
				if (midz.substr(i, 1) == "{") {
					cc += 1;
					c += 1;
				}
				
				if (midz.substr(i, 1) == "}") {
					cc -= 1;
				}
				
				if (cc == 0) {
					break;
				}
			}
			
			if (cc != 0) {
				c = 0;
			}
			
			let endpos = startpos;
			for (let i = 0; i <= c; i += 1) {
				endpos = rest.indexOf("}", endpos + 1);
			}
			if (endpos == -1) {
				endpos = rest.length;
			}
			
			done += rest.substring(0, startpos + 1);
			done += css_property_mode(rest.substring(startpos + 1, endpos));
			rest  = rest.substr(endpos);
		}
		
		rest = done + rest;
		rest = rest.replace(/{/g, "<span style=color:" + cssdelimitercolor + ">{</span>");
								rest = rest.replace(/}/g, "<span style=color:" + cssdelimitercolor + ">}</span>");
		
		for (let i = 0; i < comment.arr.length; i++) {
			rest = rest.replace("W3CSSCOMMENTPOS", comment.arr[i]);
		}
		
		let result = "<span style=color:" + cssselectorcolor + ">" + rest + "</span>";
		return result;
	}
	
	function css_property_mode(text) {
		var rest = text, done = "";
		if (rest.indexOf("{") > -1 ) { return css_mode(rest); }
		
		while (rest.search(":") > -1) {
			let startpos = rest.search(":");
			let endpos;
			let nextpos = startpos;
			
			let loop = true;
			while (loop) {
				loop = false;
				endpos = rest.indexOf(";", nextpos);
				
				const NON_BREAKABLE_SPACE = "&nbsp;";
				if (rest.substring(endpos - 5, endpos + 1) == NON_BREAKABLE_SPACE) {
					loop = true;
					nextpos = endpos + 1;
				}
			}
			
			if (endpos == -1) {
				endpos = rest.length;
			}
			
			done += rest.substring(0, startpos);
			done += css_property_value_mode(rest.substring(startpos, endpos + 1));
			rest  = rest.substr(endpos + 1);
		}
		
		let result = "<span style=color:" + csspropertycolor + ">" + done + rest + "</span>";
		return result;
	}
	
	function css_property_value_mode(txt) {
		var rest = txt, done = "", s;
		rest = "<span style=color:" + cssdelimitercolor + ">:</span>" + rest.substring(1);
		
		while (rest.search(/!important/i) > -1) {
			s = rest.search(/!important/i);
			done += rest.substring(0, s);
			done += css_important_mode(rest.substring(s, s + 10));
			rest = rest.substr(s + 10);
		}
		
		let result = done + rest;    
		
		if (result.substr(result.length - 1, 1) == ";" && result.substr(result.length - 6, 6) != "&nbsp;" && result.substr(result.length - 4, 4) != "&lt;" && result.substr(result.length - 4, 4) != "&gt;" && result.substr(result.length - 5, 5) != "&amp;") {
			result = result.substring(0, result.length - 1) + "<span style=color:" + cssdelimitercolor + ">;</span>";
		}
		
		return "<span style=color:" + csspropertyvaluecolor + ">" + result + "</span>";
	}
	
	function css_important_mode(text) {
		return "<span style=color:" + cssimportantcolor + ";font-weight:bold;>" + text + "</span>";
	}
	
	//- JS
	
	function js_mode(text) {
		let rest = text, done = "";
		
		let esc = [], escaped_text = "";
		for (let char_index = 0; char_index < rest.length; char_index += 1) {
			let character = rest.substr(char_index, 1);
			if (character == "\\") {
				esc.push(rest.substr(char_index, 2));
				character = "W3JSESCAPE";
				char_index += 1;
			}
			
			escaped_text += character;
		}
		rest = escaped_text;
		
		while (true) {
			let sfnuttpos = getPos(rest, "'", "'", js_color_string);
			let dfnuttpos = getPos(rest, '"', '"', js_color_string);
			let bfnuttpos = getPos(rest, '`', '`', js_color_string);
			let compos = getPos(rest, /\/\*/, "*/", comment_mode);
			const COMMENT_LINE_PATTERN = /\/\//;
				;
			let comlinepos = getPos(rest, COMMENT_LINE_PATTERN, "<br>", comment_mode);      
			
			let numpos = get_number_span(rest, js_color_number);
			let keywordpos = getKeywordPos("js", rest, js_color_keyword);
			let dotpos = getDotPos(rest, js_color_property);
			
			if (Math.max(numpos.start_pos, sfnuttpos.start_pos, dfnuttpos.start_pos, bfnuttpos.start_pos, compos.start_pos, comlinepos.start_pos, keywordpos.start_pos, dotpos.start_pos) == -1) {
				break;
			}
			
			let mypos = getMinPos(numpos, sfnuttpos, dfnuttpos, bfnuttpos, compos, comlinepos, keywordpos, dotpos);
			
			if (mypos.start_pos == -1) {
				break;
			}
			
			if (mypos.start_pos > -1) {
				done += rest.substring(0, mypos.start_pos);
				done += mypos.color_proc(rest.substring(mypos.start_pos, mypos.end_pos));
				rest  = rest.substr(mypos.end_pos);
			}
		}
		
		rest = done + rest;
		for (let character_index = 0; character_index < esc.length; character_index += 1) {
			rest = rest.replace("W3JSESCAPE", esc[character_index]);
		}
		
		let result = "<span style=color:" + jscolor + ">" + rest + "</span>";
		return result;
	}
	
	function js_color_string(text) {
		let result = "<span style=color:" + jsstringcolor + ">" + text + "</span>";
		return result;
	}
	
	function js_color_keyword(text) {
		let result = "<span style=color:" + jskeywordcolor + ">" + text + "</span>";
		return result;
	}
	
	function js_color_number(text) {
		let result = "<span style=color:" + jsnumbercolor + ">" + text + "</span>";
		return result;
	}
	
	function js_color_property(text) {
		let result = "<span style=color:" + jspropertycolor + ">" + text + "</span>";
		return result;
	}
	
	//- JS Helpers
	
	function make_text_span(start_pos, end_pos, color_proc) {
		let span = { "start_pos": start_pos, "end_pos": end_pos, "color_proc": color_proc };
		return span;
	}
	
	// Searches the text for the given patterns.
	function getPos(text, start_pattern, end_pattern, func) {
		let start_pos = text.search(start_pattern);
		let end_pos   = text.indexOf(end_pattern, start_pos + (end_pattern.length));
		
		if (end_pos == -1) {
			end_pos = text.length;
		}
		
		let result = make_text_span(start_pos, end_pos + (end_pattern.length), func);
		return result;
	}
	
	// Returns the span that starts first, amongst the ones that start > -1.
	// If every span starts at -1, it returns the last.
	function getMinPos(...args) {
		let arg_index, span = make_text_span(Infinity, Infinity, (x) => x);
		
		for (arg_index = 0; arg_index < args.length; arg_index += 1) {
			let arg = args[arg_index];
			if (arg.start_pos > -1) {
				if (arg.start_pos < span.start_pos) {
					span = arg;
				}
			}
		}
		
		if (span.start_pos == Infinity) {
			span = args[arg_index];
		}
		
		return span;
	}
	
	function getDotPos(text, func) {
		var x, i, j, s, e, arr = [".","<", " ", ";", "(", "+", ")", "[", "]", ",", "&", ":", "{", "}", "/" ,"-", "*", "|", "%"];
		s = text.indexOf(".");
		if (s > -1) {
			x = text.substr(s + 1);
			for (j = 0; j < x.length; j++) {
				let cc = x[j];
				for (i = 0; i < arr.length; i++) {
					if (cc.indexOf(arr[i]) > -1) {
						e = j;
						return make_text_span(s + 1, e + s + 1, func);
					}
				}
			}
		}
		
		return make_text_span(-1, -1, func);
	}
	
	function getKeywordPos(typ, txt, func) {
		var words, i, pos, rpos = -1, rpos2 = -1, patt;
		if (typ == "js") {
			words = ["abstract","arguments","boolean","break","byte","case","catch","char","class","const","continue","debugger","default","delete",
					 "do","double","else","enum","eval","export","extends","false","final","finally","float","for","function","goto","if","implements","import",
					 "in","instanceof","int","interface","let","long","NaN","native","new","null","package","private","protected","public","return","short","static",
					 "super","switch","synchronized","this","throw","throws","transient","true","try","typeof","var","void","volatile","while","with","yield"];
		}
		
		for (i = 0; i < words.length; i++) {
			pos = txt.indexOf(words[i]);
			if (pos > -1) {
				patt = /\W/g;
				if (txt.substr(pos + words[i].length,1).match(patt) && txt.substr(pos - 1,1).match(patt)) {
					if (pos > -1 && (rpos == -1 || pos < rpos)) {
						rpos = pos;
						rpos2 = rpos + words[i].length;
					}
				}
			} 
		}
		
		return make_text_span(rpos, rpos2, func);
	}
	
	function get_number_span(text, func) {
		let result = make_text_span(-1, -1, func);
		
		const SYMBOLS = ["<br>"," ",";","(","+",")","[","]",",","&",":","{","}","/","-","*","|","%","="];
		let start_pos = 0;
		
		let found = false;
		for (let character_index = 0; character_index < text.length && !found; character_index += 1) {
			for (let symbol_index = 0; symbol_index < SYMBOLS.length; symbol_index += 1) {
				let symbol = SYMBOLS[symbol_index];
				let c = text.substr(character_index, symbol.length);
				
				if (c == symbol) {
					
					// This handles minus signs used for negative exponents in scientific notation.
					// The minus in 3e-1 should be the same color as the number, not the operator color.
					let previous_character = text.substr(character_index - 1, 1);
					if (c == "-" && (previous_character == "e" ||
									 previous_character == "E")) {
						continue;
					}
					
					// We found a symbol that delimits the end of a number.
					
					let end_pos = character_index;
					if (start_pos < end_pos) {
						let word = text.substring(start_pos, end_pos);
						if (!isNaN(word)) {
							result.start_pos = start_pos;
							result.end_pos   = end_pos;
							found = true;
							break;
						}
					}
					
					character_index += symbol.length;
					start_pos = character_index;
					character_index -= 1;
					break;
				}
			}
		}  
		
		return result;
	}  
}
