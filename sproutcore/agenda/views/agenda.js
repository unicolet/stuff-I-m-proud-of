// ==========================================================================
// Project:   XC.AgendaView
// Copyright: ©2011 Umberto Nicoletti umberto.nicoletti@gmail.com
// Licensed under the MIT License
// ==========================================================================

/** @class

      This view renders a set of appointments over a schedule comprised of a set of spaces (rooms, box, etc) and work intervals (start time/end time).
      The data needed to render the agenda must be bound to the variables appointments and shifts as in this example:

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

      Shifts and appointments data *must* be json data with the following structure (replace the k_* hash keys with
      your own values and define them as constants in agenda_constants.js):

      shifts: [
                    { k_workername:"McGee", k_beginTIme:480, k_endTime: 720,
                        k_rooms:[
                             {k_roomname:"MTAC",k_room_shift_id:1}
                             {k_roomname:"ROOM3",k_room_shift_id:2}
                        ]
                    }
                    ...
       ]

      which means George is working from 480 (8.00 AM) until 720 (12.00PM) in rooms ROOM3 and MTAC
      k_room_shift_id is the id of the association between a room and George's shift.

      appointments: [ {"ROOM3":
                                [{k_customername:"Gibbs", k_begin:480, k_length:35,
                                    k_activities: [{k_activityname:"Call Daddy", k_activityid:3, k_length:15},
                                                       {k_activityname:"Call Hetty",k_activityid:19,k_length:20}
                                    ]}
                                ],
                            },
                      {"MTAC":
                                [{k_customername:"Vance",k_begin:610,k_length:20,
                                    k_activities: [{k_activityname:"Call Kort",k_activityid:1,k_length:20}]
                                }]
                            } ];

      emptyText: is the text to show when there is no data about shifts

      zoom: is usually bound to a slider value to provide zoom functionality like most Apple apps (iphoto, ecc)

      appointmentOnClick: the name (just the name, not a reference to the function itself) of the function that will be bound by the view to each appointment html element.
                                     in the example above *this* is the html element that was clicked on by the user

 @extends SC.View
 */

