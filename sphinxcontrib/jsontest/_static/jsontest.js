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
                window.jsontest.schemas[button.attr('id')] = data;
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
        return JSON.parse(button.prev().find('div.json-box textarea').val());
    },
    updateResponseContent: function(button, data) {
        content = button.next()
        content.find('pre:first').text(JSON.stringify(data, null, 4)).each(function(i, block) {
            hljs.highlightBlock(block);
        });
        content.fadeIn(100);
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
        if (schema && (ajax_kwargs['type'] == 'POST')) {
            var data = window.jsontest.postData(button);
            var valid = tv4.validate(data, schema);
            if (!valid) {
                button.prev().find('textarea').removeClass('success');
                button.prev().find('textarea').addClass('error');
                var errors = {
                    "error": "There was an error validating the schema",
                    "reasons": tv4.error
                }
                delete errors.reasons['stack'];
                window.jsontest.updateResponseContent(button, errors);
                return;
            }
            ajax_kwargs.contentType = 'application/json'
            ajax_kwargs.data = JSON.stringify(data);
        }
        $.ajax(ajax_kwargs);
    });
});
