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
export class EchecsComponent implements OnInit, AfterViewInit {  
  gameStarted = false;
  gameOver = false;
  selectedDifficulty = 'medium';
  selectedColor = 'white';
  game: any;
  position: string = 'start';
  board: any;
  moveHistory: string[] = [];
  capturedWhitePieces: string[] = [];
  capturedBlackPieces: string[] = [];
  currentPlayerTurn = 'white';
  message = '';

  difficultyOptions = [
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ];
  
  colorOptions = [
    { value: 'white', label: 'Blancs' },
    { value: 'black', label: 'Noirs' }
  ];

  constructor() { }
  
  ngOnInit(): void {
    this.initializeGame();
  }
  
  ngAfterViewInit(): void {
    console.log('Les dépendances sont chargées via index.html');
  }
  
  initializeGame(): void {
    this.game = null;
    this.message = 'Choisissez les options et commencez une partie';
  }  
  
  async startGame(): Promise<void> {
    this.message = 'Chargement du jeu...';
    try {
      if (!(window as any).Chess) {
        throw new Error('Chess.js n\'est pas disponible après chargement');
      }
      
      this.gameStarted = true;
      this.gameOver = false;
      this.game = new (window as any).Chess();
      console.log('Jeu d\'échecs initialisé:', this.game);
      this.currentPlayerTurn = 'white';
      
      setTimeout(() => {
        this.initializeBoard();
        
        if (this.selectedColor === 'white') {
          this.message = 'À votre tour de jouer (Blancs)';
        } else {
          this.message = 'L\'ordinateur réfléchit (Blancs)...';
        }
        
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
  }  
  
  initializeBoard(): void {
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
        moveSpeed: 200,
        snapbackSpeed: 100,
        snapSpeed: 100,
        trashSpeed: 100,
        pieceTheme: 'assets/libs/img/chesspieces/wikipedia/{piece}.png'
      };

      this.board = ChessBoardLib('board', config);
      console.log('Plateau initialisé:', this.board);
    } catch (e) {
      console.error('Erreur lors de l\'initialisation du plateau:', e);
      this.message = 'Erreur d\'initialisation du plateau';
    }
    
    if (this.selectedColor === 'black' && this.currentPlayerTurn === 'white') {
      setTimeout(() => {
        this.makeBestMove(this.selectedDifficulty);
      }, 300);
    }
  }
  
  onDragStart(source: any, piece: any, position: any, orientation: any): boolean {
    return !this.game.game_over() &&
           ((this.selectedColor === 'white' && this.currentPlayerTurn === 'white' && piece.search(/^w/) !== -1) ||
            (this.selectedColor === 'black' && this.currentPlayerTurn === 'black' && piece.search(/^b/) !== -1));
  }  
  
  onDrop(source: any, target: any): string {
    console.log(`Tentative de déplacement de ${source} vers ${target}`);
    try {
      const move = this.game.move({
        from: source,
        to: target,
        promotion: 'q'
      });
      
      console.log('Résultat du mouvement:', move);
      if (move === null) {
        console.warn('Mouvement invalide');
        return 'snapback';
      }
      
      if (move.captured) {
        const capturedPiece = move.captured;
        const pieceColor = move.color === 'w' ? 'black' : 'white';
        let pieceSymbol = this.getPieceSymbol(capturedPiece, pieceColor === 'white');
        
        if (pieceColor === 'white') {
          this.capturedWhitePieces.push(pieceSymbol);
        } else {
          this.capturedBlackPieces.push(pieceSymbol);
        }
      }
      
      this.moveHistory.push(`${this.moveHistory.length + 1}. ${move.san}`);
      console.log('Historique mis à jour:', this.moveHistory);
      
      this.currentPlayerTurn = this.currentPlayerTurn === 'white' ? 'black' : 'white';
      console.log('Tour actuel:', this.currentPlayerTurn);
      
      this.checkGameStatus();
      
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
  
  makeBestMove(difficulty: string): void {
    if (this.game.game_over()) return;
    
    let thinkingTime = 300;
    if (difficulty === 'medium') {
      thinkingTime = 600;
    } else if (difficulty === 'hard') {
      thinkingTime = 1000;
    }
    
    this.message = 'L\'ordinateur réfléchit...';
    
    setTimeout(() => {
      try {
        const moveDetails = this.getAllPossibleMovesWithDetails();
        let selectedMove;
        
        if (difficulty === 'easy') {
          selectedMove = this.selectRandomMove(moveDetails);
        } else if (difficulty === 'medium') {
          selectedMove = this.selectMediumMove(moveDetails);
        } else {
          selectedMove = this.selectHardMove(moveDetails);
        }
        
        const move = this.game.move({
          from: selectedMove.from,
          to: selectedMove.to,
          promotion: selectedMove.promotion || 'q'
        });
        
        this.board.position(this.game.fen());
        
        if (move.captured) {
          const capturedPiece = move.captured;
          const pieceColor = move.color === 'w' ? 'black' : 'white';
          let pieceSymbol = this.getPieceSymbol(capturedPiece, pieceColor === 'white');
          
          if (pieceColor === 'white') {
            this.capturedWhitePieces.push(pieceSymbol);
          } else {
            this.capturedBlackPieces.push(pieceSymbol);
          }
        }
        
        this.moveHistory.push(`${this.moveHistory.length + 1}. ${move.san}`);
        this.currentPlayerTurn = this.currentPlayerTurn === 'white' ? 'black' : 'white';
        this.checkGameStatus();
      } catch (error) {
        console.error('Erreur lors du calcul du coup de l\'ordinateur:', error);
        
        const moves = this.game.moves();
        const moveIndex = Math.floor(Math.random() * moves.length);
        const move = this.game.move(moves[moveIndex]);
        
        this.board.position(this.game.fen());
        this.currentPlayerTurn = this.currentPlayerTurn === 'white' ? 'black' : 'white';
        this.checkGameStatus();
      }
    }, thinkingTime);
  }
  
  checkGameStatus(): void {
    const playerColor = this.selectedColor;
    const isPlayerTurn = (this.currentPlayerTurn === playerColor);
    const currentColorLabel = this.currentPlayerTurn === 'white' ? 'Blancs' : 'Noirs';
    
    if (this.game.in_checkmate()) {
      const winnerColor = this.currentPlayerTurn === 'white' ? 'black' : 'white';
      const winnerColorLabel = winnerColor === 'white' ? 'Blancs' : 'Noirs';
      const playerWon = (winnerColor === playerColor);
      this.message = playerWon ? 
        `Vous avez gagné par échec et mat! (${winnerColorLabel})` : 
        `L'ordinateur a gagné par échec et mat! (${winnerColorLabel})`;
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
        `Vous êtes en échec! (${currentColorLabel})` : 
        `L'ordinateur est en échec! (${currentColorLabel})`;
    } else {
      this.message = isPlayerTurn ? 
        `À votre tour de jouer (${currentColorLabel})` : 
        `L'ordinateur réfléchit...`;
    }
  }
  
  getPieceSymbol(pieceType: string, isWhite: boolean): string {
    const pieceSymbols: { [key: string]: [string, string] } = {
      'p': ['♙', '♟'],
      'n': ['♘', '♞'],
      'b': ['♗', '♝'],
      'r': ['♖', '♜'],
      'q': ['♕', '♛'],
      'k': ['♔', '♚']
    };
    
    return pieceSymbols[pieceType][isWhite ? 0 : 1];
  }
  
  getAllPossibleMovesWithDetails(): any[] {
    const moves = this.game.moves({ verbose: true });
    return moves.map((move: any) => {
      const gameCopy = new (window as any).Chess(this.game.fen());
      gameCopy.move(move);
      
      let score = 0;
      
      if (move.captured) {
        const pieceValues: { [key: string]: number } = {
          'p': 1,
          'n': 3,
          'b': 3,
          'r': 5,
          'q': 9,
          'k': 0
        };
        score += pieceValues[move.captured] * 10;
      }
      
      if (gameCopy.in_check()) {
        score += 5;
        if (gameCopy.in_checkmate()) {
          score += 1000;
        }
      }
      
      if (this.isPieceUnderThreat(gameCopy, move.to)) {
        const pieceAtDest = this.game.get(move.to);
        if (pieceAtDest) {
          const pieceValues: { [key: string]: number } = {
            'p': 1,
            'n': 3,
            'b': 3,
            'r': 5,
            'q': 9,
            'k': 100
          };
          
          score -= pieceValues[pieceAtDest.type] * 8;
        }
      }
      
      return {
        ...move,
        score: score
      };
    });
  }

  isPieceUnderThreat(game: any, square: string): boolean {
    const turn = game.turn();
    const opponentColor = turn === 'w' ? 'b' : 'w';
    
    const oldTurn = game.turn();
    game.turn = () => opponentColor;
    const opponentMoves = game.moves({ verbose: true });
    game.turn = () => oldTurn;
    
    return opponentMoves.some((move: any) => move.to === square);
  }

  selectRandomMove(moves: any[]): any {
    const index = Math.floor(Math.random() * moves.length);
    return moves[index];
  }

  selectMediumMove(moves: any[]): any {
    const sortedMoves = [...moves].sort((a, b) => b.score - a.score);
    
    if (Math.random() < 0.7) {
      const goodMovesCount = Math.max(1, Math.floor(sortedMoves.length * 0.4));
      const index = Math.floor(Math.random() * goodMovesCount);
      return sortedMoves[index];
    } 
    else {
      return this.selectRandomMove(moves);
    }
  }

  selectHardMove(moves: any[]): any {
    const sortedMoves = [...moves].sort((a, b) => b.score - a.score);
    
    if (Math.random() < 0.9) {
      const topMovesCount = Math.max(1, Math.floor(sortedMoves.length * 0.25));
      const index = Math.floor(Math.random() * topMovesCount);
      return sortedMoves[index];
    } 
    else {
      const goodMovesCount = Math.max(1, Math.floor(sortedMoves.length * 0.5));
      const index = Math.floor(Math.random() * goodMovesCount);
      return sortedMoves[index];
    }
  }
}
