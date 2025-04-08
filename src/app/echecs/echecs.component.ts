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

    // Vérifier si c'est le tour du joueur actuel
    if (this.selectedPiece === null && piece) {
      const isWhitePiece = piece.charCodeAt(0) >= 9812 && piece.charCodeAt(0) <= 9817; // Blancs
      const isBlackPiece = piece.charCodeAt(0) >= 9818 && piece.charCodeAt(0) <= 9823; // Noirs

      if (
        (this.currentPlayer === 'white' && !isWhitePiece) ||
        (this.currentPlayer === 'black' && !isBlackPiece)
      ) {
        return; // Pas le tour de cette couleur
      }
    }

    if (this.selectedPiece) {
      // Déplacer la pièce
      this.movePiece(row, col);
    } else if (piece) {
      // Sélectionner une pièce
      this.selectedPiece = { row, col };
    }
  }

  movePiece(row: number, col: number) {
    if (!this.selectedPiece) return;

    const { row: fromRow, col: fromCol } = this.selectedPiece;

    // Valider le mouvement (simplifié, sans règles spécifiques)
    const piece = this.board[fromRow][fromCol];
    const targetPiece = this.board[row][col];

    if (this.isValidMove(fromRow, fromCol, row, col, piece)) {
      // Vérifier si une pièce est capturée
      if (targetPiece) {
        console.log(`Piece captured: ${targetPiece}`);
        if (this.currentPlayer === 'white') {
          this.capturedBlack.push(targetPiece);
        } else {
          this.capturedWhite.push(targetPiece);
        }
      }

      // Déplacer la pièce
      this.board[row][col] = piece;
      this.board[fromRow][fromCol] = '';
      this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    // Réinitialiser la sélection
    this.selectedPiece = null;
  }

  isValidMove(fromRow: number, fromCol: number, toRow: number, toCol: number, piece: string): boolean {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    const targetPiece = this.board[toRow][toCol];

    switch (piece) {
      case '♙': // White pawn
        if (fromRow === 6) {
          // First move: can move 1 or 2 squares forward
          if ((fromRow - toRow === 1 || fromRow - toRow === 2) && colDiff === 0 && !targetPiece) {
            return true;
          }
        }
        // Regular move: 1 square forward
        if (fromRow - toRow === 1 && colDiff === 0 && !targetPiece) {
          return true;
        }
        // Capture: 1 square diagonally forward
        if (fromRow - toRow === 1 && colDiff === 1 && targetPiece && targetPiece.charCodeAt(0) >= 9818) {
          return true;
        }
        return false;

      case '♟': // Black pawn
        if (fromRow === 1) {
          // First move: can move 1 or 2 squares forward
          if ((toRow - fromRow === 1 || toRow - fromRow === 2) && colDiff === 0 && !targetPiece) {
            return true;
          }
        }
        // Regular move: 1 square forward
        if (toRow - fromRow === 1 && colDiff === 0 && !targetPiece) {
          return true;
        }
        // Capture: 1 square diagonally forward
        if (toRow - fromRow === 1 && colDiff === 1 && targetPiece && targetPiece.charCodeAt(0) <= 9817) {
          return true;
        }
        return false;

      case '♖': // White rook
      case '♜': // Black rook
        return rowDiff === 0 || colDiff === 0;
      case '♘': // White knight
      case '♞': // Black knight
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      case '♗': // White bishop
      case '♝': // Black bishop
        return rowDiff === colDiff;
      case '♕': // White queen
      case '♛': // Black queen
        return rowDiff === colDiff || rowDiff === 0 || colDiff === 0;
      case '♔': // White king
      case '♚': // Black king
        return rowDiff <= 1 && colDiff <= 1;
      default:
        return false;
    }
  }

  onDifficultyChange() {
    // Placeholder for difficulty change logic
    console.log('Difficulty changed. Implement logic here.');
  }

  resetGame() {
    // Reset the game to its initial state
    this.initializeBoard();
    this.selectedPiece = null;
    this.currentPlayer = 'white';
  }
}
