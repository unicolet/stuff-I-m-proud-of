// ==========================================================================
// Project:   Agenda
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Agenda */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Agenda.main = function main() {

    // Step 1: Instantiate Your Views
    // The default code here will make the mainPane for your application visible
    // on screen.  If you app gets any level of complexity, you will probably
    // create multiple pages and panes.
    Agenda.getPath('mainPage.mainPane').append();

    // Step 2. Set the content property on your primary controller.
    // This will make your app come alive!

    // TODO: Set the content property on your primary controller
    // ex: Agenda.contactsController.set('content',Agenda.contacts);
    Agenda.agendaController.set("shifts", [
        { wkr:"McGee", begin:480, end: 720,
            rooms:[
                {roomname:"MTAC",id_room_shift:1},
                {roomname:"ROOM3",id_room_shift:2}
            ]
        }
    ]);

    Agenda.agendaController.set("appointments",
        {"ROOM3":
                [
                    {person:"Gibbs", begin:480, length:35,
                        activities: [
                            {name:"Call VP", activity_id:3, length:15},
                            {name:"Call Hetty",activity_id:19,length:20}
                        ]}
                ]
        ,"MTAC":
                [
                    {person:"Vance",begin:610,length:20,
                        activities: [
                            {name:"Call Kort",activity_id:1,length:20}
                        ]
                    }
                ]
        });
};

function main() {
    Agenda.main();
}
