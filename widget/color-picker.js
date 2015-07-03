Editor.registerWidget( 'color-picker', {
    is: 'color-picker',

    properties: {
        color: {
            type: Object,
            value: function () {
                return new Fire.Color( 1.0, 1.0, 1.0, 1.0 );
            },
            notity: true,
        },

        value: {
            type: Object,
            value: function () {
                return [0,0,0,1];
            },
            observer: '_valueChanged'
        }
    },

    created: function () {
        this.dragMove = false;
    },

    ready: function () {
        this.setColor(this.color);
    },

    toInt: function(value) {
        return value * 255 | 0;
    },

    _valueChanged: function () {
        this.fire('color-changed');
    },

    setColor: function ( value ) {
        this.color = value;
        this.hsv = this.color.toHSV();
        this._notifyColor();
        this._repaint();
    },

    _repaint: function () {
        var cssRGB = Fire.hsv2rgb( this.hsv.h, 1, 1 );
        cssRGB = "rgb("+ (cssRGB.r * 255|0) + "," + (cssRGB.g * 255 | 0) + "," + (cssRGB.b * 255 | 0) + ")";
        this.$.colorCtrl.style.backgroundColor = cssRGB;
        this.$.opacityCtrl.style.backgroundColor = cssRGB;
        this.$.opacityHandle.style.top = (1.0-this.color.a)*100 + "%";
        this.$.hueHandle.style.top = (1.0-this.hsv.h)*100 + "%";
        this.$.colorHandle.style.left = this.hsv.s*100 + "%";
        this.$.colorHandle.style.top = (1.0-this.hsv.v)*100 + "%";
    },

    _hueCtrlMouseDownAction: function ( event ) {
        EditorUI.addDragGhost("crosshair");

        var rect = this.$.hueCtrl.getBoundingClientRect();
        var mouseDownY = rect.top;
        this.dragMove = true;

        var updateMouseMove = function (event) {
            var offsetY = (event.clientY - mouseDownY)/this.$.hueCtrl.clientHeight;
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.001 );

            this.hsv.h = 1.0 - offsetY;
            this._repaint();
            var h = Math.round( this.hsv.h * 100.0 )/100.0;
            this.color.fromHSV( h, this.hsv.s, this.hsv.v );
            this._notifyColor();
            event.stopPropagation();
        };
        updateMouseMove.call(this,event);
        this._repaint();

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this.dragMove = false;
            event.stopPropagation();
        }).bind(this);
        document.addEventListener ( 'mousemove', mouseMoveHandle );
        document.addEventListener ( 'mouseup', mouseUpHandle );

        event.stopPropagation();
    },

    _colorCtrlMouseDownAction: function ( event ) {
        EditorUI.addDragGhost("crosshair");

        var rect = this.$.colorCtrl.getBoundingClientRect();
        var mouseDownX = rect.left;
        var mouseDownY = rect.top;
        this.dragMove = true;

        var updateMouseMove = function (event) {
            var offsetX = (event.clientX - mouseDownX)/this.$.colorCtrl.clientWidth;
            var offsetY = (event.clientY - mouseDownY)/this.$.colorCtrl.clientHeight;

            offsetX = Math.max( Math.min( offsetX, 1.0 ), 0.0 );
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.0 );

            this.hsv.s = offsetX;
            this.hsv.v = 1.0-offsetY;
            var h = Math.round( this.hsv.h * 100.0 )/100.0;
            this.color.fromHSV( h, this.hsv.s, this.hsv.v );
            this._notifyColor();
            this._repaint();
            event.stopPropagation();
        };
        updateMouseMove.call(this,event);

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this.dragMove = false;
            event.stopPropagation();
        }).bind(this);
        document.addEventListener ( 'mousemove', mouseMoveHandle );
        document.addEventListener ( 'mouseup', mouseUpHandle );

        event.stopPropagation();
    },

    _opacityCtrlMouseDownAction: function (event) {
        EditorUI.addDragGhost("crosshair");

        var rect = this.$.opacityCtrl.getBoundingClientRect();
        var mouseDownY = rect.top;
        this.dragMove = true;

        var updateMouseMove = function (event) {
            var offsetY = (event.clientY - mouseDownY)/this.$.opacityCtrl.clientHeight;
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.0 );
            this.color.a = this._floatFixed(1.0-offsetY);
            this._notifyColor();
            this._repaint();

            event.stopPropagation();
        };
        updateMouseMove.call(this,event);

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this.dragMove = false;
            event.stopPropagation();
        }).bind(this);
        document.addEventListener ( 'mousemove', mouseMoveHandle );
        document.addEventListener ( 'mouseup', mouseUpHandle );

        event.stopPropagation();
    },

    _notifyColor: function () {
        this.color = new Fire.color(this.color.r, this.color.g, this.color.b, this.color.a);
        this.value = new Array(this.color.r * 255|0, this.color.g * 255|0, this.color.b * 255|0, this.color.a);
    },

    _floatFixed: function (value) {
        return parseFloat(value.toFixed(2));
    },

    _inputChanged: function (event) {
        if (!this.color || this.dragMove === true) {
            return;
        }
        switch (event.target.hint) {
            case 'R':
                this.color.r = event.target.inputValue / 255;
            break;

            case 'G':
                this.color.g = event.target.inputValue/255;
            break;

            case 'B':
                this.color.b = event.target.inputValue/255;
            break;

            case 'ALPHA':
                this.color.a = event.target.inputValue;
            break
        }

        this._notifyColor();
        this.hsv = this.color.toHSV();
        this._repaint();
    },

    close: function () {
        this.remove();
    },
});
