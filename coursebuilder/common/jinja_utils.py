# Copyright 2013 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Custom Jinja2 filters used in Course Builder."""

__author__ = 'John Orr (jorr@google.com)'

import jinja2
from webapp2_extras import i18n
import safe_dom
import tags
import json


def finalize(x):
    """A finalize method which will correctly handle safe_dom elements."""
    if isinstance(x, safe_dom.Node) or isinstance(x, safe_dom.NodeList):
        return jinja2.utils.Markup(x.sanitized)
    return x


def js_string_raw(data):
    """Escape a string so that it can be put in a JS quote."""
    if not isinstance(data, basestring):
        return data
    data = data.replace('\\', '\\\\')
    data = data.replace('\r', '\\r')
    data = data.replace('\n', '\\n')
    data = data.replace('\b', '\\b')
    data = data.replace('"', '\\"')
    data = data.replace("'", "\\'")
    data = data.replace('<', '\\u003c')
    data = data.replace('>', '\\u003e')
    data = data.replace('&', '\\u0026')
    return data


def js_string(data):
    return jinja2.utils.Markup(js_string_raw(data))


def get_gcb_tags_filter(handler):
    def gcb_tags(data):
        """Apply GCB custom tags, if enabled. Otherwise pass as if by 'safe'."""
        if not isinstance(data, basestring):
            return data
        if tags.CAN_USE_DYNAMIC_TAGS.value:
            return jinja2.utils.Markup(tags.html_to_safe_dom(data, handler))
        else:
            return jinja2.utils.Markup(data)
    return gcb_tags


def get_template(template_name, dirs, locale=None, handler=None):
    """Sets up an environment and gets jinja template."""

    jinja_environment = jinja2.Environment(
        autoescape=True, finalize=finalize,
        extensions=['jinja2.ext.i18n'],
        loader=jinja2.FileSystemLoader(dirs))
    jinja_environment.filters['js_string'] = js_string
    jinja_environment.filters['gcb_tags'] = get_gcb_tags_filter(handler)
    jinja_environment.filters['tojson'] = json.dumps

    if locale:

        i18n.get_i18n().set_locale(locale)
        jinja_environment.install_gettext_translations(i18n)

    return jinja_environment.get_template(template_name)
