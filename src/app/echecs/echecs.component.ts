import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-echecs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './echecs.component.html',
  styleUrls: ['./echecs.component.css']
})
export class EchecsComponent {
  board: string[][] = [];
  selectedPiece: { row: number; col: number } | null = null;
  currentPlayer: 'white' | 'black' = 'white';
  capturedWhite: string[] = [];
  capturedBlack: string[] = [];
  playerColor: 'white' | 'black' = 'white';
  hasSelectedColor = false;
  moveHistory: string[] = [];
  hasKingMoved = { white: false, black: false };
  hasRookMoved = {
    white: { kingside: false, queenside: false },
    black: { kingside: false, queenside: false }
  };
  lastMove: { piece: string; from: { row: number; col: number }; to: { row: number; col: number } } | null = null;

  private readonly PIECE_VALUES: { [key: string]: number } = {
    '♙': 1,  // White pawn
    '♖': 5,  // White rook
    '♘': 3,  // White knight
    '♗': 3,  // White bishop
    '♕': 9,  // White queen
    '♔': 100, // White king
    '♟': -1,  // Black pawn
    '♜': -5,  // Black rook
    '♞': -3,  // Black knight
    '♝': -3,  // Black bishop
    '♛': -9,  // Black queen
    '♚': -100 // Black king
  };

