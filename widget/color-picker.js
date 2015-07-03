Editor.registerWidget( 'color-picker', {
    is: 'color-picker',

    properties: {
        value: {
            type: Object,
            value: function () {
                return {r: 255,g: 255,b: 255,a: 1};
            },
        },
    },

    created: function () {
        this.dragMove = false;
    },

    ready: function () {
        this.setColor(this.value);
    },

    setColor: function ( value ) {
        this.value = value;
        this.hsv = this.rgb2hsv(this.value.r,this.value.g,this.value.b);
        this._notifyColor();
        this._repaint();
    },

    _repaint: function () {
        var cssRGB = this.hsv2rgb( this.hsv.h, 1, 1 );
        cssRGB = "rgb("+ (cssRGB.r) + "," + (cssRGB.g) + "," + (cssRGB.b) + ")";
        this.$.colorCtrl.style.backgroundColor = cssRGB;
        this.$.opacityCtrl.style.backgroundColor = cssRGB;
        this.$.opacityHandle.style.top = (1.0-this.value.a)*100 + "%";
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
            this.value = this.hsv2rgb( h, this.hsv.s, this.hsv.v );
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
            this.value = this.hsv2rgb( h, this.hsv.s, this.hsv.v );
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
            this.value.a = this._floatFixed(1.0-offsetY);
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
        this.value = new Object({r: this.value.r, g: this.value.g, b: this.value.b, a: this.value.a});
        this.fire('value-changed');
    },

    _floatFixed: function (value) {
        return parseFloat(value.toFixed(2));
    },

    rgb2hsv: function ( r, g, b ) {
        var hsv = { h: 0, s: 0, v: 0 };
        var hsv_ = chroma(r,g,b).hsv();
        hsv_[0] = isNaN(hsv_[0]) ?  0 : hsv_[0] / 360;
        hsv.h = hsv_[0];
        hsv.s = hsv_[1];
        hsv.v = hsv_[2];
        return hsv;
    },

    hsv2rgb: function ( h, s, v ) {
        var rgb = { r: 0, g: 0, b: 0, a: this.value.a};
        var rgb_ = chroma.hsv(h * 360,s,v).rgb();
        rgb.r = rgb_[0];
        rgb.g = rgb_[1];
        rgb.b = rgb_[2];
        return rgb;
    },

    _inputChanged: function (event) {
        if (!this.value || this.dragMove === true) {
            return;
        }
        switch (event.target.hint) {
            case 'R':
                this.value.r = event.target.inputValue;
            break;

            case 'G':
                this.value.g = event.target.inputValue;
            break;

            case 'B':
                this.value.b = event.target.inputValue;
            break;

            case 'ALPHA':
                this.value.a = event.target.inputValue;
            break
        }
        this._notifyColor();
        this.hsv = this.rgb2hsv(this.value.r,this.value.g,this.value.b);
        this._repaint();
    },

    close: function () {
        this.remove();
    },
});
