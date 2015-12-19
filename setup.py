import os

try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

install_requires=[
    "Sphinx>=0.6",
    "sphinxcontrib-httpdomain",
    "Jinja2"
]

here = os.path.abspath(os.path.dirname(__file__))
try:
    README = open(os.path.join(here, 'README.rst')).read()
except IOError:
    README = ''

setup(
    name='sphinxcontrib-jsontest',
    version='0.1.0',
    description='Sphinx extension allows you to test json apis',
    long_description=README,
    author='Stephen Breyer-Menke',
    author_email='steve.bm@gmail.com',
    license='Public domain',
    url='https://github.com/stephenbm/sphinxcontrib.jsontest',
    packages=find_packages(),
    namespace_packages=['sphinxcontrib'],
    install_requires=install_requires,
    include_package_data=True,
    package_data={'sphinxcontrib.jsontest': ['_static/*']},
    zip_safe=False
)
