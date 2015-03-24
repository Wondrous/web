
var BASEURL = "http://mojorankdev.s3.amazonaws.com/";

var URLGenerator = {

    generate45: function(ouuid){
        return BASEURL+ouuid+"-dim45x45";
    },

    generate75: function(ouuid){
        return BASEURL+ouuid+"-dim75x75";
    },

    generate150: function(ouuid){
        return BASEURL+ouuid+"-dim150x150";
    },

    generateOriginal: function(ouuid){
        return BASEURL+ouuid;
    },

    generateMedium: function(ouuid){
        return BASEURL+ouuid+"-med";
    }
}

module.exports = URLGenerator
