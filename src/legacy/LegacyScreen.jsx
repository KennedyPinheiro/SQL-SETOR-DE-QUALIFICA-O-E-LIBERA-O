import { createElement, Fragment, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '../components/LegacyButton.jsx';
import Panel from '../components/TacticalPanel.jsx';
import ScreenFrame from '../components/ScreenFrame.jsx';
import { loadScripts } from './loadScript.js';
import gameMarkup from './templates/game.html?raw';
import practiceMarkup from './templates/practice.html?raw';

const markupByScreen = {
  game: gameMarkup,
  practice: practiceMarkup
};

const scriptsByScreen = {
  game: [
    'js/settings.js',
    'js/portraits.js',
    'js/sounds.js',
    'js/ambient.js',
    'js/core/game-state.js',
    'js/core/database.js',
    'js/core/utils.js',
    'js/systems/timer.js',
    'js/systems/visitor.js',
    'js/systems/suspicion.js',
    'js/systems/sql.js',
    'js/systems/decision.js',
    'js/systems/events.js',
    'js/interface/visitor-ui.js',
    'js/interface/hud.js',
    'js/interface/suspicion-ui.js',
    'js/interface/modals.js',
    'js/interface/building.js',
    'js/game.js'
  ],
  practice: ['js/settings.js', 'js/sounds.js', 'js/practice.js']
};

const panelClassNames = new Set([
  'modal',
  'visitor-panel',
  'identity-card',
  'sql-panel',
  'suspicion-panel',
  'practice-sidebar',
  'practice-editor-panel',
  'practice-results-panel',
  'practice-history-panel'
]);

const frameClassNames = new Set([
  'start-screen',
  'app-shell',
  'practice-workspace',
  'workspace'
]);

const voidTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr'
]);

const booleanAttributes = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'controls',
  'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'inert', 'loop',
  'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'readonly', 'required',
  'reversed', 'scoped', 'selected'
]);

const attributeNames = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin',
  srcset: 'srcSet',
  datetime: 'dateTime',
  autofocus: 'autoFocus'
};

function toStyleObject(styleText) {
  return styleText.split(';').reduce((styles, declaration) => {
    const colon = declaration.indexOf(':');
    if (colon < 0) return styles;
    const property = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (!property || !value) return styles;
    const key = property.startsWith('--')
      ? property
      : property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    styles[key] = value;
    return styles;
  }, {});
}

function convertAttributes(element) {
  const props = {};
  for (const attribute of element.attributes) {
    const rawName = attribute.name.toLowerCase();
    const value = attribute.value;

    if (rawName === 'onclick') {
      const action = value.trim().match(/^([\w$]+)\((.*)\)$/);
      if (!action) continue;
      const args = action[2].trim()
        ? action[2].split(',').map(argument => {
          const item = argument.trim();
          if ((item.startsWith("'") && item.endsWith("'")) || (item.startsWith('"') && item.endsWith('"'))) {
            return item.slice(1, -1);
          }
          if (item === 'true') return true;
          if (item === 'false') return false;
          if (item === 'null') return null;
          const numeric = Number(item);
          return Number.isNaN(numeric) ? item : numeric;
        })
        : [];
      props.onClick = () => {
        // Templates are bundled with this app and contain only its existing
        // inline actions; resolving at click time lets the legacy adapter load
        // those actions after React has mounted the controls.
        window[action[1]]?.(...args);
      };
      continue;
    }

    if (rawName === 'style') {
      props.style = toStyleObject(value);
      continue;
    }
    if (rawName === 'checked') {
      props.defaultChecked = true;
      continue;
    }
    if (rawName === 'selected') {
      props.selected = true;
      continue;
    }

    const name = attributeNames[rawName] || rawName;
    if (booleanAttributes.has(rawName)) {
      props[name] = true;
    } else if (rawName === 'value' && ['input', 'textarea'].includes(element.tagName.toLowerCase())) {
      props.defaultValue = value;
    } else {
      props[name] = value;
    }
  }
  return props;
}

function renderMarkupNode(node, key) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style') return null;

  const props = convertAttributes(node);
  props.key = key;
  const classes = new Set((props.className || '').split(/\s+/).filter(Boolean));
  const children = Array.from(node.childNodes)
    .map((child, index) => renderMarkupNode(child, `${key}.${index}`))
    .filter(child => child !== null);

  if (voidTags.has(tag)) {
    return createElement(tag, props);
  }
  if (tag === 'button') {
    return createElement(Button, props, children);
  }
  if ([...classes].some(className => panelClassNames.has(className))) {
    return createElement(Panel, { ...props, component: tag }, children);
  }
  if ([...classes].some(className => frameClassNames.has(className))) {
    return createElement(ScreenFrame, { ...props, component: tag }, children);
  }
  if (tag === 'div' && classes.has('topbar')) {
    return createElement(Box, { ...props, component: 'header' }, children);
  }
  return createElement(tag, props, children);
}

function renderTemplate(screen) {
  const source = markupByScreen[screen];
  const parsed = new DOMParser().parseFromString(source, 'text/html');
  return createElement(
    Fragment,
    null,
    ...Array.from(parsed.body.childNodes).map((node, index) => renderMarkupNode(node, `${screen}.${index}`))
  );
}

async function loadLegacyAdapter(screen) {
  const scripts = [...scriptsByScreen[screen]];
  if (screen === 'game' || screen === 'practice') {
    scripts.unshift('https://cdn.jsdelivr.net/npm/alasql@4/dist/alasql.min.js');
  }
  return loadScripts(scripts);
}

export default function LegacyScreen({ screen }) {
  const [loadError, setLoadError] = useState('');
  const markup = useMemo(() => renderTemplate(screen), [screen]);

  useEffect(() => {
    document.body.dataset.screen = screen;
    if (screen === 'practice') document.body.classList.add('practice-page');

    let cancelled = false;
    let scripts = [];
    loadLegacyAdapter(screen)
      .then(loaded => {
        if (cancelled) loaded.forEach(script => script.remove());
        else scripts = loaded;
      })
      .catch(error => { if (!cancelled) setLoadError(error.message); });

    return () => {
      cancelled = true;
      scripts.forEach(script => script.remove());
      document.body.classList.remove('practice-page');
    };
  }, [screen]);

  return (
    <>
      {markup}
      {loadError && (
        <div className="legacy-load-error" role="alert">
          <strong>FALHA AO INICIAR A INTERFACE</strong>
          <span>{loadError}</span>
          <Button onClick={() => window.location.reload()}>TENTAR NOVAMENTE</Button>
        </div>
      )}
    </>
  );
}
