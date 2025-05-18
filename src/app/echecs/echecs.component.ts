import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-echecs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './echecs.component.html',
  styleUrls: ['./echecs.component.css']
})
export class EchecsComponent implements OnInit, AfterViewInit {  gameStarted = false;
  gameOver = false;
  selectedDifficulty = 'medium'; // Par défaut
  selectedColor = 'white'; // Par défaut, le joueur joue les blancs
  game: any;
  position: string = 'start';
  board: any;
  moveHistory: string[] = [];
  capturedWhitePieces: string[] = []; // Pièces blanches capturées
  capturedBlackPieces: string[] = []; // Pièces noires capturées
  currentPlayerTurn = 'white';
  message = '';

  // Options de difficulté
  difficultyOptions = [
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ];
  
  // Options de couleur
  colorOptions = [
    { value: 'white', label: 'Blancs' },
    { value: 'black', label: 'Noirs' }
  ];

  constructor() { }
  ngOnInit(): void {
    this.initializeGame();
  }
    ngAfterViewInit(): void {
    // Charger dynamiquement les bibliothèques nécessaires
    this.loadDependencies().then(() => {
      console.log('Toutes les dépendances sont chargées');
    }).catch(() => {
      this.message = 'Impossible de charger les bibliothèques d\'échecs';
    });
  }
  initializeGame(): void {
    // Ne pas initialiser le jeu, juste préparer l'état
    this.game = null;
    this.message = 'Choisissez les options et commencez une partie';
  }  async startGame(): Promise<void> {
    this.message = 'Chargement du jeu...';
    
    try {
      // S'assurer que toutes les dépendances sont chargées
      await this.loadDependencies();
      
      // Vérifier que Chess.js est disponible
      if (!(window as any).Chess) {
        throw new Error('Chess.js n\'est pas disponible après chargement');
      }
      
      this.gameStarted = true;
      this.gameOver = false;
      
      // Initialiser le jeu d'échecs
      this.game = new (window as any).Chess();
      console.log('Jeu d\'échecs initialisé:', this.game);
      this.currentPlayerTurn = 'white'; // Le blanc commence toujours aux échecs
      
      // Initialiser le plateau
      setTimeout(() => {
        this.initializeBoard();
        if (this.selectedColor === 'black' && this.currentPlayerTurn === 'white') {
          setTimeout(() => {
            this.makeBestMove(this.selectedDifficulty);
          }, 300);
        }
      }, 100);
      
    } catch (e) {
      console.error('Erreur d\'initialisation du jeu:', e);
      this.message = 'Erreur d\'initialisation du jeu d\'échecs';
      this.gameStarted = false;
    }
  }
  resetGame(): void {
    this.gameStarted = false;
    this.gameOver = false;
    this.moveHistory = [];
    this.capturedWhitePieces = [];
    this.capturedBlackPieces = [];
    this.message = '';
    this.currentPlayerTurn = 'white';
  }  initializeBoard(): void {
    // Assurons-nous que ChessBoard et jQuery sont bien disponibles
    if (!(window as any).ChessBoard || !(window as any).$) {
      console.error('ChessBoard ou jQuery non disponible');
      this.message = 'Erreur: Bibliothèque d\'échecs non chargée';
      return;
    }
    
    const ChessBoardLib = (window as any).ChessBoard;
    
    try {
      const config = {
        draggable: true,
        position: 'start',
        orientation: this.selectedColor,
        onDragStart: this.onDragStart.bind(this),
        onDrop: this.onDrop.bind(this),
        onSnapEnd: this.onSnapEnd.bind(this),
        moveSpeed: 200, // Vitesse d'animation des déplacements
        snapbackSpeed: 100, // Vitesse de retour en cas de coup invalide
        snapSpeed: 100, // Vitesse d'ajustement de positionnement
        trashSpeed: 100, // Vitesse d'animation des captures
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
      };

      // Créer le plateau avec ChessBoard
      this.board = ChessBoardLib('board', config);
      console.log('Plateau initialisé:', this.board);
    } catch (e) {
      console.error('Erreur lors de l\'initialisation du plateau:', e);
      this.message = 'Erreur d\'initialisation du plateau';
    }
    
    // Si le joueur a choisi les noirs, l'ordinateur (blancs) doit jouer en premier
    if (this.selectedColor === 'black' && this.currentPlayerTurn === 'white') {
      setTimeout(() => {
        this.makeBestMove(this.selectedDifficulty);
      }, 300);
    }
  }
  onDragStart(source: any, piece: any, position: any, orientation: any): boolean {
    // Permet uniquement de déplacer ses propres pièces et uniquement quand c'est son tour
    return !this.game.game_over() &&
           ((this.selectedColor === 'white' && this.currentPlayerTurn === 'white' && piece.search(/^w/) !== -1) ||
            (this.selectedColor === 'black' && this.currentPlayerTurn === 'black' && piece.search(/^b/) !== -1));
  }  onDrop(source: any, target: any): string {
    console.log(`Tentative de déplacement de ${source} vers ${target}`);
    // Vérifier si le mouvement est légal
    try {
      const move = this.game.move({
        from: source,
        to: target,
        promotion: 'q' // Promouvoir toujours en reine pour simplifier
      });
      
      console.log('Résultat du mouvement:', move);
        if (move === null) {
        console.warn('Mouvement invalide');
        return 'snapback';
      }
      
      // Vérifier s'il y a eu une capture
      if (move.captured) {
        const capturedPiece = move.captured; // Pièce capturée (p, n, b, r, q)
        const pieceColor = move.color === 'w' ? 'black' : 'white'; // La couleur de la pièce capturée
        
        // Transformer le code en symbole Unicode pour l'affichage
        let pieceSymbol = this.getPieceSymbol(capturedPiece, pieceColor === 'white');
        
        // Ajouter la pièce capturée à la liste appropriée
        if (pieceColor === 'white') {
          this.capturedWhitePieces.push(pieceSymbol);
        } else {
          this.capturedBlackPieces.push(pieceSymbol);
        }
      }
      
      this.moveHistory.push(`${this.moveHistory.length + 1}. ${move.san}`);
      console.log('Historique mis à jour:', this.moveHistory);
      
      // Changer le tour en fonction de qui a joué
      this.currentPlayerTurn = this.currentPlayerTurn === 'white' ? 'black' : 'white';
      console.log('Tour actuel:', this.currentPlayerTurn);
      
      // Vérifier si le jeu est terminé
      this.checkGameStatus();
      
      // Si le jeu n'est pas terminé et c'est le tour de l'ordinateur, faire jouer l'ordinateur
      if (!this.gameOver && 
          ((this.selectedColor === 'white' && this.currentPlayerTurn === 'black') || 
           (this.selectedColor === 'black' && this.currentPlayerTurn === 'white'))) {
        console.log('L\'ordinateur va jouer...');
        setTimeout(() => {
          this.makeBestMove(this.selectedDifficulty);
        }, 250);
      }
      
      return '';
    } catch (e: unknown) {
      console.error('Erreur lors du déplacement:', e);
      this.message = 'Erreur de déplacement';
      return 'snapback';
    }
  }

