import { NgModule } from '@angular/core';

/**
 * Ce module est utilisé pour importer et configurer les bibliothèques externes comme Chess.js
 */
@NgModule({
  imports: [],
  exports: []
})
export class ExternalLibsModule {
  constructor() {
    // S'assurer que Chess.js est disponible globalement
    if (!(window as any).Chess) {
      console.warn('Chess.js n\'est pas disponible globalement. Certaines fonctionnalités peuvent ne pas fonctionner.');
    }
    
    // S'assurer que ChessBoard est disponible globalement
    if (!(window as any).ChessBoard) {
      console.warn('ChessBoard.js n\'est pas disponible globalement. Certaines fonctionnalités peuvent ne pas fonctionner.');
    }
  }
}