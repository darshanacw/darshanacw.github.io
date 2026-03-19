var wms_layers = [];


        var lyr_OpenStreetMap_0 = new ol.layer.Tile({
            'title': 'OpenStreetMap',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        });
var lyr_LandCover_1 = new ol.layer.Image({
        opacity: 1,
        
    title: 'Land Cover<br />\
    <img src="styles/legend/LandCover_1_0.png" /> Annual crops and Grassland<br />\
    <img src="styles/legend/LandCover_1_1.png" /> Bare Areas<br />\
    <img src="styles/legend/LandCover_1_2.png" /> Built-up<br />\
    <img src="styles/legend/LandCover_1_3.png" /> Cassava<br />\
    <img src="styles/legend/LandCover_1_4.png" /> Paddy rice<br />\
    <img src="styles/legend/LandCover_1_5.png" /> Maize<br />\
    <img src="styles/legend/LandCover_1_6.png" /> Orchards and plantations<br />\
    <img src="styles/legend/LandCover_1_7.png" /> Sugarcane<br />\
    <img src="styles/legend/LandCover_1_8.png" /> Steep slope agriculture<br />\
    <img src="styles/legend/LandCover_1_9.png" /> Dense natural vegetation<br />\
    <img src="styles/legend/LandCover_1_10.png" /> Sparse natural vegetation<br />\
    <img src="styles/legend/LandCover_1_11.png" /> Water bodies<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/LandCover_1.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [11818415.603607, 1602045.801241, 11977620.756225, 1723516.748265]
        })
    });
var lyr_CassavaSuitability_2 = new ol.layer.Image({
        opacity: 1,
        
    title: 'Cassava Suitability<br />\
    <img src="styles/legend/CassavaSuitability_2_0.png" /> Low<br />\
    <img src="styles/legend/CassavaSuitability_2_1.png" /> Medium<br />\
    <img src="styles/legend/CassavaSuitability_2_2.png" /> High<br />\
    <img src="styles/legend/CassavaSuitability_2_3.png" /> Very High<br />' ,
        
        
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
    <img src="styles/legend/MaizeSuitability_3_0.png" /> Low<br />\
    <img src="styles/legend/MaizeSuitability_3_1.png" /> Medium<br />\
    <img src="styles/legend/MaizeSuitability_3_2.png" /> High<br />\
    <img src="styles/legend/MaizeSuitability_3_3.png" /> Very High<br />' ,
        
        
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
    <img src="styles/legend/RiceSuitability_4_0.png" /> Low <br />\
    <img src="styles/legend/RiceSuitability_4_1.png" /> Medium <br />\
    <img src="styles/legend/RiceSuitability_4_2.png" /> High<br />\
    <img src="styles/legend/RiceSuitability_4_3.png" /> Very High<br />' ,
        
        
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
var format_Country_7 = new ol.format.GeoJSON();
var features_Country_7 = format_Country_7.readFeatures(json_Country_7, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Country_7 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Country_7.addFeatures(features_Country_7);
var lyr_Country_7 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Country_7, 
                style: style_Country_7,
                popuplayertitle: 'Country',
                interactive: true,
                title: '<img src="styles/legend/Country_7.png" /> Country'
            });
var format_Province_8 = new ol.format.GeoJSON();
var features_Province_8 = format_Province_8.readFeatures(json_Province_8, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Province_8 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Province_8.addFeatures(features_Province_8);
var lyr_Province_8 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Province_8, 
                style: style_Province_8,
                popuplayertitle: 'Province',
                interactive: true,
                title: '<img src="styles/legend/Province_8.png" /> Province'
            });
var format_District_9 = new ol.format.GeoJSON();
var features_District_9 = format_District_9.readFeatures(json_District_9, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_District_9 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_District_9.addFeatures(features_District_9);
var lyr_District_9 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_District_9, 
                style: style_District_9,
                popuplayertitle: 'District',
                interactive: true,
                title: '<img src="styles/legend/District_9.png" /> District'
            });
