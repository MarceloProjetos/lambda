"use strict";

var fs = require('fs');

var PDFDocument = require('pdfkit');
var doc = new PDFDocument();
 
exports.handler = function(event, context) {
    console.log('\nCreating pdf...');

    var f = fs.createWriteStream('file.pdf');

    //doc = new PDFDocument();

    doc.pipe(f); // # write to PDF

    var inch = 30.3;

    // centimeters
    var round = 0.1 * inch;

    var margin = { left: 0.8 * inch, top: 1.0 * inch, padding: 0.1 * inch };

    /*********************************************************************************
    * box canhoto                                                                    *
    **********************************************************************************
    |-> offset.0  / margin.left                                 |-> offset.1         |-> offset.2
    +---------------------------------------------------------+ +--------------------+
    | box 0                                                   | | box 1              |
    +---------------------------------------------------------+ |                    |
    +------------+ +------------------------------------------+ |                    |
    | box 2      | | box 3                                    | |                    |
    +------------+ +------------------------------------------+ +--------------------+
                   |-> offset.3                 
    *********************************************************************************/
    var offset_x = [];

    offset_x[0] = margin.left;						// offset 0
    offset_x[1] = offset_x[0] + (15 * inch);		// offset 1
    offset_x[2] = offset_x[1] + (4.25 * inch);		// offset 2
    offset_x[3] = offset_x[0] + (4.3 * inch);		// offset 3

    var box_width = [];

    box_width[0] = offset_x[1] - offset_x[0] - margin.padding;  // box 0
    box_width[1] = offset_x[2] - offset_x[1];                   // box 1
    box_width[2] = offset_x[3] - offset_x[0] - margin.padding;	// box 2
    box_width[3] = offset_x[1] - offset_x[3] - margin.padding;	// box 3

    var box_height = [];

    box_height[0] = 0.8 * inch;											// box 0
    box_height[1] = 1.0 * inch;											// box 2, 3
    box_height[2] = box_height[0] + margin.padding + box_height[1];		// box 1

    var offset_y = [];

    offset_y[0] = margin.top;										// box 0, 1
    offset_y[1] = offset_y[0] + box_height[0] + margin.padding;		// box 2, 3

    var box = [];

    box[0] = { left: offset_x[0], top: offset_y[0], width: box_width[0], height: box_height[0] };
    box[1] = { left: offset_x[1], top: offset_y[0], width: box_width[1], height: box_height[2] };
    box[2] = { left: offset_x[0], top: offset_y[1], width: box_width[2], height: box_height[1] };
    box[3] = { left: offset_x[3], top: offset_y[1], width: box_width[3], height: box_height[1] };

    /*********************************************************************************
    * box logo                                                                       *
    **********************************************************************************    
	|-> offset.0                  |-> offset.4         |-> offset.5                  |-> offset.2                           
	+-----------------------------+ offset.6 <-|       +-----------------------------+
	| box 4 (logo)                |            +---+   | box 5 (cod. barra)          |
	|                             |  0 Entrada |   |   |                             |
	|                             |  1 Saida   |   |   |+---------------------------+|
	|                             |            +---+   || box 6 (chave de acesso)   ||
	|                             |     offset.7 <-|   |+---------------------------+|
    |                             |                    ||-> offset.8                 |
	+-----------------------------+                    +-----------------------------+
	**********************************************************************************/

	/*offset_x[4] = offset_x[0] + (20 * inch);		// offset 4
	offset_x[5] = offset_x[0] + (20 * inch);		// offset 5
	offset_x[6] = offset_x[5] + (20 * inch);		// offset 6
	offset_x[7] = offset_x[5] + margin.padding;		// offset 7
	offset_x[8] = offset_x[5] + margin.padding;		// offset 8

    box_width[4  = offset_x[4] - offset_x[0];  // box 0
    box_width[5] = offset_x[6] - offset_x[5];  // box 0
    box_width[6] = offset_x[7] - offset_x[6];  // box 0


	box[3] = { left: offset_x[3], top: offset_y[1], width: box_width[3], height: box_height[1] };*/

    for (var i = 0; i < box.length; i++) {
    	doc.roundedRect(box[i].left, box[i].top, box[i].width, box[i].height, round).stroke();
    };

	/*

	doc.moveTo(300, 75)
	   .lineTo(373, 301)
	   .lineTo(181, 161)
	   .lineTo(419, 161)
	   .lineTo(227, 301)
	   .fill('red', 'even-odd');  

	var loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in...';  

	doc.y = 320;
	doc.fillColor('black')
	doc.text(loremIpsum, {
	   paragraphGap: 10,
	   indent: 20,
	   align: 'justify',
	   columns: 2
	});  

	*/

	f.on('finish',function(){
		context.succeed('Pdf created.');
	})

    doc.end();

};


