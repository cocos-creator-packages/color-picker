Editor.registerWidget( 'color-picker', {
    is: 'color-picker',

    properties: {
        value: {
            type: Object,
            value: function () {
                return {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 1
                }
            },
            notity: true,
            observer: '_valueChanged'
        }
    },

    created: function () {
        this.dragMove = false;
    },

    ready: function () {
        this.setColor(this.value);
        this._h = 0;
    },

    _valueChanged: function () {
        if (!this.value) {
            return;
        }
        this.hsv = this._Rgba2FireColor(this.value).toHSV();
        this._repaint();
    },

    setColor: function ( value ) {
        this.value = new Object({r: value.r, g: value.g, b: value.b, a: value.a});
        this.hsv = this._Rgba2FireColor(this.value).toHSV();
        this._h = this.hsv.h;
        this._repaint();
    },

    _repaint: function () {
        var cssRGB = Fire.hsv2rgb( this._h, 1, 1 );
        cssRGB = "rgb("+ (cssRGB.r * 255|0) + "," + (cssRGB.g * 255 | 0) + "," + (cssRGB.b * 255 | 0) + ")";
        this.$.colorCtrl.style.backgroundColor = cssRGB;
        this.$.opacityCtrl.style.backgroundColor = cssRGB;
        this.$.opacityHandle.style.top = (1.0-this.value.a)*100 + "%";
        this.$.hueHandle.style.top = (1.0-this._h)*100 + "%";
        this.$.colorHandle.style.left = this.hsv.s*100 + "%";
        this.$.colorHandle.style.top = (1.0-this.hsv.v)*100 + "%";
        this.fire('color-changed');
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
            var _value = this._Rgba2FireColor(this.value).fromHSV( h, this.hsv.s, this.hsv.v );
            this._h = this.hsv.h;
            this.value = this._fireColor2Rgba(_value);
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
            this.hsv.v = 1.0 - offsetY;
            var h = Math.round( this._h * 100.0 ) / 100.0;
            var _value = this._Rgba2FireColor(this.value).fromHSV( h, this.hsv.s, this.hsv.v );
            this.value = this._fireColor2Rgba(_value);
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
            this.value.a = this._floatFixed(1.0 - offsetY);
            this.value = new Object({r: this.value.r, g: this.value.g, b: this.value.b, a: this.value.a});
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

    _Rgba2FireColor: function (value) {
        return new Fire.color(value.r/255,value.g/255,value.b/255,value.a);
    },

    _fireColor2Rgba: function (value) {
        return new Object({r: Math.round(value.r*255), g: Math.round(value.g*255), b: Math.round(value.b*255), a: value.a});
    },

    _floatFixed: function (value) {
        return parseFloat(value.toFixed(2));
    },

    _inputChanged: function () {
        if (!this.value || this.dragMove === true) {
            return;
        }
        this.hsv = this._Rgba2FireColor(this.value).toHSV();
        this._h = this.hsv.h;
        this._repaint();
    },
});