var group_AdminBoundary = new ol.layer.Group({
                                layers: [lyr_Country_7,lyr_Province_8,lyr_District_9,],
                                fold: 'open',
                                title: 'Admin Boundary'});
var group_SoilData = new ol.layer.Group({
                                layers: [lyr_SoilWRB_5,lyr_SoilProfiles_6,],
                                fold: 'close',
                                title: 'Soil Data'});
var group_CropSuitability = new ol.layer.Group({
                                layers: [lyr_CassavaSuitability_2,lyr_MaizeSuitability_3,lyr_RiceSuitability_4,],
                                fold: 'close',
                                title: 'Crop Suitability '});
var group_LandCover = new ol.layer.Group({
                                layers: [lyr_LandCover_1,],
                                fold: 'close',
                                title: 'Land Cover'});

lyr_OpenStreetMap_0.setVisible(true);lyr_LandCover_1.setVisible(true);lyr_CassavaSuitability_2.setVisible(true);lyr_MaizeSuitability_3.setVisible(true);lyr_RiceSuitability_4.setVisible(true);lyr_SoilWRB_5.setVisible(true);lyr_SoilProfiles_6.setVisible(true);lyr_Country_7.setVisible(true);lyr_Province_8.setVisible(true);lyr_District_9.setVisible(true);
var layersList = [lyr_OpenStreetMap_0,group_LandCover,group_CropSuitability,group_SoilData,group_AdminBoundary];
lyr_SoilWRB_5.set('fieldAliases', {'PROFILEAG': 'PROFILEAG', 'MAPID': 'MAPID', 'EX': 'EX', 'NY': 'NY', 'WRB2014_SY': 'WRB2014_SY', 'WRB2014_FU': 'WRB2014_FU', 'WRB2014_UN': 'WRB2014_UN', 'WRB2014_SU': 'WRB2014_SU', 'WRB2014_RS': 'WRB2014_RS', 'PREFIX': 'PREFIX', 'SUFFIX': 'SUFFIX', 'DISTRICT': 'DISTRICT', 'PROVINCE': 'PROVINCE', 'DESCRIBE': 'DESCRIBE', 'OLDUNIT': 'OLDUNIT', 'DEPTH': 'DEPTH', 'THICKNESS': 'THICKNESS', 'pHH2O': 'pHH2O', 'pHKCl': 'pHKCl', 'EC': 'EC', 'ESP': 'ESP', 'OC': 'OC', 'OM': 'OM', 'N_total': 'N_total', 'P_avai': 'P_avai', 'K_avai': 'K_avai', 'Al___': 'Al___', 'Hh': 'Hh', 'Ca__': 'Ca__', 'Mg__': 'Mg__', 'K_': 'K_', 'Na_': 'Na_', 'CEC_T': 'CEC_T', 'CEC_T_clay': 'CEC_T_clay', 'BS': 'BS', 'Sand': 'Sand', 'Silt': 'Silt', 'Clay': 'Clay', 'TEXTURE': 'TEXTURE', 'DRAINAGE': 'DRAINAGE', 'ELEVATION': 'ELEVATION', 'SLOPE': 'SLOPE', 'area_ha': 'area_ha', 'pH_class': 'pH_class', 'K_avai_cla': 'K_avai_cla', 'P_avai_cla': 'P_avai_cla', 'N_total_cl': 'N_total_cl', 'OM_class': 'OM_class', 'MAP_IDNEW': 'MAP_IDNEW', });
lyr_SoilProfiles_6.set('fieldAliases', {'MAPID': 'MAPID', 'PROFILEAG': 'PROFILEAG', 'EX': 'EX', 'NY': 'NY', 'SYMBOL': 'SYMBOL', 'WRB2014_FU': 'WRB2014_FU', 'UNIT': 'UNIT', 'SUBUNIT': 'SUBUNIT', 'DISTRICT': 'DISTRICT', 'PROVINCE': 'PROVINCE', 'DESCRIBE': 'DESCRIBE', 'OLDUNIT': 'OLDUNIT', 'DEPTH': 'DEPTH', 'THICKNESS': 'THICKNESS', 'pHH2O': 'pHH2O', 'pHKCL': 'pHKCL', 'EC': 'EC', 'ESP': 'ESP', 'OC': 'OC', 'OM': 'OM', 'N_total': 'N_total', 'P_avai': 'P_avai', 'K_avai': 'K_avai', 'Al': 'Al', 'Hh': 'Hh', 'Ca': 'Ca', 'Mg': 'Mg', 'K': 'K', 'Na': 'Na', 'CEC_T': 'CEC_T', 'CEC_T_clay': 'CEC_T_clay', 'BS': 'BS', 'Sand': 'Sand', 'Silt': 'Silt', 'Clay': 'Clay', 'TEXTURE': 'TEXTURE', 'DRAINAGE': 'DRAINAGE', 'ELEVATION': 'ELEVATION', 'SLOPE': 'SLOPE', });
lyr_Country_7.set('fieldAliases', {'Shape_Leng': 'Shape_Leng', 'Shape_Area': 'Shape_Area', 'ADM0_EN': 'ADM0_EN', 'ADM0_LO': 'ADM0_LO', 'ADM0_PCODE': 'ADM0_PCODE', 'ADM0_REF': 'ADM0_REF', 'ADM0ALT1EN': 'ADM0ALT1EN', 'ADM0ALT2EN': 'ADM0ALT2EN', 'ADM0ALT1LO': 'ADM0ALT1LO', 'ADM0ALT2LO': 'ADM0ALT2LO', 'date': 'date', 'validOn': 'validOn', 'validTo': 'validTo', });
lyr_Province_8.set('fieldAliases', {'Shape_Leng': 'Shape_Leng', 'Shape_Area': 'Shape_Area', 'ADM1_EN': 'ADM1_EN', 'ADM1_LO': 'ADM1_LO', 'ADM1_PCODE': 'ADM1_PCODE', 'ADM1_REF': 'ADM1_REF', 'ADM1ALT1EN': 'ADM1ALT1EN', 'ADM1ALT2EN': 'ADM1ALT2EN', 'ADM1ALT1LO': 'ADM1ALT1LO', 'ADM1ALT2LO': 'ADM1ALT2LO', 'ADM0_EN': 'ADM0_EN', 'ADM0_LO': 'ADM0_LO', 'ADM0_PCODE': 'ADM0_PCODE', 'date': 'date', 'validOn': 'validOn', 'validTo': 'validTo', });
lyr_District_9.set('fieldAliases', {'Shape_Leng': 'Shape_Leng', 'Shape_Area': 'Shape_Area', 'ADM2_EN': 'ADM2_EN', 'ADM2_LO': 'ADM2_LO', 'ADM2_PCODE': 'ADM2_PCODE', 'ADM2_REF': 'ADM2_REF', 'ADM2ALT1EN': 'ADM2ALT1EN', 'ADM2ALT2EN': 'ADM2ALT2EN', 'ADM2ALT1LO': 'ADM2ALT1LO', 'ADM2ALT2LO': 'ADM2ALT2LO', 'ADM1_EN': 'ADM1_EN', 'ADM1_LO': 'ADM1_LO', 'ADM1_PCODE': 'ADM1_PCODE', 'ADM0_EN': 'ADM0_EN', 'ADM0_LO': 'ADM0_LO', 'ADM0_PCODE': 'ADM0_PCODE', 'date': 'date', 'validOn': 'validOn', 'validTo': 'validTo', });
lyr_SoilWRB_5.set('fieldImages', {'PROFILEAG': 'TextEdit', 'MAPID': 'TextEdit', 'EX': 'TextEdit', 'NY': 'TextEdit', 'WRB2014_SY': 'TextEdit', 'WRB2014_FU': 'TextEdit', 'WRB2014_UN': 'TextEdit', 'WRB2014_SU': 'TextEdit', 'WRB2014_RS': 'TextEdit', 'PREFIX': 'TextEdit', 'SUFFIX': 'TextEdit', 'DISTRICT': 'TextEdit', 'PROVINCE': 'TextEdit', 'DESCRIBE': 'TextEdit', 'OLDUNIT': 'TextEdit', 'DEPTH': 'TextEdit', 'THICKNESS': 'TextEdit', 'pHH2O': 'TextEdit', 'pHKCl': 'TextEdit', 'EC': 'TextEdit', 'ESP': 'TextEdit', 'OC': 'TextEdit', 'OM': 'TextEdit', 'N_total': 'TextEdit', 'P_avai': 'TextEdit', 'K_avai': 'TextEdit', 'Al___': 'TextEdit', 'Hh': 'TextEdit', 'Ca__': 'TextEdit', 'Mg__': 'TextEdit', 'K_': 'TextEdit', 'Na_': 'TextEdit', 'CEC_T': 'TextEdit', 'CEC_T_clay': 'TextEdit', 'BS': 'TextEdit', 'Sand': 'TextEdit', 'Silt': 'TextEdit', 'Clay': 'TextEdit', 'TEXTURE': 'TextEdit', 'DRAINAGE': 'TextEdit', 'ELEVATION': 'TextEdit', 'SLOPE': 'TextEdit', 'area_ha': 'TextEdit', 'pH_class': 'Range', 'K_avai_cla': 'Range', 'P_avai_cla': 'Range', 'N_total_cl': 'Range', 'OM_class': 'Range', 'MAP_IDNEW': 'TextEdit', });
lyr_SoilProfiles_6.set('fieldImages', {'MAPID': 'TextEdit', 'PROFILEAG': 'TextEdit', 'EX': 'TextEdit', 'NY': 'TextEdit', 'SYMBOL': 'TextEdit', 'WRB2014_FU': 'TextEdit', 'UNIT': 'TextEdit', 'SUBUNIT': 'TextEdit', 'DISTRICT': 'TextEdit', 'PROVINCE': 'TextEdit', 'DESCRIBE': 'TextEdit', 'OLDUNIT': 'TextEdit', 'DEPTH': 'TextEdit', 'THICKNESS': 'TextEdit', 'pHH2O': 'TextEdit', 'pHKCL': 'TextEdit', 'EC': 'TextEdit', 'ESP': 'TextEdit', 'OC': 'TextEdit', 'OM': 'TextEdit', 'N_total': 'TextEdit', 'P_avai': 'TextEdit', 'K_avai': 'TextEdit', 'Al': 'TextEdit', 'Hh': 'TextEdit', 'Ca': 'TextEdit', 'Mg': 'TextEdit', 'K': 'TextEdit', 'Na': 'TextEdit', 'CEC_T': 'TextEdit', 'CEC_T_clay': 'TextEdit', 'BS': 'TextEdit', 'Sand': 'TextEdit', 'Silt': 'TextEdit', 'Clay': 'TextEdit', 'TEXTURE': 'TextEdit', 'DRAINAGE': 'TextEdit', 'ELEVATION': 'TextEdit', 'SLOPE': 'TextEdit', });
lyr_Country_7.set('fieldImages', {'Shape_Leng': 'TextEdit', 'Shape_Area': 'TextEdit', 'ADM0_EN': 'TextEdit', 'ADM0_LO': 'TextEdit', 'ADM0_PCODE': 'TextEdit', 'ADM0_REF': 'TextEdit', 'ADM0ALT1EN': 'TextEdit', 'ADM0ALT2EN': 'TextEdit', 'ADM0ALT1LO': 'TextEdit', 'ADM0ALT2LO': 'TextEdit', 'date': 'DateTime', 'validOn': 'DateTime', 'validTo': 'DateTime', });
lyr_Province_8.set('fieldImages', {'Shape_Leng': 'TextEdit', 'Shape_Area': 'TextEdit', 'ADM1_EN': 'TextEdit', 'ADM1_LO': 'TextEdit', 'ADM1_PCODE': 'TextEdit', 'ADM1_REF': 'TextEdit', 'ADM1ALT1EN': 'TextEdit', 'ADM1ALT2EN': 'TextEdit', 'ADM1ALT1LO': 'TextEdit', 'ADM1ALT2LO': 'TextEdit', 'ADM0_EN': 'TextEdit', 'ADM0_LO': 'TextEdit', 'ADM0_PCODE': 'TextEdit', 'date': 'DateTime', 'validOn': 'DateTime', 'validTo': 'DateTime', });
lyr_District_9.set('fieldImages', {'Shape_Leng': 'TextEdit', 'Shape_Area': 'TextEdit', 'ADM2_EN': 'TextEdit', 'ADM2_LO': 'TextEdit', 'ADM2_PCODE': 'TextEdit', 'ADM2_REF': 'TextEdit', 'ADM2ALT1EN': 'TextEdit', 'ADM2ALT2EN': 'TextEdit', 'ADM2ALT1LO': 'TextEdit', 'ADM2ALT2LO': 'TextEdit', 'ADM1_EN': 'TextEdit', 'ADM1_LO': 'TextEdit', 'ADM1_PCODE': 'TextEdit', 'ADM0_EN': 'TextEdit', 'ADM0_LO': 'TextEdit', 'ADM0_PCODE': 'TextEdit', 'date': 'DateTime', 'validOn': 'DateTime', 'validTo': 'DateTime', });
lyr_SoilWRB_5.set('fieldLabels', {'PROFILEAG': 'hidden field', 'MAPID': 'hidden field', 'EX': 'hidden field', 'NY': 'hidden field', 'WRB2014_SY': 'inline label - visible with data', 'WRB2014_FU': 'inline label - visible with data', 'WRB2014_UN': 'inline label - visible with data', 'WRB2014_SU': 'inline label - visible with data', 'WRB2014_RS': 'inline label - always visible', 'PREFIX': 'inline label - always visible', 'SUFFIX': 'inline label - always visible', 'DISTRICT': 'inline label - always visible', 'PROVINCE': 'inline label - always visible', 'DESCRIBE': 'inline label - always visible', 'OLDUNIT': 'inline label - always visible', 'DEPTH': 'inline label - always visible', 'THICKNESS': 'inline label - always visible', 'pHH2O': 'inline label - always visible', 'pHKCl': 'inline label - always visible', 'EC': 'inline label - always visible', 'ESP': 'inline label - always visible', 'OC': 'inline label - always visible', 'OM': 'inline label - always visible', 'N_total': 'inline label - always visible', 'P_avai': 'inline label - always visible', 'K_avai': 'inline label - always visible', 'Al___': 'inline label - always visible', 'Hh': 'inline label - always visible', 'Ca__': 'inline label - always visible', 'Mg__': 'inline label - always visible', 'K_': 'inline label - always visible', 'Na_': 'inline label - always visible', 'CEC_T': 'inline label - always visible', 'CEC_T_clay': 'inline label - always visible', 'BS': 'inline label - always visible', 'Sand': 'inline label - always visible', 'Silt': 'inline label - always visible', 'Clay': 'inline label - always visible', 'TEXTURE': 'inline label - always visible', 'DRAINAGE': 'inline label - always visible', 'ELEVATION': 'inline label - always visible', 'SLOPE': 'inline label - always visible', 'area_ha': 'inline label - always visible', 'pH_class': 'inline label - always visible', 'K_avai_cla': 'inline label - always visible', 'P_avai_cla': 'inline label - always visible', 'N_total_cl': 'inline label - always visible', 'OM_class': 'inline label - always visible', 'MAP_IDNEW': 'inline label - always visible', });
lyr_SoilProfiles_6.set('fieldLabels', {'MAPID': 'hidden field', 'PROFILEAG': 'hidden field', 'EX': 'hidden field', 'NY': 'hidden field', 'SYMBOL': 'hidden field', 'WRB2014_FU': 'inline label - visible with data', 'UNIT': 'inline label - visible with data', 'SUBUNIT': 'inline label - visible with data', 'DISTRICT': 'inline label - visible with data', 'PROVINCE': 'inline label - visible with data', 'DESCRIBE': 'inline label - visible with data', 'OLDUNIT': 'inline label - visible with data', 'DEPTH': 'inline label - visible with data', 'THICKNESS': 'inline label - visible with data', 'pHH2O': 'inline label - visible with data', 'pHKCL': 'inline label - visible with data', 'EC': 'inline label - visible with data', 'ESP': 'inline label - visible with data', 'OC': 'inline label - visible with data', 'OM': 'inline label - visible with data', 'N_total': 'inline label - visible with data', 'P_avai': 'inline label - visible with data', 'K_avai': 'inline label - visible with data', 'Al': 'inline label - visible with data', 'Hh': 'inline label - visible with data', 'Ca': 'inline label - visible with data', 'Mg': 'inline label - visible with data', 'K': 'inline label - visible with data', 'Na': 'inline label - visible with data', 'CEC_T': 'inline label - visible with data', 'CEC_T_clay': 'inline label - visible with data', 'BS': 'inline label - visible with data', 'Sand': 'inline label - visible with data', 'Silt': 'inline label - visible with data', 'Clay': 'inline label - visible with data', 'TEXTURE': 'inline label - visible with data', 'DRAINAGE': 'inline label - visible with data', 'ELEVATION': 'inline label - visible with data', 'SLOPE': 'inline label - visible with data', });
lyr_Country_7.set('fieldLabels', {'Shape_Leng': 'hidden field', 'Shape_Area': 'hidden field', 'ADM0_EN': 'inline label - visible with data', 'ADM0_LO': 'hidden field', 'ADM0_PCODE': 'hidden field', 'ADM0_REF': 'hidden field', 'ADM0ALT1EN': 'hidden field', 'ADM0ALT2EN': 'hidden field', 'ADM0ALT1LO': 'hidden field', 'ADM0ALT2LO': 'hidden field', 'date': 'hidden field', 'validOn': 'hidden field', 'validTo': 'hidden field', });
lyr_Province_8.set('fieldLabels', {'Shape_Leng': 'hidden field', 'Shape_Area': 'hidden field', 'ADM1_EN': 'inline label - visible with data', 'ADM1_LO': 'hidden field', 'ADM1_PCODE': 'hidden field', 'ADM1_REF': 'hidden field', 'ADM1ALT1EN': 'hidden field', 'ADM1ALT2EN': 'hidden field', 'ADM1ALT1LO': 'hidden field', 'ADM1ALT2LO': 'hidden field', 'ADM0_EN': 'hidden field', 'ADM0_LO': 'hidden field', 'ADM0_PCODE': 'hidden field', 'date': 'hidden field', 'validOn': 'hidden field', 'validTo': 'hidden field', });
lyr_District_9.set('fieldLabels', {'Shape_Leng': 'hidden field', 'Shape_Area': 'hidden field', 'ADM2_EN': 'inline label - visible with data', 'ADM2_LO': 'hidden field', 'ADM2_PCODE': 'hidden field', 'ADM2_REF': 'hidden field', 'ADM2ALT1EN': 'hidden field', 'ADM2ALT2EN': 'hidden field', 'ADM2ALT1LO': 'hidden field', 'ADM2ALT2LO': 'hidden field', 'ADM1_EN': 'hidden field', 'ADM1_LO': 'hidden field', 'ADM1_PCODE': 'hidden field', 'ADM0_EN': 'hidden field', 'ADM0_LO': 'hidden field', 'ADM0_PCODE': 'hidden field', 'date': 'hidden field', 'validOn': 'hidden field', 'validTo': 'hidden field', });
lyr_District_9.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});