try {
  importScripts(
    '/jiras/base.js',
    '/jiras/central.js',
    '/jiras/trilogy.js',
    '/jiras/devgraphalp.js',
    '/util/jiraKeyUtil.js',
    '/util/customFunctionJqlBuilder.js',
    '/handler.js',
  );
} catch (e) {
  console.error(e);
}
