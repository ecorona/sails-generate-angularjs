/**
 * Module dependencies
 */

var path = require('path');
var _ = require('lodash');
var generateFile = require('./file');


/**
 * Usage:
 * `sails generate page foo`
 *
 * Or:
 * `sails generate page dashboard/foo`
 */

module.exports = {

  templatesDirectory: path.resolve(__dirname,'./templates'),

  /**
   * Scope:
   * ----------------------------------------------------
   * @option {Array} args   [command-line arguments]
   * ----------------------------------------------------
   * @property {String} relPath
   * @property {String} stem
   * @property {String} newActionSlug
   *
   * @property {String} newViewRelPath
   * @property {String} newActionRelPath
   * @property {String} newStylesheetRelPath
   * @property {String} newPageScriptRelPath
   */

  before: function (scope, exits) {
    if (!scope.args[0]) {
      return exits.error(
        'Porfavor especifique la ruta para la nueva página.\n'+
        '(relativo a `views/pages/`;\n'+
        ' ej. `cuenta/seguridad`)'
      );
    }

    // e.g. `dashboard/activity-summary`
    scope.relPath = scope.args[0];

    // Verificar si el archivo tiene extension, si la tiene, rechazar.
    if (path.extname(scope.relPath)) {
      return exits.error('Porfavor especifique la ruta de la nueva página, excluyendo la terminacion (ej. sin ".ejs")');
    }

    // Quitar espacios al inicio y final.
    scope.relPath = _.trim(scope.relPath);

    // Reemplazar diagonales invertidas.
    // (Crucial para compatibilidad con Windows.)
    scope.relPath = scope.relPath.replace(/\\/g, '/');

    // Verificar que no contenga diagonales al final.
    if (scope.relPath.match(/\/$/)) {
      return exits.error('PPorfavor especifique la ruta de la nueva página. (sin diagonal al final.)');
    }

    // Verficar que no inicie con / o con ../
    // (un ./ está bien, ya que se podria usar tab-completion en la terminal)
    if (scope.relPath.match(/^\.\.+\//) || scope.relPath.match(/^\//)) {
      return exits.error('No se necesitan ni puntos ni diagonales iniciales. Debe ser algo así: `cuenta/seguridad`');
    }

    // Asegurarse que la ruta relativa no esta en "pages/", "views/", "controllers/",
    // "assets/", "js/", "styles/", o alguno de esos.  Si lo está, probablemente
    // sea un accidente.  Y si no es accidente, es super confuso.
    if (scope.relPath.match(/^(pages\/|views\/|controllers\/|api\/|assets\/|js\/|styles\/)/i)) {
      return exits.error('Porfavor especifica *solo* la ruta relativa para la página, evita prefijos como "pages/", "views/", o "controllers/".  Esos serán agregados automáticamente-- solo necesitas incluir la última parte; ej. `dashboard/clientes` o  `admin/usuarios`');
    }

    // Ignorar dobles diagonales
    scope.relPath = scope.relPath.replace(/\/\/+/, '/');

    // Ignorar "./", si es que está presente.
    scope.relPath = scope.relPath.replace(/^[\.\/]+/, '');

    // Asegurarse que todos los folders internos sean kebab-cased y no contienen
    // mayusculas o caracteres no alfanumericos (excepto los permitidos, por supuesto)
    var parentSubFoldersString = path.dirname(scope.relPath);
    var arrayOfParentSubFolders = parentSubFoldersString==='.' ? [] : parentSubFoldersString.split(/\//);
    try {
      _.each(arrayOfParentSubFolders, (subFolderName) => {
        if (subFolderName !== _.kebabCase(subFolderName)) {
          throw new Error('Porfavor asegurate de que cuaquier subcarpeta estén escritas en forma "kebab-case"; ej. "internal-site/admin-dashboard/foobar", y no "internalSite/admin_dashboard/noHagasEsto/porfavor"');
        }
        if (subFolderName.match(/[^a-z0-9\-]/) || subFolderName !== _.deburr(subFolderName)){
          throw new Error('Solo caracteres alfanumericos y guiones.');
        }
      });//∞
    } catch (err) { return exits.error(err.message); }

    // Preparar el "stem" (nombre de lo que se va a generar).
    // (ej. `activity-summary`)
    var stem = path.basename(scope.relPath);

    // Hacerlo en kebab-case, si es que aún no lo está.
    // (ej. `activitySummary` se convierte en `activity-summary`)
    stem = _.kebabCase(stem);

    // Asegurarse que no inicia con "view"`.
    // (ej. no `view-activity-summary`)
    if (stem.match(/^view-/)) {
      return exits.error('No hay necesdidad de poner "view-" cuando se genera una página.  En su lugar, omite esa parte.  (Se agregará automáticamente.)');
    }

    // Verificar que el stem ya no contenga mayusculas o no alfanumericos
    if (stem.match(/[^a-z0-9\-]/) || stem !== _.deburr(stem)) {
      return exits.error('Solo caracteres alfanumericos y guiones.');
    }

    //Preparación de nombre y rutas
    scope.stem = stem;
    scope.newActionSlug = path.join(arrayOfParentSubFolders.join('/'), 'view-'+stem);
    scope.newActionRelPath = path.join('api/controllers/', scope.newActionSlug+'.js');
    scope.newViewRelPath = path.join('views/pages/', scope.relPath+'.ejs');
    scope.newStylesheetRelPath = path.join('assets/styles/pages/', scope.relPath+'.less');
    scope.newPageScriptRelPath = path.join('assets/js/pages/', scope.relPath+'.page.js');

    // Preparar el generador de actions2
    scope.actions2 = true;
    scope.args = [ scope.newActionSlug ];

    // Desactivar la salida: "Created a new …!" para que nosotros demos la nuestra.
    scope.suppressFinalLog = true;

    return exits.success();
  },

  //nuestro propio log al final
  after: function (scope, done){
    console.log();
    console.log('Generación completa!:');
    console.log(' •-',scope.newViewRelPath);
    console.log(' •-',scope.newActionRelPath);
    console.log(' •-',scope.newStylesheetRelPath);
    console.log(' •-',scope.newPageScriptRelPath);
    console.log();
    console.log('Recuerda...');
    console.log(' (1)  Estos archivos fuern generados asumiendo que usas AngularJS');
    console.log('      como framework en el frontend.');
    console.log();
    console.log(' (2)  Se necesita agregar manualmente la ruta de esta página a su');
    console.log('      acción en el archivo `config/routes.js` ; ej:');
    console.log('     \'GET /'+scope.relPath+'\':          { action: \''+(scope.newActionSlug.replace(/\\/g,'/'))+'\' },');
    console.log();
    console.log(' (3)  Se necesita insertar manualmente el archivo less en el archivo');
    console.log('      `assets/styles/importer.less`; ej.');
    console.log('      @import \''+(path.join('pages/', scope.relPath+'.less').replace(/\\/g,'/'))+'\';');
    console.log();
    console.log(' (4)  Por último, ya que todos estos cambios son en el back,');
    console.log('      no olvides re-iniciar sails para que se reflejen!');
    console.log();

    return done();
  },

  //archivos que se van a generar
  targets: {
    './': ['action'],// << generar una "action" default, esta renderiza la vista
    './:newViewRelPath': { //vista ejs
      // Como no se puede usar la plantilla para esto (debido a conflictos
      // por la plantilla .ejs), lo haremos manualmente en duro:
      exec: function(scope, done){
        return generateFile({
          rootPath: scope.rootPath,
          force: scope.force,
          contents:
            '<div id="'+scope.stem+'" ng-controller="'+scope.stem+'Controller" class="ng-cloak" ng-init="init()" ng-cloak > \n'+
            '\n'+
            '  <div class="container">\n'+
            '    <titulo-pagina>'+scope.stem+'</titulo-pagina>\n'+
            '    <p>(Ver también <em>'+scope.newStylesheetRelPath.replace(/\\/g,'/')+'</em>, <em>'+scope.newPageScriptRelPath.replace(/\\/g,'/')+'</em>, y <em>'+scope.newActionRelPath.replace(/\\/g,'/')+'</em>.)</p>\n'+
            '  </div>\n'+
            '\n'+
            '</div>\n'+
            '\n'+
            '<%- /* Exponer datos de variables del servidor como window.SAILS_LOCALS :: */ exposeLocalsToBrowser() %>\n'+
            '\n'
        }, done);
      }
    },
    './:newStylesheetRelPath': { template: 'stylesheet.less.template' }, //generamos la de estilos con la platilla integrada
    './:newPageScriptRelPath': { template: 'page-script.page.js.template' } //igual con el js del controller de angularjs
  }

};
