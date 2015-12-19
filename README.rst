=========
JSON Test
=========

About
=====

This extension makes it simple to add a widget allowing users to test
JSON requests against your api form the documentation. It has support 
for parameters that get injected into the url path and to post JSON data
to the api. It does not have support for query string parameters or form 
encoded post data (if you would like this, please add it and send a pull 
request).

There is support for client side `json-schema <http://json-schema.org/>`_
validation (currently only for draft04). jsontest uses
`tv4 <http://https://github.com/geraintluff/tv4>`_ for schema
validation.

jsontest requires sphinxcontrib.httdomain documented apis and uses the 
dom to add events to elements on the page (it does expect a specific 
structure of the dom).

jsontest was designed for use with the readthedocs sphinx theme - it has not
been tested with the other themes. If you want to sue the read the docs theme
just set the html_theme in your conf.py::

    html_theme = 'sphinx_rtd_theme'

Setup
=====

To install (assuming you have pip setup) just run::

    pip install sphinxcontrib-jsontest

Then add sphinxcontrib.jsontest to your list of extensions in conf.py::

   extensions = ['sphinxcontrib.httpdomain', 'sphinxcontrib.jsontest'] 

Usage
=====

To add teh test api functionality to an endpoint just add the directive
in the block that generates the api endpoint (this is necessary because
jsontest relies on a failry specific dom structure)::

    .. jsontest::

jsontest can't figure out url args from the description yet, so if you rely
on them you have to add them to the url_args option for the directive as a 
line separated list of key=value pairs (where value is the default value)::

    .. jsontest::
        :url_args:
            customername=bob
            orderid=12

If you want to add a textarea for inputting json to the request just add the
json_input option (with no argument)::

    .. jsontest::
        :json_input:

And if you want to add a schema check to the json input add the schema option
and pass the url or relative path to the schema file to validate against::

    .. jsontest::
        :json_input:
        :schema: schemas/test_input.json

You can combine the url_args, json_input and schema options.

License
=======

The code is available as "public domain", meaning that it is completely free to use,
without any restrictions at all. Read the full license 
`here <https://github.com/stephenbm/sphinxcontrib.jsontest/blob/master/LICENSE>`_.

It's also available under an MIT license. `MIT license <https://opensource.org/licenses/MIT>`_
