(function () {
	'use strict';

	const pieces = [...document.querySelectorAll('.puzzle-game > img')];
	const clickScore = document.getElementById('clicks');
	const soundButton = document.getElementById('toggle-audio');
	let shuffledPieces = pieces;
	const hiddenPiece = pieces[6];
	let clickCount = 0;
	let isDone = true;
	let audio = false;
	const success = new Audio('success.mp3');
	const fail = new Audio('fail.mp3');

	/// =============================================================================================
	/// see https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	/// =============================================================================================
	const shuffle = function(array) {
		let currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex !== 0) {
		// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	};

	/// =============================================================================================
	/// update the grid area of every piece of the puzzle
	/// =============================================================================================
	const updatePositions = function() {
		shuffledPieces.forEach((piece) => {
			piece.parentNode.appendChild(piece);
		});
	};

	const highlightMoveablePieces = function() {
		const indexOfHiddenPiece = shuffledPieces.indexOf(hiddenPiece);
		const rowOfHiddenPiece = Math.floor(indexOfHiddenPiece / 3);
		const colOfHiddenPiece = indexOfHiddenPiece % 3;

		for (const piece of pieces) {
			const indexOfCurrentPiece = shuffledPieces.indexOf(piece);
			const rowOfCurrentPiece = Math.floor(indexOfCurrentPiece / 3);
			const colOfCurrentPiece = indexOfCurrentPiece % 3;

			if ((colOfCurrentPiece === colOfHiddenPiece && Math.abs(rowOfHiddenPiece - rowOfCurrentPiece) === 1) ||
            (rowOfCurrentPiece === rowOfHiddenPiece && Math.abs(colOfHiddenPiece - colOfCurrentPiece) === 1)
			) {
				piece.style.outline = '2px solid white';
				piece.classList.add('piece-is-moveable');
			} else {
				piece.style.outline = 'none';
				piece.classList.remove('piece-is-moveable');
			}
		}
	};

	const reset = function() {
		isDone = false;
		hiddenPiece.style.opacity = '0';

		clickCount = 0;
		shuffledPieces = shuffle([...pieces]);
		updatePositions();
		highlightMoveablePieces();
	};

	/// =============================================================================================
	/// checks whether all pieces are in the correct order
	/// =============================================================================================
	const checkIfHasWon = function() {
		const hasWon = shuffledPieces.every((piece, index) => {
			return (pieces[index] === piece);
		});
		if (hasWon) {
			if (clickCount === 0) {
				reset();
			} else {
				isDone = true;
				hiddenPiece.style.opacity = '1';
				// ADD SOMETHING TO CONGRATULATE!!
			}
		}
	};

	const updateToggleButtonText = function(audioText) {
		const span = soundButton.querySelector('span');
		span.innerText = audioText;
	};

	const toggleAudio = function() {
		let audioText = '';
		switch (audio) {
			case true: {
				audio = false;
				audioText = 'on';
				break;
			}
			default: {
				audio = true;
				audioText = 'off';
				break;
			}
		}
		updateToggleButtonText(audioText);
	};

	const say = function(statement) {
		if (window.speechSynthesis.speak) {
			window.speechSynthesis.speak(new SpeechSynthesisUtterance(statement));
		}
	};

	const whereIsHiddenPiece = function(requested) {
		const indexOfHiddenPiece = shuffledPieces.indexOf(hiddenPiece);
		const colOfHiddenPiece = (indexOfHiddenPiece % 3) + 1;
		const rowOfHiddenPiece = (Math.floor(indexOfHiddenPiece / 3)) + 1;

		if (requested) {
			say(`The hidden piece is in row ${rowOfHiddenPiece} and in column ${colOfHiddenPiece}`);
		}
	};

	const currentState = function(requested) {
		let row1 = 'Row1: ';
		let row2 = 'Row2: ';
		let row3 = 'Row3: ';

		shuffledPieces.forEach((piece, index) => {
			switch (true) {
				case (index <= 2): {
					row1 += `${piece.getAttribute('aria-label')} `;
					break;
				}
				case (index > 2 && index <= 5): {
					row2 += `${piece.getAttribute('aria-label')} `;
					break;
				}
				default: {
					row3 += `${piece.getAttribute('aria-label')} `;
					break;
				}
			}
		});

		if (requested) {
			say(row1);
			say(row2);
			say(row3);
		}
	};

	const whereAreTheMoveablePieces = function() {
		let speech = 'Tiles that can move: ';
		const tiles = document.querySelectorAll('.piece-is-moveable');
		tiles.forEach((tile) => {
			speech += `Tile ${tile.getAttribute('aria-label')} `;
		});
		say(speech);
	};

	/// =============================================================================================
	/// attempts to swap the clicked piece with the hidden piece
	/// =============================================================================================
	const trySwapWithHiddenPiece = function() {
		const clickedPiece = this;
		clickedPiece.focus();

		const indexOfHiddenPiece = shuffledPieces.indexOf(hiddenPiece);
		const indexOfClickedPiece = shuffledPieces.indexOf(clickedPiece);
		const rowOfHiddenPiece = Math.floor(indexOfHiddenPiece / 3);
		const colOfHiddenPiece = indexOfHiddenPiece % 3;
		const rowOfClickedPiece = Math.floor(indexOfClickedPiece / 3);
		const colOfClickedPiece = indexOfClickedPiece % 3;

		const isMoveValid = (
			false ||
        (colOfClickedPiece === colOfHiddenPiece && Math.abs(rowOfHiddenPiece - rowOfClickedPiece) === 1) ||
        (rowOfClickedPiece === rowOfHiddenPiece && Math.abs(colOfHiddenPiece - colOfClickedPiece) === 1)
		);

		if (isMoveValid && !isDone) {
			clickCount++;
			clickScore.textContent = clickCount;
			shuffledPieces[indexOfHiddenPiece] = clickedPiece;
			shuffledPieces[indexOfClickedPiece] = hiddenPiece;

			if (audio) {
				success.play();
			}

			updatePositions();
			highlightMoveablePieces();
			checkIfHasWon();
		} else if (audio) {
			fail.play();
		}
	};

	const handleKeyDown = function(event) {
		const indexOfHiddenPiece = shuffledPieces.indexOf(hiddenPiece);
		const rowOfHiddenPiece = Math.floor(indexOfHiddenPiece / 3);
		const colOfHiddenPiece = indexOfHiddenPiece % 3;

		switch (event.key) {
			case 'Down': case 'ArrowDown': {
				const rowOfClickedPiece = rowOfHiddenPiece - 1;
				const colOfClickedPiece = colOfHiddenPiece;
				const indexOfClickedPiece = (rowOfClickedPiece * 3) + colOfClickedPiece;
				break;
			}
			case 'Up': case 'ArrowUp': {
				const rowOfClickedPiece = rowOfHiddenPiece + 1;
				const colOfClickedPiece = colOfHiddenPiece;
				const indexOfClickedPiece = (rowOfClickedPiece * 3) + colOfClickedPiece;
				break;
			}
			case 'Right': case 'ArrowRight': {
				const rowOfClickedPiece = rowOfHiddenPiece;
				const colOfClickedPiece = colOfHiddenPiece - 1;
				const indexOfClickedPiece = (rowOfClickedPiece * 3) + colOfClickedPiece;
				break;
			}
			case 'Left': case 'ArrowLeft': {
				const rowOfClickedPiece = rowOfHiddenPiece;
				const colOfClickedPiece = colOfHiddenPiece + 1;
				const indexOfClickedPiece = (rowOfClickedPiece * 3) + colOfClickedPiece;
				break;
			}
			case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9': {
				const clickedPiece = document.getElementById(`piece-${parseInt(event.key)}`);
				const indexOfClickedPiece = shuffledPieces.indexOf(clickedPiece);
				break;
			}
			case 'c': {
				currentState(true);
				break;
			}
			case 'h': {
				whereIsHiddenPiece(true);
				break;
			}
			case 'm': {
				whereAreTheMoveablePieces(true);
				break;
			}
			default: {
				break;
			}
		}

		const clickedPiece = shuffledPieces[indexOfClickedPiece];
		if (clickedPiece) {
			trySwapWithHiddenPiece.call(clickedPiece, event);
		}
	};

	const playAudio = function(audioVar) {
		if (window.currentlyPlaying) {
			window.currentlyPlaying.pause();
		}
		window.currentlyPlaying = audioVar.target;
	};

	// Attach listeners
	addEventListener('keydown', handleKeyDown);
	addEventListener('play', playAudio, true);
	soundButton.addEventListener('click', toggleAudio);

	for (const piece of pieces) {
		piece.addEventListener('click', trySwapWithHiddenPiece);
		piece.addEventListener('keypress', trySwapWithHiddenPiece);
	}

	// Init
	reset();
	updatePositions();
}());