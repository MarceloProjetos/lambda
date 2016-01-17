"use strict";

var fs = require('fs');

var PDFDocument = require('pdfkit');
var doc = new PDFDocument();
 
exports.handler = function(event, context) {
    console.log('\nCreating pdf...');

    var empresa = { nome: 'ALTAMIRA INDUSTRIA E COMERCIO LTDA' };

	//var json = fs.createWriteStream('nfe.json');
	//json.write(JSON.stringify(layout, null, 2));
	
	JSON.minify = require("node-json-minify");

	var layout = JSON.parse(
		JSON.minify(
			fs.readFileSync('nfe.json', { encoding: 'utf-8'})));

	/******************************************************************************************************
	 configuracoes do documento
	******************************************************************************************************/
    var f = fs.createWriteStream('file.pdf');
    doc.pipe(f); // # write to PDF

	doc/*.font('Arial')*/
		.fontSize(layout.font.size)
        .lineWidth(layout.line.width * layout.unit)
        .page.margin =  { left: layout.margin.left, top: layout.margin.top, right: layout.margin.right, bottom: layout.margin.bottom };

	/******************************************************************************************************
	 inicio da renderizacao da pagina
	******************************************************************************************************/

	//console.log(JSON.stringify(layout, null, 2));

    for (var i = 0; i < layout.box.length; i++) {
    	doc.roundedRect(
    			(layout.margin.left + layout.box[i].left) * layout.unit, 
    			(layout.margin.top + layout.box[i].top) * layout.unit, 
    			layout.box[i].width * layout.unit, 
    			layout.box[i].height * layout.unit, 
    			layout.margin.round * layout.unit).stroke();

    	if (layout.box[i].line) {

    		for (var l = 0; l < layout.box[i].line.length; l++) {
		    	var color = 'black';

		    	if (layout.box[i].line.color) {
		    		color = layout.box[i].line.color;
		    	} 

    			doc.moveTo(
    				(layout.margin.left + layout.box[i].left + layout.box[i].line[l].left) * layout.unit, 
	    			(layout.margin.top + layout.box[i].top + layout.box[i].line[l].top) * layout.unit)
    			.lineTo( 
	    				(layout.margin.left + layout.box[i].left + layout.box[i].line[l].right) * layout.unit,
	    				(layout.margin.top + layout.box[i].top + layout.box[i].line[l].bottom) * layout.unit)
    			.fillColor(color).fill();
    			
    		}
    	}

    	if (layout.box[i].text) {
    		for (var l = 0; l < layout.box[i].text.length; l++) {
    			if (layout.box[i].text[l].size) {
    				doc.fontSize(layout.box[i].text[l].size);
    			}

    			var padding = 0;

    			if (layout.box[i].text[l].padding) {
    				padding = layout.box[i].text[l].padding;	
    			} 

	    		doc.rect((layout.margin.left + 
		   				layout.box[i].left + 
		   				layout.box[i].text[l].left + 
		   				padding) * layout.unit, 
		   			(layout.margin.top + 
		   				layout.box[i].top + 
		   				layout.box[i].text[l].top + 
		   				padding) * layout.unit,
		   			(layout.box[i].text[l].width - padding) * layout.unit,
		   			(layout.box[i].text[l].height - padding) * layout.unit).fillColor('gray').fill();

    			doc.fillColor('black').text( 	
    				layout.box[i].text[l].text, 
		   			(layout.margin.left + 
		   				layout.box[i].left + 
		   				layout.box[i].text[l].left + 
		   				padding) * layout.unit, 
		   			(layout.margin.top + 
		   				layout.box[i].top + 
		   				layout.box[i].text[l].top + 
		   				padding) * layout.unit,
	    			{ 
						width: (layout.box[i].text[l].width - padding) * layout.unit, 
						height: (layout.box[i].text[l].height - padding) * layout.unit, 
						align: layout.box[i].text[l].align ? layout.box[i].text[l].align : 'left', 
						//stroke: layout.box[i].text[l].bold ? true : false, 
						//fill: layout.box[i].text[l].bold ? true : false, 
	    			} 
	    		);

    			if (layout.box[i].text[l].size) {
    				doc.fontSize(layout.font.size);
    			}
    			
    		}
    	}

    	if (layout.text) {
    		for (var l = 0; l < layout.text.length; l++) {
    			if (layout.text[l].size) {
    				doc.fontSize(layout.text[l].size);
    			}

    			var padding = 0;

    			if (layout.text[l].padding) {
    				padding = layout.text[l].padding;	
    			} 

	    		/*doc.rect((layout.margin.left + 
		   				layout.text[l].left + 
		   				padding) * layout.unit, 
		   			(layout.margin.top + 
		   				layout.text[l].top + 
		   				padding) * layout.unit,
		   			(layout.text[l].width - padding) * layout.unit,
		   			(layout.text[l].height - padding) * layout.unit).fillColor('gray').fill();*/

    			doc.fillColor('black').text( 	
    				layout.text[l].text, 
		   			(layout.margin.left + 
		   				layout.text[l].left + 
		   				padding) * layout.unit, 
		   			(layout.margin.top + 
		   				layout.text[l].top + 
		   				padding) * layout.unit,
	    			{ 
						width: (layout.text[l].width - padding) * layout.unit, 
						height: (layout.text[l].height - padding) * layout.unit, 
						align: layout.text[l].align ? layout.text[l].align : 'left', 
						//stroke: layout.text[l].bold ? true : false, 
						//fill: layout.text[l].bold ? true : false, 
	    			} 
	    		);

    			if (layout.text[l].size) {
    				doc.fontSize(layout.font.size);
    			}
    			
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


