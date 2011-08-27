var App = SC.Application.create();

App.featureController = SC.Object.create({
  // attributes of our point
  content: SC.Object.create({
		name: "toto",
        age: 20,
        favColor: 'red',
        align: "cm"
  }),
  
  // coordinates
  geometry: SC.mixin(
  	new OpenLayers.Geometry.Point(-111.04, 45.68),
  	SC.Observable
  )
});
