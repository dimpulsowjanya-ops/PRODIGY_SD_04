from flask import Flask, render_template, request, jsonify
import copy

app = Flask(__name__)


def is_valid(board, row, col, num):

    # Row check
    for x in range(9):
        if board[row][x] == num:
            return False

    # Column check
    for x in range(9):
        if board[x][col] == num:
            return False

    # 3x3 box check
    start_row = row - row % 3
    start_col = col - col % 3

    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False

    return True


def solve(board):

    for row in range(9):
        for col in range(9):

            if board[row][col] == 0:

                for num in range(1, 10):

                    if is_valid(
                        board,
                        row,
                        col,
                        num
                    ):

                        board[row][col] = num

                        if solve(board):
                            return True

                        board[row][col] = 0

                return False

    return True


@app.route('/')
def home():
    return render_template(
        'index.html'
    )


@app.route('/solve', methods=['POST'])
def solve_sudoku():

    data = request.json
    board = data['board']

    solved_board = copy.deepcopy(board)

    if solve(solved_board):

        return jsonify({
            "solution":
            solved_board
        })

    return jsonify({
        "error":
        "No solution found"
    })


if __name__ == '__main__':
    app.run(debug=True)