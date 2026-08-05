'use strict';

window.Showdown = {
  converter: function (options) {
    var converter = new window.showdown.Converter(options);
    this.makeHtml = function (source) {
      return converter.makeHtml(source);
    };
  }
};
