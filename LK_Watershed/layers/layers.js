var wms_layers = [];


        var lyr_OpenStreetMap_0 = new ol.layer.Tile({
            'title': 'OpenStreetMap',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        });
var format_Level4_1 = new ol.format.GeoJSON();
var features_Level4_1 = format_Level4_1.readFeatures(json_Level4_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Level4_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Level4_1.addFeatures(features_Level4_1);
var lyr_Level4_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Level4_1, 
                style: style_Level4_1,
                popuplayertitle: 'Level-4',
                interactive: true,
                title: '<img src="styles/legend/Level4_1.png" /> Level-4'
            });
var format_Level5_2 = new ol.format.GeoJSON();
var features_Level5_2 = format_Level5_2.readFeatures(json_Level5_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Level5_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Level5_2.addFeatures(features_Level5_2);
var lyr_Level5_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Level5_2, 
                style: style_Level5_2,
                popuplayertitle: 'Level-5',
                interactive: true,
                title: '<img src="styles/legend/Level5_2.png" /> Level-5'
            });
var format_Level6_3 = new ol.format.GeoJSON();
var features_Level6_3 = format_Level6_3.readFeatures(json_Level6_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Level6_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Level6_3.addFeatures(features_Level6_3);
var lyr_Level6_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Level6_3, 
                style: style_Level6_3,
                popuplayertitle: 'Level-6',
                interactive: true,
                title: '<img src="styles/legend/Level6_3.png" /> Level-6'
            });
var format_Level7_4 = new ol.format.GeoJSON();
var features_Level7_4 = format_Level7_4.readFeatures(json_Level7_4, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Level7_4 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Level7_4.addFeatures(features_Level7_4);
var lyr_Level7_4 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Level7_4, 
                style: style_Level7_4,
                popuplayertitle: 'Level-7',
                interactive: true,
                title: '<img src="styles/legend/Level7_4.png" /> Level-7'
            });
var format_Level8_5 = new ol.format.GeoJSON();
var features_Level8_5 = format_Level8_5.readFeatures(json_Level8_5, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Level8_5 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Level8_5.addFeatures(features_Level8_5);
var lyr_Level8_5 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Level8_5, 
                style: style_Level8_5,
                popuplayertitle: 'Level-8',
                interactive: true,
                title: '<img src="styles/legend/Level8_5.png" /> Level-8'
            });
var format_Level9_6 = new ol.format.GeoJSON();
var features_Level9_6 = format_Level9_6.readFeatures(json_Level9_6, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Level9_6 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Level9_6.addFeatures(features_Level9_6);
var lyr_Level9_6 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Level9_6, 
                style: style_Level9_6,
                popuplayertitle: 'Level-9',
                interactive: true,
                title: '<img src="styles/legend/Level9_6.png" /> Level-9'
            });
var format_Drainages_7 = new ol.format.GeoJSON();
var features_Drainages_7 = format_Drainages_7.readFeatures(json_Drainages_7, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Drainages_7 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Drainages_7.addFeatures(features_Drainages_7);
var lyr_Drainages_7 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Drainages_7, 
                style: style_Drainages_7,
                popuplayertitle: 'Drainages',
                interactive: true,
    title: 'Drainages<br />\
    <img src="styles/legend/Drainages_7_0.png" /> 3 - 4<br />\
    <img src="styles/legend/Drainages_7_1.png" /> 4 - 5<br />\
    <img src="styles/legend/Drainages_7_2.png" /> 5 - 6<br />\
    <img src="styles/legend/Drainages_7_3.png" /> 6 - 7<br />\
    <img src="styles/legend/Drainages_7_4.png" /> 7 - 8<br />\
    <img src="styles/legend/Drainages_7_5.png" /> 8 - 9<br />' });
var group_group1 = new ol.layer.Group({
                                layers: [],
                                fold: 'open',
                                title: 'group1'});
var group_group3 = new ol.layer.Group({
                                layers: [],
                                fold: 'open',
                                title: 'group3'});
var group_group2 = new ol.layer.Group({
                                layers: [],
                                fold: 'close',
                                title: 'group2'});

lyr_OpenStreetMap_0.setVisible(true);lyr_Level4_1.setVisible(true);lyr_Level5_2.setVisible(true);lyr_Level6_3.setVisible(true);lyr_Level7_4.setVisible(true);lyr_Level8_5.setVisible(true);lyr_Level9_6.setVisible(true);lyr_Drainages_7.setVisible(true);
var layersList = [lyr_OpenStreetMap_0,lyr_Level4_1,lyr_Level5_2,lyr_Level6_3,lyr_Level7_4,lyr_Level8_5,lyr_Level9_6,lyr_Drainages_7];
lyr_Level4_1.set('fieldAliases', {'Id': 'Id', 'gridcode': 'gridcode', });
lyr_Level5_2.set('fieldAliases', {'Id': 'Id', 'gridcode': 'gridcode', });
lyr_Level6_3.set('fieldAliases', {'Id': 'Id', 'gridcode': 'gridcode', });
lyr_Level7_4.set('fieldAliases', {'Id': 'Id', 'gridcode': 'gridcode', });
lyr_Level8_5.set('fieldAliases', {'Id': 'Id', 'gridcode': 'gridcode', });
lyr_Level9_6.set('fieldAliases', {'Id': 'Id', 'gridcode': 'gridcode', });
lyr_Drainages_7.set('fieldAliases', {'grid_code': 'grid_code', 'merge_id': 'merge_id', });
lyr_Level4_1.set('fieldImages', {'Id': 'Range', 'gridcode': 'Range', });
lyr_Level5_2.set('fieldImages', {'Id': 'Range', 'gridcode': 'Range', });
lyr_Level6_3.set('fieldImages', {'Id': 'Range', 'gridcode': 'Range', });
lyr_Level7_4.set('fieldImages', {'Id': 'Range', 'gridcode': 'Range', });
lyr_Level8_5.set('fieldImages', {'Id': 'Range', 'gridcode': 'Range', });
lyr_Level9_6.set('fieldImages', {'Id': 'Range', 'gridcode': 'Range', });
lyr_Drainages_7.set('fieldImages', {'grid_code': 'Range', 'merge_id': 'Range', });
lyr_Level4_1.set('fieldLabels', {'Id': 'no label', 'gridcode': 'no label', });
lyr_Level5_2.set('fieldLabels', {'Id': 'no label', 'gridcode': 'no label', });
lyr_Level6_3.set('fieldLabels', {'Id': 'no label', 'gridcode': 'no label', });
lyr_Level7_4.set('fieldLabels', {'Id': 'no label', 'gridcode': 'no label', });
lyr_Level8_5.set('fieldLabels', {'Id': 'no label', 'gridcode': 'no label', });
lyr_Level9_6.set('fieldLabels', {'Id': 'no label', 'gridcode': 'no label', });
lyr_Drainages_7.set('fieldLabels', {'grid_code': 'no label', 'merge_id': 'no label', });
lyr_Drainages_7.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});