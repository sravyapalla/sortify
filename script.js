let array = [];
let audioCtx = null;

function playNote(freq) {
    if (audioCtx === null) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const dur = 0.1;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
    const node = audioCtx.createGain();
    node.gain.value = 0.1;
    node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function init() {
    const arraySize = parseInt(document.getElementById("arraySize").value);
    array = [];
    for (let i = 0; i < arraySize; i++) {
        array[i] = Math.random();
    }
    updateArraySizeLabel();
    showBars();
}

function updateArraySizeLabel() {
    const arraySize = document.getElementById("arraySize").value;
    document.getElementById("arraySizeLabel").textContent = arraySize;
}

function play(sortingAlgorithm) {
    const copy = [...array];
    const moves = sortingAlgorithm(copy);
    animate(moves);
}

function animate(moves) {
    if (moves.length === 0) {
        showBars();
        return;
    }
    requestAnimationFrame(() => {
        const move = moves.shift();
        const [i, j] = move.indices;

        if (move.type === "swap") {
            [array[i], array[j]] = [array[j], array[i]];
        } else if (move.type === "overwrite") {
            array[i] = move.value;
        }

        playNote(200 + array[i] * 500);
        if (j !== undefined) playNote(200 + array[j] * 500);

        showBars(move);
        setTimeout(() => {
            animate(moves);
        }, 200);
    });
}

function bubbleSort(array) {
    const moves = [];
    let swapped;
    for (let i = 0; i < array.length - 1; i++) {
        swapped = false;
        for (let j = 0; j < array.length - 1 - i; j++) {
            moves.push({ indices: [j, j + 1], type: "comp" });
            if (array[j] > array[j + 1]) {
                swapped = true;
                moves.push({ indices: [j, j + 1], type: "swap" });
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
            }
        }
        if (!swapped) break; // early termination when already sorted
    }
    return moves;
}

function mergeSort(array) {
    const moves = [];
    mergeSortHelper(array, 0, array.length - 1, moves);
    return moves;
}

function mergeSortHelper(array, start, end, moves) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    mergeSortHelper(array, start, mid, moves);
    mergeSortHelper(array, mid + 1, end, moves);
    merge(array, start, mid, end, moves);
}

function merge(array, start, mid, end, moves) {
    const left = array.slice(start, mid + 1);
    const right = array.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
        moves.push({ indices: [k, start + i, mid + 1 + j], type: "comp" });
        if (left[i] <= right[j]) {
            moves.push({ indices: [k], type: "overwrite", value: left[i] });
            array[k++] = left[i++];
        } else {
            moves.push({ indices: [k], type: "overwrite", value: right[j] });
            array[k++] = right[j++];
        }
    }
    while (i < left.length) {
        moves.push({ indices: [k], type: "overwrite", value: left[i] });
        array[k++] = left[i++];
    }
    while (j < right.length) {
        moves.push({ indices: [k], type: "overwrite", value: right[j] });
        array[k++] = right[j++];
    }
}

function quickSort(array) {
    const moves = [];
    quickSortHelper(array, 0, array.length - 1, moves);
    return moves;
}

function quickSortHelper(array, low, high, moves) {
    if (low < high) {
        const pi = partition(array, low, high, moves);
        quickSortHelper(array, low, pi - 1, moves);
        quickSortHelper(array, pi + 1, high, moves);
    }
}

function partition(array, low, high, moves) {
    const pivot = array[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        moves.push({ indices: [j, high], type: "comp" });
        if (array[j] < pivot) {
            i++;
            moves.push({ indices: [i, j], type: "swap" });
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    moves.push({ indices: [i + 1, high], type: "swap" });
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    return i + 1;
}

function showBars(move) {
    const container = document.getElementById("container");
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");
        if (move && move.indices.includes(i)) {
            bar.style.backgroundColor =
                move.type === "swap" ? "red" : "blue";
        }
        fragment.appendChild(bar);
    }
    container.appendChild(fragment);
}

// Event listeners
document.getElementById("init").addEventListener("click", init);
document.getElementById("playBubbleSort").addEventListener("click", () => play(bubbleSort));
document.getElementById("playMergeSort").addEventListener("click", () => play(mergeSort));
document.getElementById("playQuickSort").addEventListener("click", () => play(quickSort));
document.getElementById("arraySize").addEventListener("input", updateArraySizeLabel);
document.getElementById("arraySize").addEventListener("change", init);

// Initialize the array on page load
init();
