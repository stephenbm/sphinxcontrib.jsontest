import os
from jinja2 import Environment, PackageLoader
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive
from docutils.nodes import Element


env = Environment(loader=PackageLoader('sphinxcontrib.jsontest', 'templates'))


class jsontest(Element):
    def __init__(self, index, url_args, json_input, schema):
        super(jsontest, self).__init__()
        self.index = index
        self.url_args = url_args
        self.json_input = json_input
        self.schema = schema


def visit_jsontest_html(self, node):
    split = lambda arg: tuple(arg.strip().split('='))
    self.body.append(env.get_template('api_test.html').render(
        index=node.index,
        url_args=map(split, node.url_args),
        json_input=node.json_input,
        schema=node.schema
    ))


def depart_jsontest_html(self, node): pass


class JSONTest(Directive):
    option_spec = {
        'url_args': directives.unchanged,
        'json_input': directives.unchanged,
        'schema': directives.uri
    }

    def run(self):
        env = self.state.document.settings.env
        url_args = self.options.get('url_args')
        url_args = url_args and url_args.split('\n') or []
        json_input = self.options.get('json_input', '')
        if 'json_input' not in self.options:
            json_input = None
        index = env.new_serialno('jsoncall')
        return [jsontest(index, url_args, json_input, self.options.get('schema'))]


def on_init(app):
    dirpath = os.path.dirname(__file__)
    static_path = os.path.join(dirpath, '_static')
    app.config.html_static_path.append(static_path)
    app.add_stylesheet('jsontest.css')
    app.add_stylesheet('highlight.css')
    app.add_javascript('tv4.min.js')
    app.add_javascript('jsontest.js')
    app.add_javascript('highlight.pack.js')


def setup(app):
    app.connect('builder-inited', on_init)
    app.add_node(jsontest, html=(visit_jsontest_html, depart_jsontest_html))
    app.add_directive('jsontest', JSONTest)