XC.AgendaView = SC.View.extend(
    /** @scope XC.AgendaView.prototype */ {

    shifts: null,
    appointments: null,
    zoom: null,
    calculatedHeight: 0,
    appointmentOnClick: null,
   /*
     * The default text to render when there are no shifts
     */
    emptyText:"Nothing to show",

    displayProperties: ["shifts","appointments", "zoom", "emptyText"],

    render: function(context, firstTime) {
        context = this.renderRooms(context);
        context = this.renderTimeLine(context);
    },

    renderRooms: function(context) {
        if (!this.get("shifts") || this.get("shifts").length==0) {
            context = context.push("<h1 style=\"margin:2em;\">"+this.get("emptyText")+"</h1>");
        } else {
            if (this.get("zoom")) {
                var layout = this.get("layout");
                layout.height=this.get("zoom");
                this.set("layout",layout);
                this.set("calculatedHeight", this.get("zoom"));
            }
            var height = this.get("layout").height;
            var width = $(this.layer()).width() - 20; // timeline is 20px wide
            //console.log("Height "+height);
            context = context.begin().id("shiftscontainer").styles({"height":height});

            var shifts = this.get("shifts");
            var appointments = this.get("appointments");

            var rooms = this.findUniqueRoomNames(shifts);
            var roomWidth = (Math.floor(width / rooms.length));
            //console.log("room width " + roomWidth);

            for (var i = 0; i < rooms.length; i++) {
                context = context.begin().classNames(['rooms']).styles({'left':(i * roomWidth), 'width': roomWidth + "px"});
                context = context.begin().push("<div class=\"name\">" + rooms[i] + "</div>").end();

                this.renderShifts(context, rooms[i], roomWidth);
                this.renderAppointments(context, rooms[i], roomWidth);
                context = context.end();
            }
            // chiude turnicontainer
            context = context.end();
        }
        return context;
    },

    renderShifts: function(context, spazio, w) {
        var shifts = this.get("shifts");
        for (var i = 0; i < shifts.length; i++) {
            var shift = shifts[i];
            for (var j = 0; j < shift[k_rooms].length; j++) {
                if (spazio == shift[k_rooms][j][k_roomname]) {
                    var thePosition=this.computeShiftPosition(shift, w - 4);
                    context = context.begin()
                            .id("st"+shift[k_rooms][j][k_room_shift_id])
                            .classNames(["workername"])
                            .styles(thePosition);
                    context = context.begin().push("<div class=\"name\">" + shifts[i][k_workername] + "</div>").end();
                    context = context.end();
                }
            }
        }
        return context;
    },

    computeShiftPosition: function(shift, w) {
        var styles = {top:0,height:0,width:w};
        var tmpStyle=this.computePosition(shift[k_begin], 0, false);
        if (tmpStyle) {
            styles['top'] = tmpStyle['top'] - 30;
        } else {
            console.log("Can't compute position : "+shift[k_begin]+" - "+shift[K_end]);
            return null;
        }
        tmpStyle=this.computePosition(shift[K_end], 0, false);
        if (tmpStyle) {
            styles['height'] = tmpStyle['top'] - styles['top'];
        } else {
            console.log("Can't compute shift: "+shift[k_begin]+" - "+shift[K_end]+" height");
            return null;
        }

        return styles;
    },

    findUniqueRoomNames: function(t) {
        var ns = new Array();
        for (var i = 0; i < t.length; i++) {
            if (t[i][k_rooms]) {
                for (var s = 0; s < t[i][k_rooms].length; s++) {
                    if (ns.indexOf(t[i][k_rooms][s][k_roomname]) == -1) {
                        ns[ns.length] = t[i][k_rooms][s][k_roomname];
                    }
                }
            }
        }
        return ns;
    },

    renderTimeLine: function(context) {
        // render tl only if there are shifts
        if (this.get("shifts")) {
            context = context.begin().classNames(["timeline"]);
            if (this.get("layout").height) {
                // render time line (NB: each marker is 11 px high)
                // so to put it at, say, 60 the top position must be 49
                for (var i = 0; i <= (endTime - beginTime); i++) {
                    var ora = (beginTime + i);
                    var pos = this.computePosition(ora * 60, 11, true);
                    if (pos) {
                        //console.log("Time marker " + i + ", ora=" + ora + " top: " + pos['top']);
                        context.push("<div class=\"" + pos['cssClass'] + "\" style=\"top:" + pos['top'] + "px;left:0;width:100%;\">" + ora + ".</div>")
                    }
                }
            }
            context = context.end();
        }
        return context;
    },

    // time is in minutes from midnight (480 is 8.00AM, 0 is midnight and so on)
    computePosition: function(istante, itemHeight, isTimeLine) {
        var position = {cssClass:"hour", top:0};
        var lunchBreakLength = lunchBreakEnd - lunchBreakStart;
        var startingOffset = 60 - itemHeight;
        var tlHeight = this.get("layout").height - startingOffset - 50; // usable height, 50 is a safety boundary
        var hourHeight = Math.floor(tlHeight / ( (endTime - beginTime) - lunchBreakLength));

        var hour = istante / 60;
        var top = startingOffset + (hour - beginTime) * (hourHeight);
        if (hour > lunchBreakStart && hour < lunchBreakEnd) {
            return null;
        } else {
            if (hour == lunchBreakEnd) {
                top = 30 + startingOffset + ((hour - beginTime) - lunchBreakLength) * (hourHeight);
                position['cssClass'] = "lunchBreakEnd";
            } else if (hour >= lunchBreakEnd) {
                // i 30 agg. servono per permettere il rendering del nome dell'fkt
                top = 30 + startingOffset + ((hour - beginTime) - lunchBreakLength) * (hourHeight);
            }
        }
        if (isTimeLine) top = top - (hour - beginTime); // tieni conto del bordo di 1px della timeline!
        position['top'] = top;
        //console.log(istante + " -> posizione[top]=" + posizione['top']);
        return position;
    },

    renderAppointments: function(context, spazio, w) {
        var app = this.get("appointments");
        if (app && app[spazio]) {
            for (var i = 0; i < app[spazio].length; i++) {
                var appointment = app[spazio][i];
                var terapies = appointment[k_activities];
                var styles=this.computeAppointmentPosition(appointment, w - 16);
                context = context.begin().id(spazio+"-"+i).classNames(["appointment"]).styles(styles);
                context = context.attr("onclick",this.get("appointmentOnClick"));
                context = context.begin().push("<div class=\"customer\"><div class=\"customername\" style=\"width:"+(w-64)+"px;\">" +
                        appointment[k_customername] + "</div><div>" + this.instantToTime(appointment[k_begin])+ "</div></div>").end();
                var terapyStart=appointment['inizio'];
                for (var t=0; t<terapies.length; t++) {
                    var terapyHeight=Math.round((terapies[t][k_length]/appointment[k_length])*styles.height);
                    var text="<div style=\"height:"+terapyHeight+"px;\" class=\"activity activity"+terapies[t][k_activityid]+
                            "\">" + terapies[t][k_activityname] + " ("+terapies[t][k_length]+"\') </div>";
                    if (t>0) {
                        text="<div style=\"height:"+terapyHeight+"px;\" class=\"activity activity"+terapies[t][k_activityid]+
                                "\">" + terapies[t][k_activityname] + " ("+terapies[t][k_length]+"\' <span class=\"little\"> dalle "+
                                instantToTime(terapyStart)+"</span>) </div>";
                    }
                    context = context.begin().push(text).end();
                    // durata = length
                    terapyStart+=terapies[t]['durata'];
                }
                context = context.end();
            }
        }
        return context;
    },

    computeAppointmentPosition: function(app, w) {
        var styles = {top:0,height:0,width:w};
        styles['top'] = this.computePosition(app[k_begin], 0, false)['top'];
        styles['height'] = this.computePosition((app[k_begin]+app[k_length]), 0, false)['top'] - styles['top'];
        return styles;
    },

    computeInstantFromPosition: function(y) {
        var instant = 0;
        var lunchBreakLength = lunchBreakEnd - lunchBreakStart;
        var startingOffset = 60;
        var tlHeight = this.get("layout").height - startingOffset - 50; // usable height, 50 is a safety boundary
        var hourHeight = Math.floor(tlHeight / ( (endTime - beginTime) - lunchBreakLength));

        if ( y > (((lunchBreakEnd-lunchBreakLength-beginTime)*hourHeight)+startingOffset)) {
            // account for lunch break
            instant= ( lunchBreakLength * 60 ) + 420 + Math.round( ( ( y - startingOffset - 30 ) / hourHeight ) * 60);
        } else {
            instant= 420 + Math.round( ( ( y - startingOffset ) / hourHeight ) * 60);
        }
        return Math.round(instant/5)*5;
    },

    viewDidResize: function() {
        // handle a resize event
        this.set("layerNeedsUpdate", YES);
    },

    instantToTime: function(instant) {
        return instantToTime(instant);
    },

    mouseDown: function(evt) {
        // customize this to handle your own events
        // the following commented out code is only provided as an example
        console.log("Agenda::mouseDown "+evt);

        if (evt.srcElement && evt.srcElement.id.substr(0,2)=="st") {
            var id_spazioturno=evt.srcElement.id.substr(2);
            var toolBarHeight=36;
            var scrollerOffset=this.getPath("parentView.parentView.verticalScrollOffset");
            var positionY = scrollerOffset + evt.clientY - toolBarHeight;
            Figep.figepController.selectSpazioTurno(id_spazioturno);
            Figep.figepController.set("nuovoIstante", this.computeInstantFromPosition(positionY));
        }
    }
});

function instantToTime(instant) {
    var hour=Math.floor(instant/60);
    var minutes=(instant-hour*60);

    return hour+":"+this.pad(minutes,2);
};

function pad(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
};
