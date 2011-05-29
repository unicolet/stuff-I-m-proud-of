// ==========================================================================
// Project:   Agenda - mainPage
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Agenda */

// This page describes the main user interface for your application.  
Agenda.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    childViews: 'agenda'.w(),
    
    agenda: SC.ScrollView.design({
                layout: {bottom:0, top:0, left:0, right:0},
                autohidesVerticalScroller: NO,
                contentView: Agenda.AgendaView.design({
                    layout: {top:0, left:0, right:0, height: 2500},
                    shiftsBinding: "Agenda.agendaController.shifts",
                    appointmentsBinding: "Agenda.agendaController.appointments",
                    //zoomBinding: "Agenda.agendaController.zoom",
                    emptyText: "Nothing to show...",
                    appointmentOnClick: "Agenda.agendaController.appointmentOnClick(this)"
                })
            })
  })

});
