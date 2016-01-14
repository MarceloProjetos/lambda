"use strict";

var fs = require('fs');

var PDFDocument = require('pdfkit');
var doc = new PDFDocument();
 
exports.handler = function(event, context) {
    console.log('\nCreating pdf...');

    var f = fs.createWriteStream('file.pdf');

    var empresa = { nome: 'ALTAMIRA INDUSTRIA E COMERCIO LTDA' };

    doc.pipe(f); // # write to PDF

    var layout = {
    	unit: 30.3, // unit
    	margin: { left: 0.5, top: 0, right: 10, bottom: 10, padding: 0.1, round: 0.1 },
	    line: { height: 0.7, width: 0.02 },
	    font: { size: 6 },    	
    	box: []
    };

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

    // box 0
	layout.box[layout.box.length] = { left: 0, 			top: 0, 		width: 14.8, height: 0.8, label: [] }; 

	// label box 0
	var box = layout.box[layout.box.length - 1];
	box.label[box.label.length] = { left: layout.margin.padding, top: layout.margin.padding, 	width: box.width, height: box.height, text: 'RECEBEMOS DE ' + empresa.nome + ' OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO' };
	layout.box[layout.box.length - 1] = box;

	// box 1
	layout.box[layout.box.length] = { left: 14.95, 	top: 0,   		width: 4.25, height: 1.95, label: [] };

	// label box 1 
	var box = layout.box[layout.box.length - 1];
	box.label[box.label.length] = { left: layout.margin.padding, top: layout.margin.padding, 		width: box.width, height: box.height, text: 'NFe', align: 'center' };
	box.label[box.label.length] = { left: layout.margin.padding, top: layout.margin.padding + 0.5, 	width: box.width, height: box.height, text: 'Nº 000017220', align: 'center', size: 10, bold: true };
	box.label[box.label.length] = { left: layout.margin.padding, top: layout.margin.padding + 1.0, 	width: box.width, height: box.height, text: 'SERIE 1', align: 'center', size: 8, bold: true };
	layout.box[layout.box.length - 1] = box;

	// box 2
	layout.box[layout.box.length] = { left: 0, 	top: 0.9,	width: 4.09, height: 1.0, label: [] }; 

	// label box 2
	var box = layout.box[layout.box.length - 1];
	box.label[box.label.length] = { left: layout.margin.padding, top: layout.margin.padding, 	width: box.width, height: box.height, text: 'DATA DE RECEBIMENTO', align: 'center' };
	layout.box[layout.box.length - 1] = box;

	// box 3
	layout.box[layout.box.length] = { left: 4.3, 		top: 0.9,	width: 10.5, height: 1.0, label: [] };

	// label box 3
	var box = layout.box[layout.box.length - 1];
	box.label[box.label.length] = { left: layout.margin.padding, top: layout.margin.padding, 	width: box.width, height: box.height, text: 'IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR' };
	layout.box[layout.box.length - 1] = box;

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

	layout.box[layout.box.length] = { left: 0, 			top: 2.35, 	width: 6.75, 	height: 2.9};  // box 1
	layout.box[layout.box.length] = { left: 9.2, 	top: 3.35, 	width: 0.6, 	height: 0.7};  // box 2
	layout.box[layout.box.length] = { left: 10.5, 	top: 2.35, 	width: 8.75, 	height: 2.9};  // box 3
	layout.box[layout.box.length] = { left: 10.7, 	top: 3.65, 	width: 8.4, 	height: 0.8};  // box 4

	// box natureza de operacao
	layout.box[layout.box.length] = { left: 0, 			top: 5.3, 	width: 19.27, 	height: 1.4, line: [], label: [] };

	// linhas divisorias natureza de operacao
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 0, 	  top: layout.line.height, 	right: box.width, 	bottom: layout.line.height };
	box.line[box.line.length] = { left: 10.5, top: 0, 					right: 10.5, 		bottom: layout.line.height };
	layout.box[layout.box.length - 1] = box;

	// texto de natureza de operacao
	var box = layout.box[layout.box.length - 1];
	box.label[box.label.length] = { left: layout.margin.padding, 		 top: layout.margin.padding, 	width: box.width, height: box.height, text: 'NATUREZA DA OPERAÇÃO' };
	box.label[box.label.length] = { left: layout.margin.padding + 10.5,  top: layout.margin.padding, 	width: box.width, height: box.height, text: 'PROTOCOLO DE AUTORIZAÇÃO DE USO' };
	layout.box[layout.box.length - 1] = box;

	// linhas divisorias natureza de operacao
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 3.5, top: layout.line.height, 	right: 3.5, bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 9.0, top: layout.line.height, 	right: 9.0, bottom: layout.line.height * 2 };
	layout.box[layout.box.length - 1] = box;

	// texto de natureza de operacao
	var box = layout.box[layout.box.length - 1];
	box.label[box.label.length] = { left: layout.margin.padding, 		top: layout.line.height + layout.margin.padding, 	width: box.width, height: box.height, text: 'INSCRIÇÃO ESTADUAL' };
	box.label[box.label.length] = { left: layout.margin.padding + 3.5,	top: layout.line.height + layout.margin.padding, 	width: box.width, height: box.height, text: 'INSCRIÇÃO ESTADUAL DO SUBST. TRIBUTÁRIO' };
	box.label[box.label.length] = { left: layout.margin.padding + 9.0, 	top: layout.line.height + layout.margin.padding, 	width: box.width, height: box.height, text: 'CNPJ' };
	layout.box[layout.box.length - 1] = box;

	// destinatario/remetente
	layout.box[layout.box.length] = { left: 0, top: 7.0, width: 19.27, height: layout.line.height * 3, line: [], label: [] };

	// linhas divisorias destinatario/remetente
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 0, 	top: layout.line.height, 		right: box.width, 	bottom: layout.line.height };
	box.line[box.line.length] = { left: 0, 	top: layout.line.height * 2, 	right: box.width, 	bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 10, top: 0, 						right: 10, 			bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 16.7, top: 0, 						right: 16.7, 		bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 15.3, top: layout.line.height, 		right: 15.3, 		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 12.2, top: layout.line.height * 2, 	right: 12.2, 		bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 13.2, top: layout.line.height * 2, 	right: 13.2, 		bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 16.7, top: layout.line.height * 2, 	right: 16.7,		bottom: layout.line.height * 3 };
	layout.box[layout.box.length - 1] = box;

	// texto de destinatario/remetente
	var box = layout.box[layout.box.length - 1];
	box.label[box.label.length] = { left: layout.margin.padding, 		top: layout.margin.padding, 	width: box.width, height: box.height, text: 'NOME / RAZÃO SOCIAL' };
	box.label[box.label.length] = { left: layout.margin.padding, 		top: layout.line.height + layout.margin.padding, 	width: box.width, height: box.height, text: 'ENDEREÇO' };
	box.label[box.label.length] = { left: layout.margin.padding, 		top: layout.line.height * 2 + layout.margin.padding, 	width: box.width, height: box.height, text: 'MUNICÍPIO' };
	box.label[box.label.length] = { left: layout.margin.padding + 10, 	top: layout.margin.padding, 	width: box.width, height: box.height, text: 'CNPJ / CPF' };
	box.label[box.label.length] = { left: layout.margin.padding + 10, 	top: layout.line.height + layout.margin.padding, 	width: box.width, height: box.height, text: 'BAIRRO/DISTRITO' };
	box.label[box.label.length] = { left: layout.margin.padding + 10, 	top: layout.line.height * 2 + layout.margin.padding, 	width: box.width, height: box.height, text: 'FONE/FAX' };
	box.label[box.label.length] = { left: layout.margin.padding + 16.7,	top: layout.margin.padding, 	width: box.width, height: box.height, text: 'DATA DE EMISSÃO' };
	box.label[box.label.length] = { left: layout.margin.padding + 16.7,	top: layout.line.height + layout.margin.padding, 	width: box.width, height: box.height, text: 'DATA DE SAÍDA/ENTR.' };
	box.label[box.label.length] = { left: layout.margin.padding + 16.7,	top: layout.line.height * 2 + layout.margin.padding, 	width: box.width, height: box.height, text: 'HORA DE SAÍDA' };
	box.label[box.label.length] = { left: layout.margin.padding + 15.3,	top: layout.line.height + layout.margin.padding, 	width: box.width, height: box.height, text: 'CEP' };
	box.label[box.label.length] = { left: layout.margin.padding + 12.2,	top: layout.line.height * 2 + layout.margin.padding, 	width: box.width, height: box.height, text: 'UF' };
	box.label[box.label.length] = { left: layout.margin.padding + 13.2,	top: layout.line.height * 2 + layout.margin.padding, 	width: box.width, height: box.height, text: 'INSCRIÇÃO ESTADUAL' };
	layout.box[layout.box.length - 1] = box;

	// vencimentos
	layout.box[layout.box.length] = { left: 0, top: 9.4, width: 19.27, height: layout.line.height + 0.3, line: [] };

	// linhas divisorias vencimentos
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 0, top: 0 + 0.3, 	right: box.width, 	bottom: 0.3 };
	box.line[box.line.length] = { left: 3.8, top: 0, 		right: 3.8,			bottom: layout.line.height + 0.3 };
	box.line[box.line.length] = { left: 7.7, top: 0, 		right: 7.7, 		bottom: layout.line.height + 0.3 };
	box.line[box.line.length] = { left: 11.5, top: 0, 		right: 11.5, 		bottom: layout.line.height + 0.3 };
	box.line[box.line.length] = { left: 15.4, top: 0, 		right: 15.4, 		bottom: layout.line.height + 0.3 };
	layout.box[layout.box.length - 1] = box;

	// calculo de impostos
	layout.box[layout.box.length] = { left: 0, top: 10.7, width: 19.27, height: layout.line.height * 2, line: [] };

	// linhas divisorias calculo de impostos
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 0, top: layout.line.height, 	right: box.width, 	bottom: layout.line.height };
	box.line[box.line.length] = { left: 3.25, top: 0, 					right: 3.25, 		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 16.35, top: 0, 					right: 16.35, 		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 6.3, top: 0, 					right: 6.3, 		bottom: layout.line.height };
	box.line[box.line.length] = { left: 11.2, top: 0, 					right: 11.2, 		bottom: layout.line.height };
	box.line[box.line.length] = { left: 14.4, top: 0, 					right: 14.4, 		bottom: layout.line.height };
	box.line[box.line.length] = { left: 5.6, top: layout.line.height, 	right: 5.6, 		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 7.9, top: layout.line.height, 	right: 7.9, 		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 11.3, top: layout.line.height, 	right: 11.3, 		bottom: layout.line.height * 2 };
	layout.box[layout.box.length - 1] = box;

	// tranportadora
	layout.box[layout.box.length] = { left: 0, top: 12.3, width: 19.27, height: layout.line.height * 3, line: [] };

	// linhas divisorias calculo de impostos
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 0, top: layout.line.height, 		right: box.width, 	bottom: layout.line.height };
	box.line[box.line.length] = { left: 0, top: layout.line.height  * 2, 	right: box.width, 	bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 16.4, top: 0, 						right: 16.4, 		bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 8.1, top: 0, 						right: 8.1, 		bottom: layout.line.height };
	box.line[box.line.length] = { left: 10.9, top: 0, 						right: 10.9, 		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 15.7, top: 0, 						right: 15.7,		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 13.4, top: 0, 						right: 13.4, 		bottom: layout.line.height };
	box.line[box.line.length] = { left: 6.75, top: layout.line.height, 		right: 6.75, 		bottom: layout.line.height * 2 };
	box.line[box.line.length] = { left: 3.2, top: layout.line.height * 2,	right: 3.2, 		bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 6.5, top: layout.line.height * 2,	right: 6.5, 		bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 9.7, top: layout.line.height * 2,	right: 9.7, 		bottom: layout.line.height * 3 };
	box.line[box.line.length] = { left: 13.0, top: layout.line.height * 2,	right: 13.0, 		bottom: layout.line.height * 3 };
	layout.box[layout.box.length - 1] = box;

	// dados dos produtos
	layout.box[layout.box.length] = { left: 0, top: 14.7, width: 19.27, height: 6.2, line: [] };;

	// linhas divisorias vencimentos
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 0, top: 0 + 0.3, 	right: box.width, 	bottom: 0.3 };
	box.line[box.line.length] = { left: 2.0, top: 0, 		right: 2.0, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 7.2, top: 0, 		right: 7.2, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 8.2, top: 0, 		right: 8.2, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 8.6, top: 0, 		right: 8.6, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 9.2, top: 0, 		right: 9.2,			bottom: 0.3 };
	box.line[box.line.length] = { left: 9.8, top: 0, 		right: 9.8, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 11.2, top: 0, 		right: 11.2, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 12.8, top: 0, 		right: 12.8, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 14.4, top: 0, 		right: 14.4, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 15.7, top: 0, 		right: 15.7, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 16.9, top: 0, 		right: 16.9, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 18.0, top: 0, 		right: 18.0, 		bottom: 0.3 };
	box.line[box.line.length] = { left: 18.7, top: 0, 		right: 18.7, 		bottom: 0.3 };

	box.line[box.line.length] = { left: 2.0, top: 0 + 0.3, 	right: 2.0, 		bottom: box.height };
	box.line[box.line.length] = { left: 7.2, top: 0 + 0.3, 	right: 7.2, 		bottom: box.height };
	box.line[box.line.length] = { left: 8.2, top: 0 + 0.3, 	right: 8.2, 		bottom: box.height };
	box.line[box.line.length] = { left: 8.6, top: 0 + 0.3, 	right: 8.6, 		bottom: box.height };
	box.line[box.line.length] = { left: 9.2, top: 0 + 0.3, 	right: 9.2, 		bottom: box.height };
	box.line[box.line.length] = { left: 9.8, top: 0 + 0.3, 	right: 9.8, 		bottom: box.height };
	box.line[box.line.length] = { left: 11.2, top: 0 + 0.3, right: 11.2, 		bottom: box.height };
	box.line[box.line.length] = { left: 12.8, top: 0 + 0.3, right: 12.8, 		bottom: box.height };
	box.line[box.line.length] = { left: 14.4, top: 0 + 0.3, right: 14.4, 		bottom: box.height };
	box.line[box.line.length] = { left: 15.7, top: 0 + 0.3, right: 15.7, 		bottom: box.height };
	box.line[box.line.length] = { left: 16.9, top: 0 + 0.3, right: 16.9, 		bottom: box.height };
	box.line[box.line.length] = { left: 18.0, top: 0 + 0.3, right: 18.0, 		bottom: box.height };
	box.line[box.line.length] = { left: 18.7, top: 0 + 0.3, right: 18.7, 		bottom: box.height };
	layout.box[layout.box.length - 1] = box;

	// calculo do issqn
	layout.box[layout.box.length] = { left: 0, top: 21.3, width: 19.27, height: layout.line.height, line: [] };

	// linhas divisorias calculo do issqn
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 4.8, top: 0, 	right: 4.8, 	bottom: layout.line.height };
	box.line[box.line.length] = { left: 9.6, top: 0, 	right: 9.6, 	bottom: layout.line.height };
	box.line[box.line.length] = { left: 14.6, top: 0, 	right: 14.6, 	bottom: layout.line.height };
	layout.box[layout.box.length - 1] = box;

	// dados adicionais
	layout.box[layout.box.length] = { left: 0, top: 22.4, width: 19.27, height: 2.7, line: [] };

	// linhas divisorias dados adicionais
	var box = layout.box[layout.box.length - 1];
	box.line[box.line.length] = { left: 14.6, top: 0, 	right: 14.6, bottom: box.height };
	layout.box[layout.box.length - 1] = box;

	/******************************************************************************************************
	 configuracoes do documento
	******************************************************************************************************/
	doc/*.font('Arial')*/
		.fontSize(layout.font.size)
        .lineWidth(layout.line.width * layout.unit)
        .page.margin =  { left: layout.margin.left, top: layout.margin.top, right: layout.margin.right, bottom: layout.margin.bottom };

	/******************************************************************************************************
	 inicio da renderizacao da pagina
	******************************************************************************************************/

	console.log(JSON.stringify(layout, null, 2));

    for (var i = 0; i < layout.box.length; i++) {
    	doc.roundedRect(
    			(layout.margin.left + layout.box[i].left) * layout.unit, 
    			(layout.margin.top + layout.box[i].top) * layout.unit, 
    			layout.box[i].width * layout.unit, 
    			layout.box[i].height * layout.unit, 
    			layout.margin.round * layout.unit).stroke();

    	if (layout.box[i].line) {
    		for (var l = 0; l < layout.box[i].line.length; l++) {
    			doc.moveTo(
    				(layout.margin.left + layout.box[i].left + layout.box[i].line[l].left) * layout.unit, 
	    			(layout.margin.top + layout.box[i].top + layout.box[i].line[l].top) * layout.unit).lineTo( 
	    				(layout.margin.left + layout.box[i].left + layout.box[i].line[l].right) * layout.unit,
	    				(layout.margin.top + layout.box[i].top + layout.box[i].line[l].bottom) * layout.unit);
    		}
    	}

    	if (layout.box[i].label) {
    		for (var l = 0; l < layout.box[i].label.length; l++) {
    			if (layout.box[i].label[l].size) {
    				doc.fontSize(layout.box[i].label[l].size);
    			}

    			doc.text( 	
    				layout.box[i].label[l].text, 
		   			(layout.margin.left + layout.box[i].left + layout.box[i].label[l].left) * layout.unit, 
		   			(layout.margin.top + layout.box[i].top + layout.box[i].label[l].top) * layout.unit,
	    			{ 
						width: layout.box[i].label[l].width * layout.unit,
						height: layout.box[i].label[l].height * layout.unit, 
						align: layout.box[i].label[l].align ? layout.box[i].label[l].align : 'left',
						stroke: layout.box[i].label[l].bold ? true : false,
						fill: layout.box[i].label[l].bold ? true : false,

	    			} 
	    		);

    			if (layout.box[i].label[l].size) {
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


