import translations from './translations';

let translateMap = {};

for (let key in translations) {
  const newKey = key.toLocaleLowerCase()?.replace(/\s+/g, '');
  translateMap[newKey] = translations[key];
}

export default function customTranslate (key, replacements) {
  let template = key.toLocaleLowerCase()?.replace(/\s+/g, '');
  
  replacements = replacements || {}
  template = translateMap[template] || key
  return template.replace(/{([^}]+)}/g, function (_, key) {
    var str = replacements[key]
    if (translateMap[replacements[key]] != null && translateMap[replacements[key]] !== 'undefined') {
      str = translateMap[replacements[key]]
    }
    return str || '{' + key + '}'
  })
}