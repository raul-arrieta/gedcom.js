
    var Gedcom = (function(){
        "use strict";

        /*************************************
        /* Public Functions
        /*************************************/
        var parse = function (file, cb) {
            var url = file;
            $.get(
                url, 
                function(data) 
                {
                    
                    var element_top = formatLine("-1 TOP"),
                    lastElement = element_top;

                    var lines = data.split('\n');
                    
                    lines.forEach(
                        function (line) {
                            //empty line discard
                            if (line != null && line != "" && line.length > 0) {
                                var element = formatLine(line.trim());
                                lastElement = parseLine(element, lastElement);
                            }
                        }
                    );
                    
                    lines.join(
                        function () 
                        {
                            cb(element_top);
                        }
                    );

                    //when parsing finished "parsed" event triggered
                    $(document).trigger("parsed", element_top );
                }
            );
        };

        /*************************************
        /* Private Functions
        /*************************************/
        
        var parseLine = function(element, lastElement) {
            var parent_elem = lastElement;
            while (parent_elem.level > element.level - 1) {
                parent_elem = parent_elem.parent;
            }

            var tag = parent_elem[element.tag];
            if (tag instanceof Array) {
                tag.push(element);
            } else if (tag) {
                parent_elem[element.tag] = [tag, element];
            } else {
                parent_elem[element.tag] = element;
            }
            element.parent = parent_elem;
            return element;
        }

        var Row = function(level, id, tag, value) {
            if (level) this.level = level;
            if (id) this.id = id;
            if (tag) this.tag = tag;
            if (value) this.value = value;
        };

        Row.prototype.simplify = function () {
            delete this.parent;
            delete this.level;
            delete this.tag;
            for (var key in this) {
                var value = this[key];
                if (value instanceof Array) {
                    value.map(function (e) {
                        if (e.simplify) {
                            e.simplify();
                        }
                    });
                } else {
                    if (value.simplify) {
                        value.simplify();
                    }
                }
            }
        };

        var formatLine = function(line) {

            var split = line.split(' '),
                level = split.shift(),
                tmp = split.shift(),
                id = null,
                tag = null,
                value = null;

            if (tmp.charAt(0) == '@') {
                // line contains an id
                id = tmp;
                tmp = split.shift();
            }

            tag = tmp;
            if (split.length > 0) {
                value = split.join(' ');
                if (value.match(/@[^@]+@/)) {
                    // contains a reference...
                    // Family Tree Legends seems to put id in value some times, other times it will put it in id location...
                    id = value;
                    value = null;
                }
            }
            return new Row(level, id, tag, value);
        };

        /*************************************
        /* Public functions
        /*************************************/
        return {
            parse: parse
        };
    })();
