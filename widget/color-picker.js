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
                    a: 1,
                };
            },
            notify: true,
        },
    },

    created: function () {
        this._dragging = false;
    },

    ready: function () {
        this.setColor(this.value);
    },

    setColor: function ( value ) {
        this.value = value;
        this.hsv = this.rgb2hsv(this.value.r, this.value.g, this.value.b);
        this._repaint();
    },

    _repaint: function () {
        var cssRGB = this.hsv2rgb( this.hsv.h, 1, 1 );
        cssRGB = chroma(cssRGB.r, cssRGB.g, cssRGB.b).css('rgb');
        this.$.colorCtrl.style.backgroundColor = cssRGB;
        this.$.opacityCtrl.style.backgroundColor = cssRGB;
        this.$.opacityHandle.style.top = (1.0 - this.value.a) * 100 + '%';
        this.$.hueHandle.style.top = (1.0 - this.hsv.h) * 100 + '%';
        this.$.colorHandle.style.left = this.hsv.s * 100 + '%';
        this.$.colorHandle.style.top = (1.0 - this.hsv.v) * 100 + '%';
    },

    _hueCtrlMouseDownAction: function ( event ) {
        event.stopPropagation();

        EditorUI.addDragGhost('crosshair');

        var rect = this.$.hueCtrl.getBoundingClientRect();
        var mouseDownY = rect.top;
        this._dragging = true;

        var updateMouseMove = function (event) {
            event.stopPropagation();

            var offsetY = (event.clientY - mouseDownY) / this.$.hueCtrl.clientHeight;
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.001 );

            this.hsv.h = 1.0 - offsetY;
            this._repaint();
            var h = Math.round( this.hsv.h * 100.0 ) / 100.0;
            this.set( 'value', this.hsv2rgb( h, this.hsv.s, this.hsv.v ) );
        };
        updateMouseMove.call(this,event);
        this._repaint();

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            event.stopPropagation();

            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this._dragging = false;
        }).bind(this);
        document.addEventListener ( 'mousemove', mouseMoveHandle );
        document.addEventListener ( 'mouseup', mouseUpHandle );
    },

    _colorCtrlMouseDownAction: function ( event ) {
        event.stopPropagation();

        EditorUI.addDragGhost('crosshair');

        var rect = this.$.colorCtrl.getBoundingClientRect();
        var mouseDownX = rect.left;
        var mouseDownY = rect.top;
        this._dragging = true;

        var updateMouseMove = function (event) {
            event.stopPropagation();

            var offsetX = (event.clientX - mouseDownX) / this.$.colorCtrl.clientWidth;
            var offsetY = (event.clientY - mouseDownY) / this.$.colorCtrl.clientHeight;

            offsetX = Math.max( Math.min( offsetX, 1.0 ), 0.0 );
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.0 );

            this.hsv.s = offsetX;
            this.hsv.v = 1.0-offsetY;
            var h = Math.round( this.hsv.h * 100.0 ) / 100.0;
            this.set( 'value', this.hsv2rgb( h, this.hsv.s, this.hsv.v ) );

            this._repaint();
        };
        updateMouseMove.call(this,event);

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            event.stopPropagation();

            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this._dragging = false;
        }).bind(this);
        document.addEventListener ( 'mousemove', mouseMoveHandle );
        document.addEventListener ( 'mouseup', mouseUpHandle );
    },

    _opacityCtrlMouseDownAction: function (event) {
        event.stopPropagation();

        EditorUI.addDragGhost('crosshair');

        var rect = this.$.opacityCtrl.getBoundingClientRect();
        var mouseDownY = rect.top;
        this._dragging = true;

        var updateMouseMove = function (event) {
            event.stopPropagation();

            var offsetY = (event.clientY - mouseDownY)/this.$.opacityCtrl.clientHeight;
            offsetY = Math.max( Math.min( offsetY, 1.0 ), 0.0 );
            this.set( 'value.a', parseFloat((1.0 - offsetY).toFixed(2))  );
            this._repaint();
        };
        updateMouseMove.call(this,event);

        var mouseMoveHandle = updateMouseMove.bind(this);
        var mouseUpHandle = (function(event) {
            event.stopPropagation();

            document.removeEventListener('mousemove', mouseMoveHandle);
            document.removeEventListener('mouseup', mouseUpHandle);

            EditorUI.removeDragGhost();
            this._dragging = false;
        }).bind(this);
        document.addEventListener ( 'mousemove', mouseMoveHandle );
        document.addEventListener ( 'mouseup', mouseUpHandle );
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

    _onInputChanged: function (event) {
        event.stopPropagation();

        if ( this.value === undefined || this._dragging === true ) {
            return;
        }

        switch (event.target.hint) {
            case 'R': this.set( 'value.r', event.target.inputValue ); break;
            case 'G': this.set( 'value.g', event.target.inputValue ); break;
            case 'B': this.set( 'value.b', event.target.inputValue ); break;
            case 'ALPHA': this.set( 'value.a', event.target.inputValue ); break;
        }
        this.hsv = this.rgb2hsv(this.value.r, this.value.g, this.value.b);
        this._repaint();
    },
});
