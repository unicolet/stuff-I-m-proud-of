/*
	Create your palette pane with the following code:

	SC.PalettePane.create(XT.ClosableMixin, {
                    classNames: ["mixin-closable"],

	then add this mixin (change XT with your project name if you want),
	the css and the image in your project and you're set.

	It does not seem to work with panel panes, maybe because they grab the mouse
	events before they reache the mixin.

	Licensed under MIT License (Same as Sproutcore).
	Author: umberto.nicoletti@gmail.com (2011)
*/

XT.ClosableMixin = {
    /*
    *  This mixin expects the top right edge to hold a close-like icon
    *  like the closable-mixin class does.
    */
    mouseUp: function(evt) {
        if (evt.srcElement)
            if(evt.srcElement.className.indexOf("top-right-edge")!=-1) {
                this.remove();
                return YES;
            }
    },

    touchEnd: function(touch) {
        if (touch.event) this.mouseUp(touch.event);
    }
}