  private readonly POSITION_BONUS = {
    PAWN: [
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
      [0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5],
      [0.1,  0.1,  0.2,  0.3,  0.3,  0.2,  0.1,  0.1],
      [0.05, 0.05, 0.1,  0.25, 0.25, 0.1,  0.05, 0.05],
      [0.0,  0.0,  0.0,  0.2,  0.2,  0.0,  0.0,  0.0],
      [0.05, -0.05, -0.1, 0.0, 0.0, -0.1, -0.05, 0.05],
      [0.05, 0.1,  0.1,  -0.2, -0.2, 0.1,  0.1,  0.05],
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ],
    KNIGHT: [
      [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
      [-0.4, -0.2, 0.0,  0.0,  0.0,  0.0,  -0.2, -0.4],
      [-0.3, 0.0,  0.1,  0.15, 0.15, 0.1,  0.0,  -0.3],
      [-0.3, 0.05, 0.15, 0.2,  0.2,  0.15, 0.05, -0.3],
      [-0.3, 0.0,  0.15, 0.2,  0.2,  0.15, 0.0,  -0.3],
      [-0.3, 0.05, 0.1,  0.15, 0.15, 0.1,  0.05, -0.3],
      [-0.4, -0.2, 0.0,  0.05, 0.05, 0.0,  -0.2, -0.4],
      [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5]
    ]
  };

  constructor() {
    this.initializeBoard();
  }

  initializeBoard() {
    // Initialiser un plateau vide
    this.board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(''));

    // Placer les pièces (simplifié)
    this.board[0] = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];
    this.board[1] = Array(8).fill('♟');
    this.board[6] = Array(8).fill('♙');
    this.board[7] = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];

    console.log('Board initialized:', this.board);
  }

  onCellClick(row: number, col: number) {
    const piece = this.board[row][col];

    // If a piece is already selected
    if (this.selectedPiece) {
      // If clicking on the same piece, deselect it
      if (this.selectedPiece.row === row && this.selectedPiece.col === col) {
        this.selectedPiece = null;
        return;
      }
      // Try to move the selected piece
      this.movePiece(row, col);
      return;
    }

    // If no piece is selected and it's the player's turn
    if (this.currentPlayer === this.playerColor && piece) {
      const isWhitePiece = piece.charCodeAt(0) >= 9812 && piece.charCodeAt(0) <= 9817;
      // Only allow selecting pieces of the player's color
      if ((this.playerColor === 'white' && isWhitePiece) || 
          (this.playerColor === 'black' && !isWhitePiece)) {
        this.selectedPiece = { row, col };
      }
    }
  }

  isPathClear(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol] !== '') {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  isKingInCheck(color: 'white' | 'black'): boolean {
    // Trouver la position du roi
    let kingRow = -1;
    let kingCol = -1;
    const kingPiece = color === 'white' ? '♔' : '♚';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === kingPiece) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    // Vérifier si une pièce adverse peut atteindre le roi
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && this.isPieceOfColor(piece, color === 'white' ? 'black' : 'white')) {
          if (this.isValidMove(row, col, kingRow, kingCol, piece)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  isCheckmate(color: 'white' | 'black'): boolean {
    // Si le roi n'est pas en échec, ce n'est pas un échec et mat
    if (!this.isKingInCheck(color)) {
      return false;
    }

    // Pour chaque pièce de notre couleur
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && this.isPieceOfColor(piece, color)) {
          // Pour chaque case possible sur le plateau
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              // Si le mouvement est valide selon les règles de la pièce
              if (this.isValidMove(fromRow, fromCol, toRow, toCol, piece)) {
                // Faire le mouvement temporairement
                const targetPiece = this.board[toRow][toCol];
                this.board[toRow][toCol] = piece;
                this.board[fromRow][fromCol] = '';

                // Vérifier si ce mouvement sort de l'échec
                const stillInCheck = this.isKingInCheck(color);

                // Annuler le mouvement
                this.board[fromRow][fromCol] = piece;
                this.board[toRow][toCol] = targetPiece;

                // Si nous avons trouvé un mouvement qui sort de l'échec
                if (!stillInCheck) {
                  return false;
                }
              }
            }
          }
        }
      }
    }

    // Si aucun mouvement ne peut sauver le roi, c'est échec et mat
    return true;
  }

  isPieceOfColor(piece: string, color: 'white' | 'black'): boolean {
    const isWhitePiece = piece.charCodeAt(0) >= 9812 && piece.charCodeAt(0) <= 9817;
    return color === 'white' ? isWhitePiece : !isWhitePiece;
  }

  isValidMove(fromRow: number, fromCol: number, toRow: number, toCol: number, piece: string): boolean {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    const targetPiece = this.board[toRow][toCol];

    // Vérifier si la pièce cible est de la même couleur
    if (targetPiece && this.isPieceOfColor(targetPiece, this.isPieceOfColor(piece, 'white') ? 'white' : 'black')) {
      return false;
    }

    // Règles spécifiques pour chaque pièce
    switch (piece) {
      case '♙': // White pawn
        if (fromRow === 6) {
          if ((fromRow - toRow === 1 || fromRow - toRow === 2) && colDiff === 0 && !targetPiece) {
            return true;
          }
        }
        if (fromRow - toRow === 1 && (
          (colDiff === 0 && !targetPiece) ||
          (colDiff === 1 && targetPiece && !this.isPieceOfColor(targetPiece, 'white'))
        )) {
          return true;
        }
        return false;

      case '♟': // Black pawn
        if (fromRow === 1) {
          if ((toRow - fromRow === 1 || toRow - fromRow === 2) && colDiff === 0 && !targetPiece) {
            return true;
          }
        }
        if (toRow - fromRow === 1 && (
          (colDiff === 0 && !targetPiece) ||
          (colDiff === 1 && targetPiece && !this.isPieceOfColor(targetPiece, 'black'))
        )) {
          return true;
        }
        return false;

      case '♖': // White rook
      case '♜': // Black rook
        return (rowDiff === 0 || colDiff === 0) && this.isPathClear(fromRow, fromCol, toRow, toCol);

      case '♘': // White knight
      case '♞': // Black knight
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case '♗': // White bishop
      case '♝': // Black bishop
        return rowDiff === colDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);

      case '♕': // White queen
      case '♛': // Black queen
        return (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) && 
               this.isPathClear(fromRow, fromCol, toRow, toCol);

      case '♔': // White king
      case '♚': // Black king
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  }

  private isValidKingMove(fromRow: number, fromCol: number, toRow: number, toCol: number, piece: string): boolean {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    const isWhite = piece === '♔';
    
    // Normal king move
    if (rowDiff <= 1 && colDiff <= 1) {
      return true;
    }

    // Castling
    if (rowDiff === 0 && colDiff === 2 && !this.isKingInCheck(isWhite ? 'white' : 'black')) {
      const hasKingMoved = this.hasKingMoved[isWhite ? 'white' : 'black'];
      if (!hasKingMoved) {
        // Kingside castling
        if (toCol > fromCol && !this.hasRookMoved[isWhite ? 'white' : 'black'].kingside) {
          return this.isPathClear(fromRow, fromCol, toRow, 7) &&
                 !this.isSquareUnderAttack(fromRow, fromCol + 1, isWhite ? 'white' : 'black') &&
                 !this.isSquareUnderAttack(fromRow, fromCol + 2, isWhite ? 'white' : 'black');
        }
        // Queenside castling
        if (toCol < fromCol && !this.hasRookMoved[isWhite ? 'white' : 'black'].queenside) {
          return this.isPathClear(fromRow, fromCol, toRow, 0) &&
                 !this.isSquareUnderAttack(fromRow, fromCol - 1, isWhite ? 'white' : 'black') &&
                 !this.isSquareUnderAttack(fromRow, fromCol - 2, isWhite ? 'white' : 'black');
        }
      }
    }
    return false;
  }

  private isValidEnPassant(fromRow: number, fromCol: number, toRow: number, toCol: number, piece: string): boolean {
    if (!this.lastMove) {
      return false;
    }

    const isWhitePawn = piece === '♙';
    const direction = isWhitePawn ? -1 : 1;
    
    const isOpponentPawn = this.lastMove.piece === (isWhitePawn ? '♟' : '♙');
    const isDoublePawnMove = Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2;
    const isAdjacentRow = this.lastMove.to.row === fromRow;
    const isAdjacentCol = Math.abs(this.lastMove.to.col - fromCol) === 1;
    const isDiagonalForward = toRow === fromRow + direction;
    const isCorrectCapture = toCol === this.lastMove.to.col;

    return isOpponentPawn && isDoublePawnMove && isAdjacentRow && 
           isAdjacentCol && isDiagonalForward && isCorrectCapture;
  }

  private isSquareUnderAttack(row: number, col: number, color: 'white' | 'black'): boolean {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && this.isPieceOfColor(piece, color === 'white' ? 'black' : 'white')) {
          if (this.isValidMove(fromRow, fromCol, row, col, piece)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  movePiece(row: number, col: number) {
    if (!this.selectedPiece) return;

    const { row: fromRow, col: fromCol } = this.selectedPiece;
    const piece = this.board[fromRow][fromCol];
    const targetPiece = this.board[row][col];

    if (this.isValidMove(fromRow, fromCol, row, col, piece)) {
      // Record the move
      this.lastMove = { piece, from: { row: fromRow, col: fromCol }, to: { row, col } };

      // Handle castling
      if ((piece === '♔' || piece === '♚') && Math.abs(col - fromCol) === 2) {
        const isKingside = col > fromCol;
        const rookFromCol = isKingside ? 7 : 0;
        const rookToCol = isKingside ? col - 1 : col + 1;
        const rookPiece = this.board[fromRow][rookFromCol];
        this.board[fromRow][rookToCol] = rookPiece;
        this.board[fromRow][rookFromCol] = '';
      }

      // Handle en passant capture
      if ((piece === '♙' || piece === '♟') && Math.abs(fromCol - col) === 1 && !targetPiece) {
        const capturedRow = fromRow;
        const capturedPiece = this.board[capturedRow][col];
        this.board[capturedRow][col] = '';
        if (this.currentPlayer === 'white') {
          this.capturedBlack.push(capturedPiece);
        } else {
          this.capturedWhite.push(capturedPiece);
        }
      }

      // Update piece movement tracking
      if (piece === '♔') this.hasKingMoved.white = true;
      else if (piece === '♚') this.hasKingMoved.black = true;
      else if (piece === '♖') {
        if (fromCol === 0) this.hasRookMoved.white.queenside = true;
        else if (fromCol === 7) this.hasRookMoved.white.kingside = true;
      }
      else if (piece === '♜') {
        if (fromCol === 0) this.hasRookMoved.black.queenside = true;
        else if (fromCol === 7) this.hasRookMoved.black.kingside = true;
      }

      // Normal capture and move
      if (targetPiece) {
        if (this.currentPlayer === 'white') {
          this.capturedBlack.push(targetPiece);
        } else {
          this.capturedWhite.push(targetPiece);
        }
      }

      // Make the move
      this.board[row][col] = piece;
      this.board[fromRow][fromCol] = '';

      // Add to move history
      const moveNotation = `${piece}${String.fromCharCode(97 + fromCol)}${8 - fromRow}${targetPiece ? 'x' : '-'}${String.fromCharCode(97 + col)}${8 - row}`;
      this.moveHistory.push(moveNotation);

      // Vérifier l'échec et mat
      const nextPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
      if (this.isCheckmate(nextPlayer)) {
        alert(`Échec et mat ! ${this.currentPlayer === 'white' ? 'Les blancs' : 'Les noirs'} gagnent !`);
        this.resetGame();
        return;
      }

      // Vérifier l'échec
      if (this.isKingInCheck(nextPlayer)) {
        alert('Échec !');
      }

      this.currentPlayer = nextPlayer;

      if (this.currentPlayer !== this.playerColor) {
        setTimeout(() => this.makeAIMove(), 500);
      }
    }

    this.selectedPiece = null;
  }

  private isValidPawnMove(fromRow: number, fromCol: number, toRow: number, toCol: number, piece: string, targetPiece: string | undefined) {
    const colDiff = Math.abs(fromCol - toCol);
    const isWhite = piece === '♙';
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // First move: can move 1 or 2 squares forward
    if (fromRow === startRow && !targetPiece) {
      if (colDiff === 0) {
        if (toRow - fromRow === direction || toRow - fromRow === 2 * direction) {
          return true;
        }
      }
      return false;
    }

    // Regular move: 1 square forward
    if (!targetPiece && colDiff === 0 && toRow - fromRow === direction) {
      return true;
    }

    // Capture: 1 square diagonally forward
    if (targetPiece && colDiff === 1 && toRow - fromRow === direction) {
      const isWhitePiece = targetPiece.charCodeAt(0) >= 9812 && targetPiece.charCodeAt(0) <= 9817;
      return isWhite ? !isWhitePiece : isWhitePiece;
    }

    return false;
  }

  private evaluatePosition(): number {
    let score = 0;
    
    // Material evaluation
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          score += this.PIECE_VALUES[piece] || 0;
          
          // Position evaluation for pawns and knights
          if (piece === '♙') {
            score += this.POSITION_BONUS.PAWN[row][col];
          } else if (piece === '♟') {
            score -= this.POSITION_BONUS.PAWN[7-row][col];
          } else if (piece === '♘') {
            score += this.POSITION_BONUS.KNIGHT[row][col];
          } else if (piece === '♞') {
            score -= this.POSITION_BONUS.KNIGHT[7-row][col];
          }
        }
      }
    }
    
    return score;
  }

  makeAIMove() {
    const possibleMoves = this.getPossibleMovesForAI();
    
    if (possibleMoves.length > 0) {
      let bestMove;
      const isInCheck = this.isKingInCheck(this.currentPlayer);

      if (isInCheck) {
        // Filter moves that get out of check
        const validMoves = possibleMoves.filter(move => {
          const piece = this.board[move.fromRow][move.fromCol];
          // Try the move
          const originalTarget = this.board[move.toRow][move.toCol];
          this.board[move.toRow][move.toCol] = piece;
          this.board[move.fromRow][move.fromCol] = '';
          
          // Check if we're still in check
          const stillInCheck = this.isKingInCheck(this.currentPlayer);
          
          // Undo the move
          this.board[move.fromRow][move.fromCol] = piece;
          this.board[move.toRow][move.toCol] = originalTarget;
          
          return !stillInCheck;
        });

        if (validMoves.length > 0) {
          // Choose a random move that gets out of check
          bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        } else {
          // If no valid moves, it's checkmate
          alert(`Échec et mat ! ${this.currentPlayer === 'white' ? 'Les noirs' : 'Les blancs'} gagnent !`);
          this.resetGame();
          return;
        }
      } else {
        // Normal move evaluation if not in check
        // ... existing evaluation code ...
        bestMove = this.evaluateBestMove(possibleMoves);
      }

      // Execute the move
      const piece = this.board[bestMove.fromRow][bestMove.fromCol];
      const targetPiece = this.board[bestMove.toRow][bestMove.toCol];
      
      if (targetPiece) {
        if (this.currentPlayer === 'white') {
          this.capturedBlack.push(targetPiece);
        } else {
          this.capturedWhite.push(targetPiece);
        }
      }
      
      this.board[bestMove.toRow][bestMove.toCol] = piece;
      this.board[bestMove.fromRow][bestMove.fromCol] = '';
      
      // Add to move history
      const moveNotation = `${piece}${String.fromCharCode(97 + bestMove.fromCol)}${8 - bestMove.fromRow}${targetPiece ? 'x' : '-'}${String.fromCharCode(97 + bestMove.toCol)}${8 - bestMove.toRow}`;
      this.moveHistory.push(moveNotation);
      
      const nextPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
      
      // Check if the move puts the opponent in check or checkmate
      if (this.isKingInCheck(nextPlayer)) {
        if (this.isCheckmate(nextPlayer)) {
          alert(`Échec et mat ! ${this.currentPlayer === 'white' ? 'Les blancs' : 'Les noirs'} gagnent !`);
          this.resetGame();
          return;
        }
        alert('Échec !');
      }
      
      this.currentPlayer = nextPlayer;
      this.selectedPiece = null;
    }
  }

  private evaluateBestMove(moves: any[]) {
    const evaluatedMoves = moves.map(move => {
      const piece = this.board[move.fromRow][move.fromCol];
      const originalTarget = this.board[move.toRow][move.toCol];
      
      // Make temporary move
      this.board[move.toRow][move.toCol] = piece;
      this.board[move.fromRow][move.fromCol] = '';
      
      const score = this.evaluatePosition();
      
      // Undo move
      this.board[move.fromRow][move.fromCol] = piece;
      this.board[move.toRow][move.toCol] = originalTarget;
      
      return { ...move, score };
    });
    
    return this.playerColor === 'black' 
      ? evaluatedMoves.reduce((a, b) => a.score > b.score ? a : b)
      : evaluatedMoves.reduce((a, b) => a.score < b.score ? a : b);
  }

  private getPossibleMovesForAI(): { fromRow: number; fromCol: number; toRow: number; toCol: number }[] {
    const possibleMoves: { fromRow: number; fromCol: number; toRow: number; toCol: number }[] = [];
    const isAIWhite = this.playerColor === 'black';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          const isWhitePiece = piece.charCodeAt(0) >= 9812 && piece.charCodeAt(0) <= 9817;
          if ((isAIWhite && isWhitePiece) || (!isAIWhite && !isWhitePiece)) {
            for (let targetRow = 0; targetRow < 8; targetRow++) {
              for (let targetCol = 0; targetCol < 8; targetCol++) {
                if (this.isValidMove(row, col, targetRow, targetCol, piece)) {
                  possibleMoves.push({
                    fromRow: row,
                    fromCol: col,
                    toRow: targetRow,
                    toCol: targetCol
                  });
                }
              }
            }
          }
        }
      }
    }
    return possibleMoves;
  }

  private addValidMovesForPiece(
    row: number,
    col: number,
    piece: string,
    possibleMoves: { fromRow: number; fromCol: number; toRow: number; toCol: number }[]
  ) {
    for (let targetRow = 0; targetRow < 8; targetRow++) {
      for (let targetCol = 0; targetCol < 8; targetCol++) {
        if (this.isValidMove(row, col, targetRow, targetCol, piece)) {
          possibleMoves.push({ fromRow: row, fromCol: col, toRow: targetRow, toCol: targetCol });
        }
      }
    }
  }

  onDifficultyChange() {
    // Placeholder for difficulty change logic
    console.log('Difficulty changed. Implement logic here.');
  }

  startGame(color: 'white' | 'black') {
    this.playerColor = color;
    this.hasSelectedColor = true;
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.selectedPiece = null;
    this.hasKingMoved = { white: false, black: false };
    this.hasRookMoved = {
      white: { kingside: false, queenside: false },
      black: { kingside: false, queenside: false }
    };
    this.lastMove = null;
    
    this.initializeBoard();
    
    // Si le joueur choisit les noirs, l'IA (blancs) joue en premier
    if (this.playerColor === 'black') {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  resetGame() {
    this.hasSelectedColor = false;
    this.currentPlayer = 'white';
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.selectedPiece = null;
    this.initializeBoard();
  }

  setPlayerColor(color: 'white' | 'black') {
    this.playerColor = color;
    this.currentPlayer = 'white'; // Toujours commencer par les blancs
    this.resetGame();
  }
}
