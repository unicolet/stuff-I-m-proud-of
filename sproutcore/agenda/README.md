XC.AgendaView
=============

AgendaView is a component for SC that displays activities
on a grid like an agenda. Activities are grouped by room
and by worker assigned to that room.

Only tested on WebKit-based browsers and Sproutcore 1.4.5, 1.6.

## Installing

Skip this step if using SC 1.6 : add jquery-1.5.js to your app resources.
jquery and SC >= 1.6 do not play well together: https://groups.google.com/forum/#!topic/sproutcore/6pkZ-IOg55g

Copy all the files (1 css and 2 js) in your application directory.

Edit agenda.js and change the view name from XC.AgendaView
to YOURAPPNAME.AgendaView .

Use the agenda view as in the following example (inside a ScrollView):

	myView: SC.ScrollView.design({
                layout: {bottom:0, top:0, left:0, right:0},
                autohidesVerticalScroller: NO,
                contentView: XC.Agenda.design({
                    layout: {top:0, left:0, right:0, height: 2500},
                    shiftsBinding: "XC.someController.turni",
                    appointmentsBinding: "XC.someController.appuntamenti",
                    zoomBinding: "XC.someController.zoom",
                    emptyText: "Nothing to show...",
                    appointmentOnClick: "App.Controller.appointmentOnClick(this)"
                })
            })

It is interesting to note the use of the zoomBindig: it is a trick by which the view
can be zoomed in or out to fit into the windows height or to its maximum height (as set
in the layout).

## Shifts and Appointments Data

In the current implementation shifts and appointments are json data as returned
by your backend (they need not be models as usually done in SC apps) and that's
part of the beauty on SC.

For how this json data must be structured consult the source file agenda.js or
even better the demo app, file apps/agenda/main.js.

## Demo app

In the demo directory.