  onSnapEnd(): void {
    this.board.position(this.game.fen());
  }
  // Méthode simulée pour faire jouer l'ordinateur selon la difficulté choisie
  makeBestMove(difficulty: string): void {
    if (this.game.game_over()) return;
    
    // Simulons un délai de réflexion selon la difficulté
    let thinkingTime = 300; // Default for easy
    if (difficulty === 'medium') {
      thinkingTime = 600;
    } else if (difficulty === 'hard') {
      thinkingTime = 1000;
    }
    
    setTimeout(() => {
      const moves = this.game.moves();
      
      // L'IA choisit un coup selon la difficulté
      let moveIndex;
      if (difficulty === 'easy') {
        moveIndex = Math.floor(Math.random() * moves.length);
      } else if (difficulty === 'medium') {
        // Un peu plus intelligent, exclut certains coups "mauvais"
        const goodMoves = moves.filter((m: string) => !m.includes('x')); // Évite les captures si possible
        moveIndex = Math.floor(Math.random() * (goodMoves.length ?? moves.length));      if (goodMoves.length) {
          this.game.move(goodMoves[moveIndex]);
        } else {
          this.game.move(moves[Math.floor(Math.random() * moves.length)]);
        }
        this.board.position(this.game.fen());
        // Changer le tour
        this.currentPlayerTurn = this.currentPlayerTurn === 'white' ? 'black' : 'white';
        this.checkGameStatus();
        return;
      } else {
        // Difficile - choix plus stratégique (simulation simplifiée)
        moveIndex = Math.floor(Math.random() * moves.length / 2); // Préfère les "meilleurs" coups
      }      // Effectuer le mouvement
      const move = this.game.move(moves[moveIndex]);
      this.board.position(this.game.fen());
      
      // Vérifier s'il y a eu une capture
      if (move.captured) {
        const capturedPiece = move.captured;
        const pieceColor = move.color === 'w' ? 'black' : 'white';
        
        // Transformer le code en symbole Unicode
        let pieceSymbol = this.getPieceSymbol(capturedPiece, pieceColor === 'white');
        
        // Ajouter la pièce capturée à la liste appropriée
        if (pieceColor === 'white') {
          this.capturedWhitePieces.push(pieceSymbol);
        } else {
          this.capturedBlackPieces.push(pieceSymbol);
        }
      }
      
      this.moveHistory.push(`${this.moveHistory.length + 1}. ${move.san}`);
      
      // Changer le tour
      this.currentPlayerTurn = this.currentPlayerTurn === 'white' ? 'black' : 'white';
      this.checkGameStatus();
    }, thinkingTime);
  }
  checkGameStatus(): void {
    const playerColor = this.selectedColor;
    const isPlayerTurn = (this.currentPlayerTurn === playerColor);
    
    if (this.game.in_checkmate()) {
      // Si le joueur actuel est en échec et mat, l'autre a gagné
      const winnerColor = this.currentPlayerTurn === 'white' ? 'black' : 'white';
      const playerWon = (winnerColor === playerColor);
      this.message = playerWon ? 
        'Vous avez gagné par échec et mat!' : 
        'L\'ordinateur a gagné par échec et mat!';
      this.gameOver = true;
    } else if (this.game.in_draw()) {
      this.message = 'Partie nulle!';
      this.gameOver = true;
    } else if (this.game.in_stalemate()) {
      this.message = 'Pat! La partie est nulle.';
      this.gameOver = true;
    } else if (this.game.in_threefold_repetition()) {
      this.message = 'Nulle par triple répétition!';
      this.gameOver = true;
    } else if (this.game.in_check()) {
      this.message = isPlayerTurn ? 
        'Vous êtes en échec!' : 
        'L\'ordinateur est en échec!';
    } else {
      this.message = isPlayerTurn ? 
        'À votre tour' : 
        'L\'ordinateur réfléchit...';
    }
  }
  loadScript(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        console.log(`Script ${url} chargé avec succès`);
        resolve();
      };
      script.onerror = () => {
        const error = new Error(`Échec du chargement du script ${url}`);
        console.error(error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  }
  
  loadCss(url: string): void {
    // Vérifier si le CSS est déjà chargé
    if (document.querySelector(`link[href="${url}"]`)) {
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
    console.log(`CSS ${url} chargé`);
  }
  
  async loadDependencies(): Promise<void> {
    try {
      // Charger jQuery en premier s'il n'est pas déjà chargé
      if (!(window as any).$) {
        await this.loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
      }
      
      // Ensuite charger Chess.js
      if (!(window as any).Chess) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.2/chess.min.js');
      }
      
      // Enfin charger ChessBoard.js qui dépend des deux autres
      if (!(window as any).ChessBoard) {
        await this.loadScript('https://chessboardjs.com/js/chessboard.min.js');
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors du chargement des dépendances:', error);
      this.message = 'Erreur de chargement des bibliothèques d\'échecs';
      return Promise.reject(new Error('Erreur de chargement des dépendances'));
    }
  }
  getPieceSymbol(pieceType: string, isWhite: boolean): string {
    const pieceSymbols: { [key: string]: [string, string] } = {
      'p': ['♙', '♟'], // Pion (blanc, noir)
      'n': ['♘', '♞'], // Cavalier
      'b': ['♗', '♝'], // Fou
      'r': ['♖', '♜'], // Tour
      'q': ['♕', '♛'], // Dame
      'k': ['♔', '♚']  // Roi
    };
    
    return pieceSymbols[pieceType][isWhite ? 0 : 1];
  }
}
