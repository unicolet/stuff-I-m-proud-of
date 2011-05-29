// ==========================================================================
// Project:   Agenda.agendaController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Agenda */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
Agenda.agendaController = SC.ObjectController.create(
/** @scope Agenda.agendaController.prototype */ {

    appointments: null,
    shifts: null,
    zoom: null,

    appointmentOnClick: function(e) {
        console.log(e);
    }

});
