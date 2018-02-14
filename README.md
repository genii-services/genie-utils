Genie Utils
==============

A useful library of utilities for node.js used by Genie.

It provides additional functionality for manipulating and converting various
types of data, including converting strings between various forms, and
lightweight html &larr; &rarr; text conversion.


## Usage

	npm install genie-utils --save

... then ...

	const utils = require('genie-utils')
	console.log(utils.postposition('한글', '을'))	// 한글을

### Bundled with GenieFramework

If you're using Genie, it exposes this library as `.utils`.

	const genie = require('genie')
	const utils = genie.utils


## String utilities

*	`postposition(txt, pp)` - postposition for Korean




Credits
=======

