var wms_layers = [];

var format_LandCover_0 = new ol.format.GeoJSON();
var features_LandCover_0 = format_LandCover_0.readFeatures(json_LandCover_0, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_LandCover_0 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_LandCover_0.addFeatures(features_LandCover_0);
var lyr_LandCover_0 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_LandCover_0, 
                style: style_LandCover_0,
                interactive: true,
    title: 'LandCover<br />\
    <img src="styles/legend/LandCover_0_0.png" /> AG<br />\
    <img src="styles/legend/LandCover_0_1.png" /> BL<br />\
    <img src="styles/legend/LandCover_0_2.png" /> BUL<br />\
    <img src="styles/legend/LandCover_0_3.png" /> FL<br />\
    <img src="styles/legend/LandCover_0_4.png" /> RA<br />\
    <img src="styles/legend/LandCover_0_5.png" /> WB<br />\
    <img src="styles/legend/LandCover_0_6.png" /> <br />'
        });
var format_River_1 = new ol.format.GeoJSON();
var features_River_1 = format_River_1.readFeatures(json_River_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_River_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_River_1.addFeatures(features_River_1);
var lyr_River_1 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_River_1, 
                style: style_River_1,
                interactive: true,
                title: '<img src="styles/legend/River_1.png" /> River'
            });
var format_GNDivision_2 = new ol.format.GeoJSON();
var features_GNDivision_2 = format_GNDivision_2.readFeatures(json_GNDivision_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_GNDivision_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_GNDivision_2.addFeatures(features_GNDivision_2);
var lyr_GNDivision_2 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_GNDivision_2, 
                style: style_GNDivision_2,
                interactive: true,
                title: '<img src="styles/legend/GNDivision_2.png" /> GN Division'
            });
var format_MWS003_3 = new ol.format.GeoJSON();
var features_MWS003_3 = format_MWS003_3.readFeatures(json_MWS003_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_MWS003_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_MWS003_3.addFeatures(features_MWS003_3);
var lyr_MWS003_3 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_MWS003_3, 
                style: style_MWS003_3,
                interactive: true,
                title: '<img src="styles/legend/MWS003_3.png" /> MWS003'
            });

lyr_LandCover_0.setVisible(true);lyr_River_1.setVisible(true);lyr_GNDivision_2.setVisible(true);lyr_MWS003_3.setVisible(true);
var layersList = [lyr_LandCover_0,lyr_River_1,lyr_GNDivision_2,lyr_MWS003_3];
lyr_LandCover_0.set('fieldAliases', {'luse_code': 'luse_code', 'main_categ': 'main_categ', 'sub_catego': 'sub_catego', 'tank_name': 'tank_name', 'method_of_': 'method_of_', 'year_of_up': 'year_of_up', 'sheet_no': 'sheet_no', 'shape_Leng': 'shape_Leng', 'shape_Area': 'shape_Area', 'Class': 'Class', });
lyr_River_1.set('fieldAliases', {'arcid': 'arcid', 'grid_code': 'grid_code', 'from_node': 'from_node', 'to_node': 'to_node', });
lyr_GNDivision_2.set('fieldAliases', {'OBJECTID_1': 'OBJECTID_1', 'OBJECTID': 'OBJECTID', 'FID_UpperM': 'FID_UpperM', 'DISTRICT_N': 'DISTRICT_N', 'FID_Uppe_1': 'FID_Uppe_1', 'GND_N': 'GND_N', 'GND_NO': 'GND_NO', 'GND_C': 'GND_C', 'FID_Basin_': 'FID_Basin_', 'Id': 'Id', 'gridcode': 'gridcode', 'BName': 'BName', 'FID_Uppe_2': 'FID_Uppe_2', 'DSD_N': 'DSD_N', 'Shape_Leng': 'Shape_Leng', 'bi': 'bi', 'Shape_Le_1': 'Shape_Le_1', 'Shape_Area': 'Shape_Area', 'MWS_ID': 'MWS_ID', });
lyr_MWS003_3.set('fieldAliases', {'OBJECTID': 'OBJECTID', 'DSD_N': 'DSD_N', 'Shape_Leng': 'Shape_Leng', 'Shape_Area': 'Shape_Area', 'MWSID': 'MWSID', 'MWS_Name': 'MWS_Name', });
lyr_LandCover_0.set('fieldImages', {'luse_code': 'TextEdit', 'main_categ': 'TextEdit', 'sub_catego': 'TextEdit', 'tank_name': 'TextEdit', 'method_of_': 'TextEdit', 'year_of_up': 'TextEdit', 'sheet_no': 'TextEdit', 'shape_Leng': 'TextEdit', 'shape_Area': 'TextEdit', 'Class': 'TextEdit', });
lyr_River_1.set('fieldImages', {'arcid': 'TextEdit', 'grid_code': 'TextEdit', 'from_node': 'TextEdit', 'to_node': 'TextEdit', });
lyr_GNDivision_2.set('fieldImages', {'OBJECTID_1': 'TextEdit', 'OBJECTID': 'TextEdit', 'FID_UpperM': 'TextEdit', 'DISTRICT_N': 'TextEdit', 'FID_Uppe_1': 'TextEdit', 'GND_N': 'TextEdit', 'GND_NO': 'TextEdit', 'GND_C': 'TextEdit', 'FID_Basin_': 'TextEdit', 'Id': 'TextEdit', 'gridcode': 'TextEdit', 'BName': 'TextEdit', 'FID_Uppe_2': 'TextEdit', 'DSD_N': 'TextEdit', 'Shape_Leng': 'TextEdit', 'bi': 'TextEdit', 'Shape_Le_1': 'TextEdit', 'Shape_Area': 'TextEdit', 'MWS_ID': 'Range', });
lyr_MWS003_3.set('fieldImages', {'OBJECTID': 'TextEdit', 'DSD_N': 'TextEdit', 'Shape_Leng': 'TextEdit', 'Shape_Area': 'TextEdit', 'MWSID': 'Range', 'MWS_Name': 'TextEdit', });
lyr_LandCover_0.set('fieldLabels', {'luse_code': 'inline label', 'main_categ': 'inline label', 'sub_catego': 'inline label', 'tank_name': 'no label', 'method_of_': 'no label', 'year_of_up': 'no label', 'sheet_no': 'no label', 'shape_Leng': 'no label', 'shape_Area': 'no label', 'Class': 'no label', });
lyr_River_1.set('fieldLabels', {'arcid': 'no label', 'grid_code': 'no label', 'from_node': 'no label', 'to_node': 'no label', });
lyr_GNDivision_2.set('fieldLabels', {'OBJECTID_1': 'no label', 'OBJECTID': 'inline label', 'FID_UpperM': 'no label', 'DISTRICT_N': 'no label', 'FID_Uppe_1': 'no label', 'GND_N': 'no label', 'GND_NO': 'no label', 'GND_C': 'no label', 'FID_Basin_': 'no label', 'Id': 'no label', 'gridcode': 'no label', 'BName': 'no label', 'FID_Uppe_2': 'no label', 'DSD_N': 'no label', 'Shape_Leng': 'no label', 'bi': 'no label', 'Shape_Le_1': 'no label', 'Shape_Area': 'no label', 'MWS_ID': 'no label', });
lyr_MWS003_3.set('fieldLabels', {'OBJECTID': 'no label', 'DSD_N': 'no label', 'Shape_Leng': 'no label', 'Shape_Area': 'no label', 'MWSID': 'no label', 'MWS_Name': 'no label', });
lyr_MWS003_3.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});