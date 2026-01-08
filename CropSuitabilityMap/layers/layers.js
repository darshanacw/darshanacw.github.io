var wms_layers = [];


        var lyr_OpenStreetMap_0 = new ol.layer.Tile({
            'title': 'OpenStreetMap',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        });

var lyr_CassavaSuitability_2 = new ol.layer.Image({
        opacity: 1,
        
    title: 'Cassava Suitability<br />\
    <img src="styles/legend/CassavaSuitability_2_0.png" /> 0<br />\
    <img src="styles/legend/CassavaSuitability_2_1.png" /> 1<br />\
    <img src="styles/legend/CassavaSuitability_2_2.png" /> 2<br />\
    <img src="styles/legend/CassavaSuitability_2_3.png" /> 3<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/CassavaSuitability_2.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [11133552.518162, 1559101.696449, 11994871.112435, 2575839.285945]
        })
    });
var lyr_MaizeSuitability_3 = new ol.layer.Image({
        opacity: 1,
        
    title: 'Maize Suitability<br />\
    <img src="styles/legend/MaizeSuitability_3_0.png" /> 0<br />\
    <img src="styles/legend/MaizeSuitability_3_1.png" /> 1<br />\
    <img src="styles/legend/MaizeSuitability_3_2.png" /> 2<br />\
    <img src="styles/legend/MaizeSuitability_3_3.png" /> 3<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/MaizeSuitability_3.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [11133549.324732, 1559101.635521, 11995138.190693, 2575839.279918]
        })
    });
var lyr_RiceSuitability_4 = new ol.layer.Image({
        opacity: 1,
        
    title: 'Rice Suitability<br />\
    <img src="styles/legend/RiceSuitability_4_0.png" /> 0<br />\
    <img src="styles/legend/RiceSuitability_4_1.png" /> 1<br />\
    <img src="styles/legend/RiceSuitability_4_2.png" /> 2<br />\
    <img src="styles/legend/RiceSuitability_4_3.png" /> 3<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/RiceSuitability_4.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [11133360.698398, 1559098.344681, 11994757.935561, 2576329.251558]
        })
    });
var format_SoilWRB_5 = new ol.format.GeoJSON();
var features_SoilWRB_5 = format_SoilWRB_5.readFeatures(json_SoilWRB_5, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_SoilWRB_5 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_SoilWRB_5.addFeatures(features_SoilWRB_5);
var lyr_SoilWRB_5 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_SoilWRB_5, 
                style: style_SoilWRB_5,
                popuplayertitle: 'Soil WRB',
                interactive: true,
                title: '<img src="styles/legend/SoilWRB_5.png" /> Soil WRB'
            });
var format_SoilProfiles_6 = new ol.format.GeoJSON();
var features_SoilProfiles_6 = format_SoilProfiles_6.readFeatures(json_SoilProfiles_6, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_SoilProfiles_6 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_SoilProfiles_6.addFeatures(features_SoilProfiles_6);
var lyr_SoilProfiles_6 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_SoilProfiles_6, 
                style: style_SoilProfiles_6,
                popuplayertitle: 'Soil Profiles',
                interactive: true,
                title: '<img src="styles/legend/SoilProfiles_6.png" /> Soil Profiles'
            });
var group_CropSuitability = new ol.layer.Group({
                                layers: [lyr_CassavaSuitability_2,lyr_MaizeSuitability_3,lyr_RiceSuitability_4,],
                                fold: 'open',
                                title: 'Crop Suitability '});

