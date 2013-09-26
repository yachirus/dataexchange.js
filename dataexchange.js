/*
Copyright (c) 2013, Tomoharu Yachikami
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
define(['underscore'], function (_){
    function exchange ($el, obj) {
        if (obj) {
            // Object to UI
            _.each(obj, function (value, key) {
                if (_.isArray(value)) {
                    _.each(value, function (element, index) {
                        var obj = {};
                        obj[key + '\\[' + index + '\\]'] = element;
                        exchange($el, obj);
                    });
                    return;
                }

                var element = $el.find('[data-name=' + key + ']');
                if (element.size() == 0) {
                    var name = key.replace(/[A-Z]/g, function (a) {
                        return '-' + a.toLowerCase();
                    });
                    name = name.replace(/[^\[\-0-9][0-9]+/g, function (a) {
                        return a.charAt(0) + '-' + a.slice(1);
                    });

                    element = $el.find('[name=' + name + ']');
                }

                var base = element.attr('data-base');
                if (base && value) {
                    value = value.toString(base).toUpperCase();
                }

                if (element.is(':radio')) {
                    element.val([value]);
                } else if (element.is(':checkbox')){
                    if (element.attr('data-type') == 'boolean') {
                        element.attr({ checked : value });
                    } else {
                        element.val([value]);
                    }
                } else {
                    if (element.attr('data-type') == 'boolean') {
                        element.val(value ? 'true' : 'false');
                    } else {
                        element.val(value);
                    }
                }
            });
        } else {
            // UI to Object
            var result = {};
            _.each($el.find('input,select'), function (element) {

                if ($(element).is(':radio:not(:checked)')){
                    return;
                }

                if (!$(element).attr('name')){
                    return;
                } 

                var key = $(element).attr('name').replace(/(-.)/g, function (a) {
                    return a.charAt(1).toUpperCase()
                });

                if ($(element).attr('data-name')) {
                    key = $(element).attr('data-name');
                }

                var value = $(element).val();

                if ($(element).is(':checkbox:not(:checked)[data-type!=boolean]')) {
                    // Sets value of unchecked checkbox undefined when data-type is not boolean
                    value = undefined;
                } else {
                    if ($(element).is('[type=number],[data-type=number]')) {
                        // Integer
                        var base = parseInt($(element).attr('data-base')) || 10;
                        value = parseInt(value, base) || 0;
                    } else if ($(element).is('[data-type=float]')) {
                        // Floating point number
                        value = parseFloat(value) || 0.0;
                    } else if ($(element).is('[data-type=boolean]')) {
                        // Boolean
                        if ($(element).is(':checkbox')) {
                            value = $(element).is(':checked');
                        } else {
                            if (value.toLowerCase() == 'true') {
                                value = true;
                            } else if (value.toLowerCase() == 'false') {
                                value = false;
                            } else {
                                value = value ? true : false;
                            }
                        }
                    }
                }

                var arrayExp = /\[[0-9]+\]$/
                if (arrayExp.test(key)) {
                    // Array
                    key = key.replace(arrayExp, '');
                    if (!result[key] || !_.isArray(result[key])) {
                        result[key] = [];
                    }
                    result[key].push(value);
                } else {
                    result[key] = value;
                }
            });

            return result;
        }
    }

    return {
        exchange : exchange,
    };
});