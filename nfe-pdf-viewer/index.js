"use strict";

var fs = require('fs');

var PDFDocument = require('pdfkit');
var doc = new PDFDocument();
 
exports.handler = function(event, context) {
    console.log('\nCreating pdf...');

    var f = fs.createWriteStream('file.pdf');

    //doc = new PDFDocument();

    doc.pipe(f); // # write to PDF

    var layout = {
    	box: []
    };

    var inch = 30.3;

    // centimeters
    var round = 0.1;

    var margin = { left: 0.5, top: 0, padding: 0.1 };
    var line = { height: 0.7, width: 0.02 }

    /*********************************************************************************
    * box canhoto                                                                    *
    **********************************************************************************

    +---------------------------------------------------------+ +--------------------+
    | box 0                                                   | | box 1              |
    +---------------------------------------------------------+ |                    |
    +------------+ +------------------------------------------+ |                    |
    | box 2      | | box 3                                    | |                    |
    +------------+ +------------------------------------------+ +--------------------+

    *********************************************************************************/

	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top, 		width: 14.8, height: 0.8};  // box 1
	layout.box[layout.box.length] = { left: margin.left + 14.95, 	top: margin.top, 		width: 4.25, height: 1.95}; // box 2
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 0.9,	width: 4.09, height: 1.0};  // box 3
	layout.box[layout.box.length] = { left: margin.left + 4.3, 		top: margin.top + 0.9,	width: 10.5, height: 1.0};  // box 4

    /*********************************************************************************
    * box logo                                                                       *
    **********************************************************************************    
	+-----------------------------+                    +-----------------------------+
	| box 1 (logo)                |            +---+   | box 3 (cod. barra)          |
	|                             |   box 2 -> |   |   |                             |
	|                             |            |   |   |+---------------------------+|
	|                             |            +---+   || box 4 (chave de acesso)   ||
	|                             |                    |+---------------------------+|
    |                             |                    |                             |
	+-----------------------------+                    +-----------------------------+

	**********************************************************************************/

	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 2.35, 	width: 6.75, 	height: 2.9};  // box 1
	layout.box[layout.box.length] = { left: margin.left + 9.2, 		top: margin.top + 3.35, 	width: 0.6, 	height: 0.7};  // box 2
	layout.box[layout.box.length] = { left: margin.left + 10.5, 	top: margin.top + 2.35, 	width: 8.75, 	height: 2.9};  // box 3
	layout.box[layout.box.length] = { left: margin.left + 10.7, 	top: margin.top + 3.65, 	width: 8.4, 	height: 0.8};  // box 4

	// box natureza de operacao
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 5.3, 	width: 19.27, 	height: 1.4, line: []};

	// linhas divisorias natureza de operacao
	var box = layout.box[layout.box.length-1];
	box.line[box.line.length] = { left: box.left, top: box.top + line.height, 	width: box.left + box.width, height: box.top + line.height };
	box.line[box.line.length] = { left: box.left + 10.5, top: box.top, 	width: box.left + 10.5, height: box.top + line.height };
	box.line[box.line.length] = { left: box.left + 3.5, top: box.top + line.height, 	width: box.left + 3.5, height: box.top + line.height * 2 };
	box.line[box.line.length] = { left: box.left + 9.0, top: box.top + line.height, 	width: box.left + 9.0, height: box.top + line.height * 2 };
	layout.box[layout.box.length-1] = box;

	// destinatario/remetente
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 7.0, 	width: 19.27, 	height: line.height * 3, line: []};

	// linhas divisorias destinatario/remetente
	var box = layout.box[layout.box.length-1];
	box.line[box.line.length] = { left: box.left, top: box.top + line.height, 	width: box.left + box.width, height: box.top + line.height };
	box.line[box.line.length] = { left: box.left, top: box.top + line.height * 2, 	width: box.left + box.width, height: box.top + line.height * 2 };
	box.line[box.line.length] = { left: box.left + 10, top: box.top, 	width: box.left + 10, height: box.top + line.height * 3 };
	box.line[box.line.length] = { left: box.left + 16.7, top: box.top, 	width: box.left + 16.7, height: box.top + line.height * 3 };
	box.line[box.line.length] = { left: box.left + 15.3, top: box.top + line.height, 	width: box.left + 15.3, height: box.top + line.height * 2 };
	box.line[box.line.length] = { left: box.left + 12.2, top: box.top + line.height * 2, 	width: box.left + 12.2, height: box.top + line.height * 3 };
	box.line[box.line.length] = { left: box.left + 13.2, top: box.top + line.height * 2, 	width: box.left + 13.2, height: box.top + line.height * 3 };
	box.line[box.line.length] = { left: box.left + 16.7, top: box.top + line.height * 2, 	width: box.left + 16.7, height: box.top + line.height * 3 };
	layout.box[layout.box.length-1] = box;

	// vencimentos
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 9.4, 	width: 19.27, 	height: 0.9};

	// calculo de impostos
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 10.7, width: 19.27, 	height: 1.8};

	// tranportadora
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 12.3, width: 19.27, 	height: 2.1};

	// dados dos produtos
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 14.7, width: 19.27, 	height: 6.2};

	// calculo do issqn
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 21.3, width: 19.27, 	height: 0.8};

	// dados adicionais
	layout.box[layout.box.length] = { left: margin.left, 			top: margin.top + 22.4, width: 19.27, 	height: 2.7};

	/******************************************************************************************************
	 inicio da renderizacao da pagina
	******************************************************************************************************/
    doc.lineWidth(line.width * inch);

    for (var i = 0; i < layout.box.length; i++) {
    	doc.roundedRect(
    			layout.box[i].left * inch, 
    			layout.box[i].top * inch, 
    			layout.box[i].width * inch, 
    			layout.box[i].height * inch, 
    			round).stroke();

    	if (layout.box[i].line) {
    		for (var l = 0; l < layout.box[i].line.length; l++) {
    			doc.moveTo(
    				layout.box[i].line[l].left * inch, 
	    			layout.box[i].line[l].top * inch).lineTo( 
	    				layout.box[i].line[l].width * inch,
	    				layout.box[i].line[l].height * inch);
    		}
    	}
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