lyr_OpenStreetMap_0.setVisible(true);lyr_CassavaSuitability_2.setVisible(true);lyr_MaizeSuitability_3.setVisible(true);lyr_RiceSuitability_4.setVisible(true);lyr_SoilWRB_5.setVisible(true);lyr_SoilProfiles_6.setVisible(true);
var layersList = [lyr_OpenStreetMap_0,group_CropSuitability,lyr_SoilWRB_5,lyr_SoilProfiles_6];
lyr_SoilWRB_5.set('fieldAliases', {'PROFILEAG': 'PROFILEAG', 'MAPID': 'MAPID', 'EX': 'EX', 'NY': 'NY', 'WRB2014_SY': 'WRB2014_SY', 'WRB2014_FU': 'WRB2014_FU', 'WRB2014_UN': 'WRB2014_UN', 'WRB2014_SU': 'WRB2014_SU', 'WRB2014_RS': 'WRB2014_RS', 'PREFIX': 'PREFIX', 'SUFFIX': 'SUFFIX', 'DISTRICT': 'DISTRICT', 'PROVINCE': 'PROVINCE', 'DESCRIBE': 'DESCRIBE', 'OLDUNIT': 'OLDUNIT', 'DEPTH': 'DEPTH', 'THICKNESS': 'THICKNESS', 'pHH2O': 'pHH2O', 'pHKCl': 'pHKCl', 'EC': 'EC', 'ESP': 'ESP', 'OC': 'OC', 'OM': 'OM', 'N_total': 'N_total', 'P_avai': 'P_avai', 'K_avai': 'K_avai', 'Al___': 'Al___', 'Hh': 'Hh', 'Ca__': 'Ca__', 'Mg__': 'Mg__', 'K_': 'K_', 'Na_': 'Na_', 'CEC_T': 'CEC_T', 'CEC_T_clay': 'CEC_T_clay', 'BS': 'BS', 'Sand': 'Sand', 'Silt': 'Silt', 'Clay': 'Clay', 'TEXTURE': 'TEXTURE', 'DRAINAGE': 'DRAINAGE', 'ELEVATION': 'ELEVATION', 'SLOPE': 'SLOPE', 'area_ha': 'area_ha', 'pH_class': 'pH_class', 'K_avai_cla': 'K_avai_cla', 'P_avai_cla': 'P_avai_cla', 'N_total_cl': 'N_total_cl', 'OM_class': 'OM_class', 'MAP_IDNEW': 'MAP_IDNEW', });
lyr_SoilProfiles_6.set('fieldAliases', {'MAPID': 'MAPID', 'PROFILEAG': 'PROFILEAG', 'EX': 'EX', 'NY': 'NY', 'SYMBOL': 'SYMBOL', 'WRB2014_FU': 'WRB2014_FU', 'UNIT': 'UNIT', 'SUBUNIT': 'SUBUNIT', 'DISTRICT': 'DISTRICT', 'PROVINCE': 'PROVINCE', 'DESCRIBE': 'DESCRIBE', 'OLDUNIT': 'OLDUNIT', 'DEPTH': 'DEPTH', 'THICKNESS': 'THICKNESS', 'pHH2O': 'pHH2O', 'pHKCL': 'pHKCL', 'EC': 'EC', 'ESP': 'ESP', 'OC': 'OC', 'OM': 'OM', 'N_total': 'N_total', 'P_avai': 'P_avai', 'K_avai': 'K_avai', 'Al': 'Al', 'Hh': 'Hh', 'Ca': 'Ca', 'Mg': 'Mg', 'K': 'K', 'Na': 'Na', 'CEC_T': 'CEC_T', 'CEC_T_clay': 'CEC_T_clay', 'BS': 'BS', 'Sand': 'Sand', 'Silt': 'Silt', 'Clay': 'Clay', 'TEXTURE': 'TEXTURE', 'DRAINAGE': 'DRAINAGE', 'ELEVATION': 'ELEVATION', 'SLOPE': 'SLOPE', });
lyr_SoilWRB_5.set('fieldImages', {'PROFILEAG': 'TextEdit', 'MAPID': 'TextEdit', 'EX': 'TextEdit', 'NY': 'TextEdit', 'WRB2014_SY': 'TextEdit', 'WRB2014_FU': 'TextEdit', 'WRB2014_UN': 'TextEdit', 'WRB2014_SU': 'TextEdit', 'WRB2014_RS': 'TextEdit', 'PREFIX': 'TextEdit', 'SUFFIX': 'TextEdit', 'DISTRICT': 'TextEdit', 'PROVINCE': 'TextEdit', 'DESCRIBE': 'TextEdit', 'OLDUNIT': 'TextEdit', 'DEPTH': 'TextEdit', 'THICKNESS': 'TextEdit', 'pHH2O': 'TextEdit', 'pHKCl': 'TextEdit', 'EC': 'TextEdit', 'ESP': 'TextEdit', 'OC': 'TextEdit', 'OM': 'TextEdit', 'N_total': 'TextEdit', 'P_avai': 'TextEdit', 'K_avai': 'TextEdit', 'Al___': 'TextEdit', 'Hh': 'TextEdit', 'Ca__': 'TextEdit', 'Mg__': 'TextEdit', 'K_': 'TextEdit', 'Na_': 'TextEdit', 'CEC_T': 'TextEdit', 'CEC_T_clay': 'TextEdit', 'BS': 'TextEdit', 'Sand': 'TextEdit', 'Silt': 'TextEdit', 'Clay': 'TextEdit', 'TEXTURE': 'TextEdit', 'DRAINAGE': 'TextEdit', 'ELEVATION': 'TextEdit', 'SLOPE': 'TextEdit', 'area_ha': 'TextEdit', 'pH_class': 'Range', 'K_avai_cla': 'Range', 'P_avai_cla': 'Range', 'N_total_cl': 'Range', 'OM_class': 'Range', 'MAP_IDNEW': 'TextEdit', });
lyr_SoilProfiles_6.set('fieldImages', {'MAPID': 'TextEdit', 'PROFILEAG': 'TextEdit', 'EX': 'TextEdit', 'NY': 'TextEdit', 'SYMBOL': 'TextEdit', 'WRB2014_FU': 'TextEdit', 'UNIT': 'TextEdit', 'SUBUNIT': 'TextEdit', 'DISTRICT': 'TextEdit', 'PROVINCE': 'TextEdit', 'DESCRIBE': 'TextEdit', 'OLDUNIT': 'TextEdit', 'DEPTH': 'TextEdit', 'THICKNESS': 'TextEdit', 'pHH2O': 'TextEdit', 'pHKCL': 'TextEdit', 'EC': 'TextEdit', 'ESP': 'TextEdit', 'OC': 'TextEdit', 'OM': 'TextEdit', 'N_total': 'TextEdit', 'P_avai': 'TextEdit', 'K_avai': 'TextEdit', 'Al': 'TextEdit', 'Hh': 'TextEdit', 'Ca': 'TextEdit', 'Mg': 'TextEdit', 'K': 'TextEdit', 'Na': 'TextEdit', 'CEC_T': 'TextEdit', 'CEC_T_clay': 'TextEdit', 'BS': 'TextEdit', 'Sand': 'TextEdit', 'Silt': 'TextEdit', 'Clay': 'TextEdit', 'TEXTURE': 'TextEdit', 'DRAINAGE': 'TextEdit', 'ELEVATION': 'TextEdit', 'SLOPE': 'TextEdit', });
lyr_SoilWRB_5.set('fieldLabels', {'PROFILEAG': 'inline label - always visible', 'MAPID': 'inline label - always visible', 'EX': 'inline label - always visible', 'NY': 'inline label - always visible', 'WRB2014_SY': 'inline label - always visible', 'WRB2014_FU': 'inline label - always visible', 'WRB2014_UN': 'inline label - always visible', 'WRB2014_SU': 'inline label - always visible', 'WRB2014_RS': 'inline label - always visible', 'PREFIX': 'inline label - always visible', 'SUFFIX': 'inline label - always visible', 'DISTRICT': 'inline label - always visible', 'PROVINCE': 'inline label - always visible', 'DESCRIBE': 'inline label - always visible', 'OLDUNIT': 'inline label - always visible', 'DEPTH': 'inline label - always visible', 'THICKNESS': 'inline label - always visible', 'pHH2O': 'inline label - always visible', 'pHKCl': 'inline label - always visible', 'EC': 'inline label - always visible', 'ESP': 'inline label - always visible', 'OC': 'inline label - always visible', 'OM': 'inline label - always visible', 'N_total': 'inline label - always visible', 'P_avai': 'inline label - always visible', 'K_avai': 'inline label - always visible', 'Al___': 'inline label - always visible', 'Hh': 'inline label - always visible', 'Ca__': 'inline label - always visible', 'Mg__': 'inline label - always visible', 'K_': 'inline label - always visible', 'Na_': 'inline label - always visible', 'CEC_T': 'inline label - always visible', 'CEC_T_clay': 'inline label - always visible', 'BS': 'inline label - always visible', 'Sand': 'inline label - always visible', 'Silt': 'inline label - always visible', 'Clay': 'inline label - always visible', 'TEXTURE': 'inline label - always visible', 'DRAINAGE': 'inline label - always visible', 'ELEVATION': 'inline label - always visible', 'SLOPE': 'inline label - always visible', 'area_ha': 'inline label - always visible', 'pH_class': 'inline label - always visible', 'K_avai_cla': 'inline label - always visible', 'P_avai_cla': 'inline label - always visible', 'N_total_cl': 'inline label - always visible', 'OM_class': 'inline label - always visible', 'MAP_IDNEW': 'inline label - always visible', });
lyr_SoilProfiles_6.set('fieldLabels', {'MAPID': 'no label', 'PROFILEAG': 'no label', 'EX': 'no label', 'NY': 'no label', 'SYMBOL': 'no label', 'WRB2014_FU': 'no label', 'UNIT': 'no label', 'SUBUNIT': 'no label', 'DISTRICT': 'no label', 'PROVINCE': 'no label', 'DESCRIBE': 'no label', 'OLDUNIT': 'no label', 'DEPTH': 'no label', 'THICKNESS': 'no label', 'pHH2O': 'no label', 'pHKCL': 'no label', 'EC': 'no label', 'ESP': 'no label', 'OC': 'no label', 'OM': 'no label', 'N_total': 'no label', 'P_avai': 'no label', 'K_avai': 'no label', 'Al': 'no label', 'Hh': 'no label', 'Ca': 'no label', 'Mg': 'no label', 'K': 'no label', 'Na': 'no label', 'CEC_T': 'no label', 'CEC_T_clay': 'no label', 'BS': 'no label', 'Sand': 'no label', 'Silt': 'no label', 'Clay': 'no label', 'TEXTURE': 'no label', 'DRAINAGE': 'no label', 'ELEVATION': 'no label', 'SLOPE': 'no label', });
lyr_SoilProfiles_6.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});