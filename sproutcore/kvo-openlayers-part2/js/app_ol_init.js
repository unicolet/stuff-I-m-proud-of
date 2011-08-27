//
// Demo Openlayers and Sproutcore KVO interop 
//
// 2011 umberto.nicoletti at gmail.com
//


// made these global variables only to ease debugging
// remove them in production
var map;
var pointFeature;
var vectorLayer;

// update function
OpenLayers.Feature.Vector.prototype._sc_update=function() { if(this.layer) this.layer.redraw(); };

function OLinit(){
    map = new OpenLayers.Map('map');
    
    var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS", 
            "http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'} );
    map.addLayer(layer);
    
    // allow testing of specific renderers via "?renderer=Canvas", etc
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    
    vectorLayer = new OpenLayers.Layer.Vector("Simple Geometry", {
        styleMap: new OpenLayers.StyleMap({'default':{
            strokeColor: "#00FF00",
            strokeOpacity: 1,
            strokeWidth: 3,
            fillColor: "#FF5500",
            fillOpacity: 0.5,
            pointRadius: 6,
            pointerEvents: "visiblePainted",
            // label with \n linebreaks
            label : "name: ${name}\n\nage: ${age}",
            
            fontColor: "${favColor}",
            fontSize: "12px",
            fontFamily: "Courier New, monospace",
            fontWeight: "bold",
            labelAlign: "${align}",
            labelXOffset: "${xOffset}",
            labelYOffset: "${yOffset}"
        }}),
        renderers: renderer
    });
    
    // create a point feature
    var point = App.featureController.geometry;
    
    pointFeature = SC.mixin(new OpenLayers.Feature.Vector(point), SC.Observable);

	// KVO instrumentation
    pointFeature.attributes = App.featureController.content;
    SC.keys(pointFeature.attributes).forEach(function(k){
    	if(!k.startsWith("_")) { // _ properties are usually internals, so we avoid observing them
    		pointFeature.addObserver("attributes."+k, pointFeature, '_sc_update');
    	}
    });
    pointFeature.addObserver("geometry.x", pointFeature, '_sc_update');
    pointFeature.addObserver("geometry.y", pointFeature, '_sc_update');
    
    map.addLayer(vectorLayer);
    map.setCenter(new OpenLayers.LonLat(-109.370078125, 43.39484375), 4);
    vectorLayer.addFeatures([pointFeature]);
};

$(document).ready(function(){
	OLinit();
});
