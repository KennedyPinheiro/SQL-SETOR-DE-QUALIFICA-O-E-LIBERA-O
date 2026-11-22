export function loadScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(source, document.baseURI).href;
    script.async = false;
    script.onload = () => resolve(script);
    script.onerror = () => {
      script.remove();
      reject(new Error(`Não foi possível carregar ${source}.`));
    };
    document.body.appendChild(script);
  });
}

export async function loadScripts(sources) {
  const loaded = [];
  try {
    for (const source of sources) loaded.push(await loadScript(source));
    return loaded;
  } catch (error) {
    loaded.forEach(script => script.remove());
    throw error;
  }
}
