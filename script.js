document.addEventListener("DOMContentLoaded", () => {
    swapContent('.box4', '.box5');
    saveOriginalContent();
    calculateOvalArea(10, 5);
    handleWordCountCookie();
    initAlignmentHandler();
    initBlockEditing();
});

const originalBlockContents = {};

function saveOriginalContent() {
    for (let blockNumber = 1; blockNumber <= 7; blockNumber++) {
        const blockElement = document.querySelector(`.box${blockNumber}`);
        if (blockElement) {
            originalBlockContents[`box${blockNumber}`] = getCleanHTML(blockElement);
        }
    }
}

function getCleanHTML(blockElement) {
    if (!blockElement) return '';
    const clonedBlock = blockElement.cloneNode(true);
    const temporaryPanels = clonedBlock.querySelectorAll('.js-panel, .area-result');
    temporaryPanels.forEach(panel => panel.remove());
    return clonedBlock.innerHTML.trim();
}

function swapContent(firstSelector, secondSelector) {
    const firstBlock = document.querySelector(firstSelector);
    const secondBlock = document.querySelector(secondSelector);
    if (firstBlock && secondBlock) {
        const tempContent = firstBlock.innerHTML;
        firstBlock.innerHTML = secondBlock.innerHTML;
        secondBlock.innerHTML = tempContent;
    }
}

function calculateOvalArea(radiusX, radiusY) {
    const calculatedArea = (Math.PI * radiusX * radiusY).toFixed(2);
    const block3 = document.querySelector('.box3');
    if (block3) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'area-result';
        resultDiv.innerHTML = `S овалу (a=${radiusX}, b=${radiusY}) = ${calculatedArea}`;
        block3.insertBefore(resultDiv, block3.firstChild);
    }
}

function handleWordCountCookie() {
    const cookieKey = 'wordCountResult';
    const savedValue = getCookie(cookieKey);
    const block3 = document.querySelector('.box3');

    if (savedValue) {
        setTimeout(() => {
            if (confirm(`У cookies знайдено: "${savedValue}".\nВидалити?`)) {
                deleteCookie(cookieKey);
                location.reload();
            } else {
                alert("Перезавантажте сторінку.");
            }
        }, 200);
    } else {
        const panel = document.createElement('div');
        panel.className = 'js-panel';
        panel.innerHTML = `
            <h4>3. Підрахунок слів</h4>
            <textarea id="wordInput" rows="1" placeholder="Текст..."></textarea>
            <button onclick="countWords()">Рахувати</button>
        `;
        block3.appendChild(panel);
    }
}

window.countWords = function () {
    const inputText = document.getElementById('wordInput').value.trim();
    if (!inputText) return alert("Введіть текст!");
    const wordCount = inputText.split(/\s+/).length;
    const message = `Слів: ${wordCount}`;
    setCookie('wordCountResult', message, 7);
    alert(message);
    if (confirm("Збережено. Оновити сторінку?")) location.reload();
};

function initAlignmentHandler() {
    const controlBlock = document.querySelector('.box6');

    if (controlBlock && !document.getElementById('alignPanel')) {
        const alignmentPanel = document.createElement('div');
        alignmentPanel.id = 'alignPanel';
        alignmentPanel.className = 'js-panel';
        alignmentPanel.innerHTML = `
            <h4>4. Вирівнювання</h4>
            <label><input type="checkbox" id="chk3"> Блок 3</label><br>
            <label><input type="checkbox" id="chk4"> Блок 4</label><br>
            <label><input type="checkbox" id="chk5"> Блок 5</label>
        `;
        controlBlock.appendChild(alignmentPanel);
    }

    [3, 4, 5].forEach(blockNumber => {
        const targetBlock = document.querySelector(`.box${blockNumber}`);
        const storageKey = `alignBox${blockNumber}`;

        function applyLeftAlignment() {
            targetBlock.style.textAlign = 'left';

            if (blockNumber === 3) {
                targetBlock.style.alignItems = 'flex-start';
            } else {
                targetBlock.style.textAlign = 'left';
            }
        }

        function removeAlignment() {
            targetBlock.style.textAlign = '';
            targetBlock.style.alignItems = '';
            targetBlock.style.justifyContent = '';
        }

        if (localStorage.getItem(storageKey) === 'left') {
            applyLeftAlignment();
            setTimeout(() => {
                const checkbox = document.getElementById(`chk${blockNumber}`);
                if (checkbox) checkbox.checked = true;
            }, 50);
        }

        if (targetBlock.dataset.alignListener === "true") return;

        targetBlock.addEventListener('dblclick', () => {
            const checkbox = document.getElementById(`chk${blockNumber}`);
            if (checkbox && checkbox.checked) {
                applyLeftAlignment();
                localStorage.setItem(storageKey, 'left');
            } else {
                removeAlignment();
                localStorage.removeItem(storageKey);
            }
        });

        targetBlock.dataset.alignListener = "true";
    });
}

