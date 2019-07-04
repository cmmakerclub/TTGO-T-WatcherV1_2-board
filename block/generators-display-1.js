module.exports = function(Blockly){
'use strict';

// =============================================================================
// basic
// =============================================================================

Blockly.JavaScript['basic_led16x8'] = function(block) {
	var buf = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
	for (var x = 0; x < 16; x++) {
		var byte = 0;
		for (var y = 0; y < 8; y++) {
			var val = block.getFieldValue('POS_X' + x + '_Y' + y);
			if (val == 'TRUE') {
				byte |= (0x01 << y);
			};
		}
		buf[x] = byte;
	}

	var str = '';
	for (var i = 0; i < 16; i++) {
		str += '\\x' + buf[i].toString(16);
	}

	//return 'ht16k33.show((uint8_t *)"' + str + '");\n';
	return 'matrix.printText(0, 0, " ");\n';
};


Blockly.JavaScript['basic_led16x8_clr'] = function(block) {
	var code = 'matrix.printText(0, 0, " ");\n';
	return code;
};

Blockly.JavaScript['basic_led16x8_2chars'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
    //var argument0 = Blockly.JavaScript.valueToCode(block);
	var code = 'matrix.printText(0, 0, String(' + argument0 + '));\n';
	return code;
};

Blockly.JavaScript['basic_led16x8_scroll'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	//return 'ht16k33.scroll(' + argument0 + ', true);\n';
	var code = 'matrix.scrollText(String(' + argument0 + '));\n';
	return code;
};

Blockly.JavaScript['basic_led16x8_scroll_when_ready'] = function(block) {
	//var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';

	//return 'if (ht16k33.idle()) { ht16k33.scroll(' + argument0 + ', true); }\n';
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var code = 'matrix.scrollText(String(' + argument0 + '));\n';
	return code;
};

Blockly.JavaScript['basic_delay'] = function(block) {
	return 'vTaskDelay(' + parseInt(1000 * parseFloat(block.getFieldValue('VALUE'))) + ' / portTICK_RATE_MS);\n';
};

Blockly.JavaScript['basic_forever'] = function(block) {
	return 'while(1) {\n' + Blockly.JavaScript.statementToCode(block, 'HANDLER') + '}\n';
};

Blockly.JavaScript['basic_string'] = function(block) {
	return [
		'(char *)"' + block.getFieldValue('VALUE') + '"',
		Blockly.JavaScript.ORDER_ATOMIC
	];
};

Blockly.JavaScript['basic_TFT_setRotation'] = function(block) {
	var code = 'tft.setRotation('+block.getFieldValue('rotation')+');\n';
	return code;
};

Blockly.JavaScript['basic_TFT_fillScreen'] = function(block) {
	let color = block.getFieldValue('COLOR');
	color = color.replace("#", "0x");
	let sourceColor = parseInt(color, 16);
	let red = (sourceColor & 0x00FF0000) >> 16;
	let green = (sourceColor & 0x0000FF00) >> 8;
	let blue =  sourceColor & 0x000000FF;
	let out = (red >> 3 << 11) + (green >> 2 << 5) + (blue >> 3);
	out = out.toString(16);
	var code = 'tft.fillScreen(0x'+out+');\n';
	return code;
};

Blockly.JavaScript['basic_TFT_setTextSize'] = function(block) {
	var code = 'tft.setTextSize('+block.getFieldValue('textSize')+');\n';
	return code;
};

function rgbto16bit(colorIN) {
	let color = colorIN.replace("#", "0x");
	let sourceColor = parseInt(color, 16);
	let red = (sourceColor & 0x00FF0000) >> 16;
	let green = (sourceColor & 0x0000FF00) >> 8;
	let blue =  sourceColor & 0x000000FF;
	let out = (red >> 3 << 11) + (green >> 2 << 5) + (blue >> 3);
	out = out.toString(16)
	return out;   // The function returns the product of p1 and p2
  }

Blockly.JavaScript['basic_TFT_print'] = function(block) {
	var argument0 = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
	var code = 'tft.setCursor('+block.getFieldValue('X')+', '+block.getFieldValue('Y')+');\n tft.setTextColor(0x'+rgbto16bit(block.getFieldValue('COLOR'))+');\n tft.println(String('+argument0+'));\n';
	return code;
};


const nativeImage = require('electron').nativeImage;
var createBuffer = function(pixels,width,height){
    var depth = 4,
        pixelsLen = pixels.length,
        unpackedBuffer = [],
        threshold = 120;

    var buffer = new Buffer((width *  (Math.ceil(height / 8) * 8)) / 8);
    buffer.fill(0x00);// filter pixels to create monochrome image data
    for (var i = 0; i < pixelsLen; i += depth) { // just take the red value
        var pixelVal = pixels[i + 1] = pixels[i + 2] = pixels[i];
        pixelVal = (pixelVal > threshold)? 1 : 0;
        unpackedBuffer[i/depth] = pixelVal; // push to unpacked buffer list
    }
    for(var x = 0;x < width; x++){
        for(var y = 0; y < height; y+=8){
            for(var cy = 0; cy < 8; cy++){
                var iy = y+cy;
                if(iy >= height){ break; }
                buffer[x*Math.ceil(height/8) + Math.floor(y/8)] |= unpackedBuffer[iy*width + x] << cy;
            }
        }
    }
    return buffer;
};

Blockly.JavaScript['i2c128x64_create_image'] = function(block) {
    var dataurl = block.inputList[1].fieldRow["0"].src_;
    var image = nativeImage.createFromDataURL(dataurl);
    var size = image.getSize();
    var buff = createBuffer(image.getBitmap(),size.width,size.height);
    var hexStringArr = '';
    for(let i=1;i<=buff.length;i++){
        hexStringArr += (buff[i-1] < 16)? `0x0${buff[i-1].toString(16)},` : `0x${buff[i-1].toString(16)},`;
        if(i % 20 == 0){ hexStringArr += '\n'; }
    }
    hexStringArr = hexStringArr.trim();
    if(hexStringArr.endsWith(',')){
        hexStringArr = hexStringArr.substring(0,hexStringArr.length - 1);
    }
    var code = `(std::vector<uint8_t>{${hexStringArr}})`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['i2c128x64_display_image'] = function(block) {
    var value_img = Blockly.JavaScript.valueToCode(block, 'img', Blockly.JavaScript.ORDER_ATOMIC);
    var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
    var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
    var value_width = Blockly.JavaScript.valueToCode(block, 'width', Blockly.JavaScript.ORDER_ATOMIC);
    var value_height = Blockly.JavaScript.valueToCode(block, 'height', Blockly.JavaScript.ORDER_ATOMIC);
    // var code = `display.drawFastImage(${value_x}, ${value_y}, ${value_width},${value_height},${value_img}.data());\n`;
	var code = `tft.drawRGBBitmap(${value_x}, ${value_y}, ${value_img}, ${value_width},${value_height});\n`;
	return code;
};

}