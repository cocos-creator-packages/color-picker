Editor.registerWidget( 'color-picker', {
    is: 'color-picker',

    properties: {
        value: {
            type: Object,
            value: function () {
                return {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 1
                };
            },
            notity: true,
        }
    },

    created: function () {
        this._Rgba = function (r, g, b, a) {
            return {
                r: r,
                g: g,
                b: b,
                a: a
            };
        };
    },

    ready: function () {
        this.setColor(this.value);
    },

    setColor: function ( value ) {
        this.value = value;
        this.hsv = this._toFireColor(value).toHSV();
    },

    _updateColor: function () {
        var cssRGB = Fire.hsv2rgb( this.hsv.h, 1, 1 );
        cssRGB = "rgb("+ (cssRGB.r*255|0) + "," + (cssRGB.g*255|0) + "," + (cssRGB.b*255|0) + ")";
        this.$.colorCtrl.style.backgroundColor = cssRGB;
        this.$.opacityCtrl.style.backgroundColor = cssRGB;

        this.$.colorHandle.style.left = this.hsv.s * 100 + "%";
        this.$.colorHandle.style.top = (1.0 - this.hsv.v) * 100 + "%";
        this.$.hueHandle.style.top = (1.0 - this.hsv.h) * 100 + "%";

        var opaRect = this.$.opacityCtrl.getBoundingClientRect();
        this.$.opacityHandle.style.top = (1.0 - this.value.a) * opaRect.height;
    },

    _hueCtrlMouseDownAction: function ( event ) {
        EditorUI.addDragGhost("crosshair");

        var rect = this.$.hueCtrl.getBoundingClientRect();
        var mouseDownY = rect.top;

        var updateMouseMove = function (event) {
            var offsetY = (event.clientY - mouseDownY)/this.$.hueCtrl.clientHeight;
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.001 );

            this.hsv.h = 1.0 - offsetY;
            this._updateColor();
            var h = Math.round( this.hsv.h * 100.0 )/100.0;
            var _rgb = Fire.hsv2rgb( this.hsv.h, 1, 1 );
            this.value = new this._Rgba(_rgb.r * 255 | 0, _rgb.g * 255 | 0, _rgb.b * 255 | 0, this.value.a);
            this.hsv = this._toFireColor(this.value).toHSV();

            event.stopPropagation();
        };
        updateMouseMove.call(this,event);
        this._updateColor();

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this._editingHSV = false;
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

        var updateMouseMove = function (event) {
            var offsetX = (event.clientX - mouseDownX)/this.$.colorCtrl.clientWidth;
            var offsetY = (event.clientY - mouseDownY)/this.$.colorCtrl.clientHeight;

            offsetX = Math.max( Math.min( offsetX, 1.0 ), 0.0 );
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.0 );

            this.hsv.s = offsetX;
            this.hsv.v = 1.0 - offsetY;
            var h = Math.round( this.hsv.h * 100.0 )/100.0;
            var _rgb = Fire.hsv2rgb(h, this.hsv.s, this.hsv.v);
            this.value = new this._Rgba(_rgb.r * 255 | 0, _rgb.g * 255 | 0, _rgb.b * 255 | 0, this.value.a);
            this._updateColor();
            event.stopPropagation();
        };
        updateMouseMove.call(this,event);

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this._editingHSV = false;
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

        var updateMouseMove = function (event) {
            var offsetY = (event.clientY - mouseDownY)/this.$.opacityCtrl.clientHeight;
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.0 );
            this.value = new this._Rgba(this.value.r, this.value.g, this.value.b, this.floatFixed(1.0 - offsetY));
            this._updateColor();

            event.stopPropagation();
        };
        updateMouseMove.call(this,event);

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            event.stopPropagation();
        }).bind(this);
        document.addEventListener ( 'mousemove', mouseMoveHandle );
        document.addEventListener ( 'mouseup', mouseUpHandle );

        event.stopPropagation();
    },

    _toFireColor: function (value) {
        return new Fire.color(value.r,value.g,value.b,value.a);
    },

    _Rgba2chroma: function (value) {
        return chroma(value.r,value.g,value.b,value.a);
    },

    floatFixed: function (value) {
        return parseFloat(value.toFixed(2));
    },

    _inputChanged: function () {
        event.stopPropagation();
        if (!this.value) return
        this.hsv = this._toFireColor(this.value).toHSV();
        this.hsv.v = this.hsv.v / 255;
        console.log(this.value);
        this._updateColor();
    },
});