function initBlockEditing() {
    const block3 = document.querySelector('.box3');

    if (document.getElementById('editorToolsPanel')) return;

    const toolsPanel = document.createElement('div');
    toolsPanel.id = 'editorToolsPanel';
    toolsPanel.className = 'js-panel';
    toolsPanel.style.marginTop = '15px';

    toolsPanel.innerHTML = `
        <h4>5. Редагування блоків</h4>
        <p style="font-size:12px; color:blue;">Виділіть текст пункту списку мишкою:</p>
        <ol id="editSelectorList" style="padding-left:25px; margin-bottom:10px;"></ol>
        <hr>
        <div id="restoreButtonsArea"></div>
    `;

    block3.appendChild(toolsPanel);

    const selectorList = toolsPanel.querySelector('#editSelectorList');
    for (let i = 1; i <= 7; i++) {
        if (i === 3) continue;
        const listItem = document.createElement('li');
        listItem.innerText = `Редагувати Блок ${i}`;
        listItem.setAttribute('data-block-number', i);
        listItem.style.cursor = 'text';
        selectorList.appendChild(listItem);
    }

    selectorList.addEventListener('mouseup', () => {
        const currentSelection = window.getSelection();
        if (currentSelection.isCollapsed) return;

        const anchorNode = currentSelection.anchorNode;
        const clickedListItem = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;

        if (clickedListItem && clickedListItem.tagName === 'LI' && clickedListItem.parentElement === selectorList) {
            const blockNumber = clickedListItem.getAttribute('data-block-number');
            openEditForm(blockNumber);
            currentSelection.removeAllRanges();
        }
    });

    applySavedEdits();
    renderRestoreButtons();
}

function openEditForm(blockNumber) {
    const targetBlock = document.querySelector(`.box${blockNumber}`);
    if (targetBlock.querySelector('textarea')) return;

    const cleanHTML = getCleanHTML(targetBlock);
    targetBlock.innerHTML = '';

    const editForm = document.createElement('div');
    editForm.className = 'js-panel';
    editForm.style.background = '#f9f9f9';
    editForm.innerHTML = `
        <b>Редактор Блоку ${blockNumber}</b><br>
        <textarea id="editArea${blockNumber}" style="width:98%; height:80px;">${cleanHTML}</textarea><br>
        <button onclick="saveBlock(${blockNumber})">Зберегти</button>
        <button onclick="cancelEdit(${blockNumber})" style="background:#bbb;">Скасувати</button>
    `;
    targetBlock.appendChild(editForm);
}

window.saveBlock = function (blockNumber) {
    const newContent = document.getElementById(`editArea${blockNumber}`).value;
    localStorage.setItem(`editBlock_${blockNumber}`, newContent);

    const targetBlock = document.querySelector(`.box${blockNumber}`);
    targetBlock.innerHTML = newContent;
    targetBlock.style.fontStyle = 'italic';

    renderRestoreButtons();

    if (blockNumber == 3) initBlockEditing();
    if (blockNumber == 6) initAlignmentHandler();
};

window.cancelEdit = function (blockNumber) {
    const savedContent = localStorage.getItem(`editBlock_${blockNumber}`);
    const targetBlock = document.querySelector(`.box${blockNumber}`);

    if (savedContent) {
        targetBlock.innerHTML = savedContent;
        targetBlock.style.fontStyle = 'italic';
    } else {
        if (originalBlockContents[`box${blockNumber}`]) {
            targetBlock.innerHTML = originalBlockContents[`box${blockNumber}`];
            targetBlock.style.fontStyle = 'normal';
        }
    }

    if (blockNumber == 3) initBlockEditing();
    if (blockNumber == 6) initAlignmentHandler();
};

window.restoreOriginal = function (blockNumber) {
    localStorage.removeItem(`editBlock_${blockNumber}`);
    const targetBlock = document.querySelector(`.box${blockNumber}`);

    if (originalBlockContents[`box${blockNumber}`]) {
        targetBlock.innerHTML = originalBlockContents[`box${blockNumber}`];
    }
    targetBlock.style.fontStyle = 'normal';

    renderRestoreButtons();

    if (blockNumber == 3) initBlockEditing();
    if (blockNumber == 6) initAlignmentHandler();
};

function applySavedEdits() {
    for (let i = 1; i <= 7; i++) {
        const savedContent = localStorage.getItem(`editBlock_${i}`);
        if (savedContent) {
            const targetBlock = document.querySelector(`.box${i}`);
            targetBlock.innerHTML = savedContent;
            targetBlock.style.fontStyle = 'italic';
        }
    }
}

function renderRestoreButtons() {
    const container = document.getElementById('restoreButtonsArea');
    if (!container) return;

    container.innerHTML = '';

    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '4px'; 

    let hasEdits = false;

    for (let i = 1; i <= 7; i++) {
        if (localStorage.getItem(`editBlock_${i}`)) {
            hasEdits = true;
            const restoreBtn = document.createElement('button');
            restoreBtn.innerText = `Відновити Блок ${i}`;

            restoreBtn.style.background = '#ffcccc';
            restoreBtn.style.padding = '4px 8px';
            restoreBtn.style.cursor = 'pointer';
            restoreBtn.style.borderRadius = '4px';

            restoreBtn.onclick = () => restoreOriginal(i);
            container.appendChild(restoreBtn);
        }
    }

    if (!hasEdits) {
        container.innerHTML = '<span style="color:#777; font-size:11px;">Немає змінених блоків</span>';
    }
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 864e5));
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + date.toUTCString() + ";path=/";
}

function getCookie(name) {
    const match = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
}
