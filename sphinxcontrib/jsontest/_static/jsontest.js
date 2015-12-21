String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g, function (a, b) {
        return o[b] || a;
    });
};

window.jsontest = {
    schemas: {},
    loadSchema: function(button) {
        var schema_uri = button.children('div.schema-uri').text();
        if (!schema_uri) { return; }
        $.ajax({
            url: schema_uri,
            success: function(data, text_status, error) {
                window.jsontest.schemas[button.attr('id')] = {
                    uri: schema_uri,
                    schema: data
                };
            },
            error: function(data, text_status, error) {
                console.log('error');
            }
        });
    },
    ajaxKwargs: function(button) {
        var url_node = button.closest('dd').prev();
        var parts = url_node.children("code.descname,em:not([class='property'])")
        var parsed = $.map(parts.slice(1), function(item) {
            return $(item).prop('tagName').toUpperCase() == 'CODE' ? $(item).text() : '{' + $(item).text() + '}';
        });
        return {
            type: $(parts[0]).text().trim().toUpperCase(),
            url: parsed.join(''),
            success: function(data, text_status, error) {
                button.prev().find('textarea').addClass('success');
                button.prev().find('textarea').removeClass('error');
                window.jsontest.updateResponseContent(button, data);
            },
            error: function(response, text_status, error) {
                button.prev().find('textarea').removeClass('success');
                button.prev().find('textarea').addClass('error');
                try {
                    message = JSON.parse(response.responseText);
                } catch(err) {
                    message = response.responseText;
                }
                data = {
                    error: "There was an error processing the request",
                    error_status: {
                        code: response.status,
                        status: response.statusText
                    },
                    message: message
                }
                window.jsontest.updateResponseContent(button, data);
            }
        };
    },
    urlKwargs: function(button) {
        var inputs = button.closest('dd').find("input[type='text']");
        var kwargs = {};
        $.map(inputs, function(input) {
            kwargs[$(input).attr('name')] = encodeURIComponent($(input).val());
        });
        return kwargs
    },
    postData: function(button) {
        var data = button.prev().find('div.json-box textarea').val();
        if (data) { return JSON.parse(data); }
        return data;
    },
    updateResponseContent: function(button, data) {
        content = button.next()
        content.find('pre:first').text(JSON.stringify(data, null, 4)).each(function(i, block) {
            hljs.highlightBlock(block);
        });
        content.fadeIn(100);
    },
    cacheReferencedSchema: function(ajax_kwargs, button, schema, missing_schema, callback) {
        var uri = missing_schema;
        if (missing_schema[0] != '/') {
            uri = schema.uri.split('/');
            uri = uri.slice(0,-1);
            uri = uri.concat(missing_schema);
            uri = uri.join('/');
        }
        $.ajax({
            url: uri,
            success: function(data, text_status, error) {
                tv4.addSchema(missing_schema, data);
                callback(ajax_kwargs, button, schema);
            },
            error: function(data, text_status, error) {
                console.log('error');
            }
        });
    },
    validateSchema: function(ajax_kwargs, button, schema) {
        var validator = function (ajax_kwargs, button, schema) {
            var data = window.jsontest.postData(button);
            var result = tv4.validateMultiple(data, schema.schema);
            console.log(data);
            console.log(schema.schema);
            console.log(result);
            if (result.missing.length) {
                window.jsontest.cacheReferencedSchema(ajax_kwargs, button, schema, result.missing[0], validator);
            } else {
                ajax_kwargs.contentType = 'application/json'
                ajax_kwargs.data = JSON.stringify(data);
                window.jsontest.updateResult(ajax_kwargs, button, result);
            }
        };
        validator(ajax_kwargs, button, schema);
    },
    updateResult: function(ajax_kwargs, button, result) {
        if (!result.valid) {
            button.prev().find('textarea').removeClass('success');
            button.prev().find('textarea').addClass('error');
            var errors = {
                "error": "There was an error validating the schema",
                "reasons": result
            };
            $.map(errors.reasons.errors, function(error) {
                delete error['stack'];
            });
            window.jsontest.updateResponseContent(button, errors);
            return;
        }
        $.ajax(ajax_kwargs);
    }
}


$(document).ready(function() {
    $('a.btn.jsontest').each(function() {
        window.jsontest.loadSchema($(this).parent());
    }).click(function(eventArgs) {
        eventArgs.preventDefault();
        button = $(this).parent();
        var ajax_kwargs = window.jsontest.ajaxKwargs(button);
        var url_kwargs = window.jsontest.urlKwargs(button);
        ajax_kwargs.url = ajax_kwargs.url.supplant(url_kwargs);
        var schema = window.jsontest.schemas[button.attr('id')];
        console.log(ajax_kwargs);
        if (ajax_kwargs['type'] == 'POST' || ajax_kwargs['type'] == 'PUT') {
            if (schema) {
                console.log(schema);
                window.jsontest.validateSchema(ajax_kwargs, button, schema);
                return;
            } else {
                var data = window.jsontest.postData(button);
                ajax_kwargs.contentType = 'application/json'
                ajax_kwargs.data = JSON.stringify(data);
            }
        }
        $.ajax(ajax_kwargs);
    });
});
