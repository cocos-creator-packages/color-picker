describe('<color-picker>', function() {
    var cpEl;
    beforeEach(function ( done ) {
        fixture('widget', function ( el ) {
            cpEl = el;
            done();
        });
    });

    it('check default value', function( done ) {
        expect(cpEl.color).to.be.eql(new Fire.color(1,1,1,1));
        expect(cpEl.value).to.be.eql(new Array(255,255,255,1));
        done();
    });

    it('can be set value', function( done ) {
        cpEl.setColor(new Fire.color(0.5,0.5,0.5,1));
        expect(cpEl.color).to.be.eql(new Fire.color(0.5,0.5,0.5,1));
        expect(cpEl.value).to.be.eql(new Array(0.5 * 255|0,0.5 * 255|0,0.5 * 255|0,1));
        var unitInputs = cpEl.getElementsByTagName('editor-unit-input');
        expect(unitInputs[0].inputValue).to.be.eql(0.5 * 255|0);
        expect(unitInputs[1].inputValue).to.be.eql(0.5 * 255|0);
        expect(unitInputs[2].inputValue).to.be.eql(0.5 * 255|0);
        expect(unitInputs[3].inputValue).to.be.eql(1);
        done();
    });

    it('can be set value from unit-input', function( done ) {
        var unitInputs = cpEl.getElementsByTagName('editor-unit-input');
        unitInputs[0].inputValue = 255;
        unitInputs[1].inputValue = 255;
        unitInputs[2].inputValue = 255;
        unitInputs[3].inputValue = 1;
        expect(cpEl.value).to.be.eql(new Array(255,255,255,1));
        expect(cpEl.color).to.be.eql(new Fire.color(1,1,1,1));
        done();
    });

});
